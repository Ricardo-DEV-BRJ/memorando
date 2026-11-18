const db = require('../database/db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// ---- Carga masiva de personal desde Excel/CSV ----
const MAX_FILAS = 500;
const ROLES = { responsable: 2, administrador: 1, admin: 1, becado: 0, '2': 2, '1': 1, '0': 0 };

// "Cédula", "CEDULA " y "cedula" se tratan igual: minúsculas, sin acentos ni símbolos
function normalizar(texto) {
  return String(texto ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Nombres de columna aceptados para cada campo (ya normalizados)
const COLUMNAS = {
  nombre: ['nombre', 'nombres'],
  apellido: ['apellido', 'apellidos'],
  cedula: ['cedula', 'ci', 'documento'],
  email_resp: ['correo', 'email', 'email_resp', 'correo_institucional', 'correo_electronico'],
  rol: ['rol', 'permisos', 'permiso'],
  departamento: ['departamento', 'id_dep', 'nombre_dep'],
  clave: ['clave_inicial', 'clave', 'contrasena', 'contrasena_inicial', 'password'],
};

function leerFila(fila) {
  const valores = {};
  for (const [columna, valor] of Object.entries(fila || {})) {
    valores[normalizar(columna)] = String(valor ?? '').trim();
  }
  const resultado = {};
  for (const [campo, alias] of Object.entries(COLUMNAS)) {
    resultado[campo] = alias.map((a) => valores[a]).find((v) => v) || '';
  }
  return resultado;
}

class responsablesModel {

  // Devuelve el rol vigente del usuario logueado: { superAdmin, id_dep }
  permisos(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = `SELECT l.permisos, l.per_super, r.id_dep
        FROM login l
        INNER JOIN responsable r ON r.id = l.id_responsable
        WHERE l.id_responsable = ?`;
        const [rows] = await db.query(sql, [user_id]);

        if (rows.length === 0) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        if (rows[0].permisos === 0 || rows[0].permisos === 2 || rows[0].permisos == null) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        resolve({ superAdmin: rows[0].per_super == 1, id_dep: rows[0].id_dep });
      } catch (error) {
        reject(error);
      }
    });
  }

  // El administrador de un departamento solo puede gestionar al personal de su propio departamento.
  // El superadministrador puede gestionar a cualquiera. Devuelve el departamento actual del usuario objetivo.
  verificarAlcance(rol, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await db.query('SELECT id_dep FROM responsable WHERE id = ?', [id]);
        if (rows.length === 0) {
          return reject({ message: 'El usuario no existe', status: 404 });
        }
        if (!rol.superAdmin && rows[0].id_dep != rol.id_dep) {
          return reject({ message: 'Solo puedes gestionar al personal de tu departamento', status: 403 });
        }
        resolve(rows[0].id_dep);
      } catch (error) {
        reject(error);
      }
    });
  }

  all(id_dep) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT r.id, r.nombre,r.apellido, r.cedula, r.firma, r.email_resp, d.nombre_dep as departamento, d.id_dep, r.eliminado 
      FROM responsable r 
      INNER JOIN login l ON r.id = l.id_responsable
      INNER JOIN departamentos d ON d.id_dep = r.id_dep 
      WHERE l.permisos <> 0 AND r.id_dep = ?`
      // Solo departamentos vigentes como destinatarios de memorandos
      const sql2 = `SELECT id_dep, nombre_dep, email FROM departamentos WHERE dep_eli = 1 ORDER BY nombre_dep ASC`
      try {
        const [rows] = await db.query(sql, [id_dep]);
        const [dep] = await db.query(sql2);
        if (rows.length > 0) {
          resolve({ status: 200, data: rows, dep: dep, message: 'Consulta con exito' });
        } else {
          resolve({ status: 200, data: rows, dep: dep, message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getOne(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const sql = 'SELECT * FROM responsable WHERE id = ?';
      const valores = [id];
      try {
        const [rows] = await db.query(sql, valores);
        if (rows.length > 0) {
          resolve({ status: 200, data: rows, message: 'Consulta con exito' });
        } else {
          resolve({ status: 200, data: rows, message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  create(data, id_log, user_departamento) {
    return new Promise(async (resolve, reject) => {
      let rol;
      try {
        rol = await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }

      const { nombre, apellido, cedula, firma, email_resp, id_dep } = data;
      // Solo el superadministrador puede elegir el departamento; el administrador agrega personal a su departamento
      const departamentoAdmin = rol.id_dep ?? user_departamento;
      const departamento = rol.superAdmin && id_dep ? id_dep : departamentoAdmin;
      const sqlRespo = 'INSERT INTO responsable (nombre, apellido, cedula, firma, email_resp, id_dep) VALUES (?,?,?,?,?,?)';
      const valores = [nombre, apellido, cedula, firma, email_resp, departamento];

      const hashedPass = await bcrypt.hash(data.clave, saltRounds);
      const sqlLogin = 'INSERT INTO login (id_responsable, cedula, clave, permisos, change_pass) VALUES (?, ?, ?, ?, ?)';
      let per = 2
      if (data.permisos) {
        per = data.permisos
      }

      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(sqlRespo, valores);
        const id_responsable = result.insertId;
        const params = [id_responsable, data.cedula, hashedPass, per, data.change_pass ? 1 : 0];
        await connection.query(sqlLogin, params);
        await connection.commit();
        resolve({ status: 201, data: [], message: 'Creado con exito' });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
      }
    });
  }

  // Carga masiva: se valida todo el archivo y se guarda todo o nada.
  // Cada usuario recibe acceso al sistema y debe cambiar su contraseña al primer ingreso.
  createMultiple(data, id_log, user_departamento) {
    return new Promise(async (resolve, reject) => {
      let rol;
      try {
        rol = await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }

      let filas;
      try {
        filas = JSON.parse(data.lista);
      } catch {
        return reject({ status: 400, message: 'La lista de personal no es válida' });
      }
      if (!Array.isArray(filas) || filas.length === 0) {
        return reject({ status: 400, message: 'La lista no contiene personal' });
      }
      if (filas.length > MAX_FILAS) {
        return reject({ status: 400, message: `El archivo no puede tener más de ${MAX_FILAS} usuarios` });
      }

      // Solo el superadministrador elige el departamento; el administrador agrega personal a su departamento
      const departamentoAdmin = rol.id_dep ?? user_departamento;
      const errores = [];
      const usuarios = [];
      const filaPorCedula = new Map();

      try {
        const [departamentos] = await db.query('SELECT id_dep, nombre_dep FROM departamentos WHERE dep_eli = 1');
        const depPorNombre = new Map(departamentos.map((d) => [normalizar(d.nombre_dep), d.id_dep]));
        const depPorId = new Map(departamentos.map((d) => [String(d.id_dep), d.id_dep]));

        filas.forEach((fila, i) => {
          const numero = i + 2; // fila del Excel (la 1 es el encabezado)
          const r = leerFila(fila);
          if (!r.nombre && !r.apellido && !r.cedula && !r.email_resp) return; // fila vacía

          const faltan = [['nombre', 'nombre'], ['apellido', 'apellido'], ['cedula', 'cédula'], ['email_resp', 'correo']]
            .filter(([campo]) => !r[campo]).map(([, etiqueta]) => etiqueta);
          if (faltan.length) {
            errores.push(`Fila ${numero}: falta ${faltan.join(', ')}`);
            return;
          }

          const cedula = r.cedula.replace(/^[VvEe]\s*-?\s*/, '').replace(/[.\s]/g, '');
          if (!/^\d+$/.test(cedula)) {
            errores.push(`Fila ${numero}: la cédula "${r.cedula}" solo debe tener números`);
          } else if (filaPorCedula.has(cedula)) {
            errores.push(`Fila ${numero}: la cédula ${cedula} está repetida (fila ${filaPorCedula.get(cedula)})`);
          } else {
            filaPorCedula.set(cedula, numero);
          }

          if (!/.+@.+\..+/.test(r.email_resp)) {
            errores.push(`Fila ${numero}: el correo "${r.email_resp}" no es válido`);
          }

          const permisos = r.rol ? ROLES[normalizar(r.rol)] : 2;
          if (permisos === undefined) {
            errores.push(`Fila ${numero}: el rol "${r.rol}" no existe (usa Responsable, Administrador o Becado)`);
          }

          let id_dep = departamentoAdmin;
          if (rol.superAdmin && r.departamento) {
            id_dep = depPorId.get(r.departamento) ?? depPorNombre.get(normalizar(r.departamento));
            if (!id_dep) {
              errores.push(`Fila ${numero}: el departamento "${r.departamento}" no existe`);
            }
          }

          usuarios.push({ numero, nombre: r.nombre, apellido: r.apellido, cedula, email_resp: r.email_resp, permisos, id_dep, clave: r.clave });
        });

        if (usuarios.length === 0 && errores.length === 0) {
          return reject({ status: 400, message: 'La lista no contiene personal' });
        }

        // Cédulas que ya existen en el sistema
        const cedulas = [...filaPorCedula.keys()];
        if (cedulas.length) {
          const [existentes] = await db.query(
            'SELECT cedula FROM responsable WHERE cedula IN (?) UNION SELECT cedula FROM login WHERE cedula IN (?)',
            [cedulas, cedulas]
          );
          existentes.forEach((e) => {
            errores.push(`Fila ${filaPorCedula.get(String(e.cedula))}: la cédula ${e.cedula} ya está registrada`);
          });
        }
      } catch (error) {
        return reject(error);
      }

      if (errores.length) {
        // Ordenados por fila para corregir el archivo de arriba hacia abajo
        errores.sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)));
        const resumen = errores.length === 1 ? 'Hay 1 error' : `Hay ${errores.length} errores`;
        return reject({ status: 400, message: `No se agregó ningún usuario. ${resumen} en el archivo`, errores });
      }

      const connection = await db.getConnection();
      try {
        // Si no se indica una clave inicial, la contraseña es la cédula
        const claves = await Promise.all(usuarios.map((u) => bcrypt.hash(u.clave || u.cedula, saltRounds)));
        await connection.beginTransaction();
        const sqlRespo = 'INSERT INTO responsable (nombre, apellido, cedula, email_resp, id_dep) VALUES (?,?,?,?,?)';
        const sqlLogin = 'INSERT INTO login (id_responsable, cedula, clave, permisos, change_pass) VALUES (?, ?, ?, ?, 1)';
        for (const [i, u] of usuarios.entries()) {
          const [result] = await connection.query(sqlRespo, [u.nombre, u.apellido, u.cedula, u.email_resp, u.id_dep]);
          await connection.query(sqlLogin, [result.insertId, u.cedula, claves[i], u.permisos]);
        }
        await connection.commit();
        const total = usuarios.length;
        resolve({ status: 201, data: [], message: `${total} ${total === 1 ? 'usuario agregado' : 'usuarios agregados'} con éxito` });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
      }
    });
  }

  update(id, data, id_log) {
    return new Promise(async (resolve, reject) => {
      let departamentoActual;
      let rol;
      try {
        rol = await this.permisos(id_log);
        departamentoActual = await this.verificarAlcance(rol, id);
      } catch (error) {
        return reject(error);
      }
      const { nombre, apellido, cedula, firma, email_resp, id_dep, permisos } = data;
      // Solo el superadministrador puede cambiar el departamento de un usuario
      const departamento = rol.superAdmin && id_dep ? id_dep : departamentoActual;
      const sql = 'UPDATE responsable SET nombre = ? , apellido = ? , cedula = ? , firma = ? , email_resp = ? , id_dep = ? WHERE id = ?';
      const valores = [nombre, apellido, cedula, firma, email_resp, departamento, id];
      const sqlLogin = 'UPDATE login SET permisos = ? WHERE id_responsable = ?';
      const valoresLogin = [permisos, id];
      try {
        await db.query(sql, valores);
        await db.query(sqlLogin, valoresLogin);
        resolve({ status: 200, data: [], message: 'Actualizado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  perfil(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT r.id, r.nombre, r.apellido, r.cedula, r.email_resp, r.firma, d.nombre_dep AS departamento
      FROM responsable r
      LEFT JOIN departamentos d ON d.id_dep = r.id_dep
      WHERE r.id = ?`;
      try {
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        resolve({ status: 200, data: rows[0], message: 'Consulta con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Solo permite al usuario logueado corregir sus propios datos personales y su firma
  actualizarPerfil(id, data) {
    return new Promise(async (resolve, reject) => {
      const nombre = data.nombre?.trim();
      const apellido = data.apellido?.trim();
      const email_resp = data.email_resp?.trim();
      const { firma } = data;
      if (!nombre || !apellido || !email_resp) {
        return reject({ message: 'El nombre, el apellido y el correo son obligatorios', status: 400 });
      }
      if (!/.+@.+\..+/.test(email_resp)) {
        return reject({ message: 'El correo electrónico no es válido', status: 400 });
      }
      if (firma && !firma.startsWith('data:image/')) {
        return reject({ message: 'La firma debe ser una imagen', status: 400 });
      }

      // La firma solo se actualiza si se envía una nueva
      const sql = `UPDATE responsable SET nombre = ?, apellido = ?, email_resp = ?${firma ? ', firma = ?' : ''} WHERE id = ?`;
      const valores = firma ? [nombre, apellido, email_resp, firma, id] : [nombre, apellido, email_resp, id];
      const sqlUser = `SELECT r.id, r.nombre, r.apellido, r.cedula, r.id_dep, l.permisos, l.per_super AS super_admin, l.change_pass
      FROM responsable r
      INNER JOIN login l ON l.id_responsable = r.id
      WHERE r.id = ?`;
      try {
        const [result] = await db.query(sql, valores);
        if (result.affectedRows === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        const [rows] = await db.query(sqlUser, [id]);
        const { permisos, change_pass, ...responsable } = rows[0];
        resolve({ status: 200, message: 'Perfil actualizado con éxito', responsable, permisos, change_pass });
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        const rol = await this.permisos(id_log);
        await this.verificarAlcance(rol, id);
      } catch (error) {
        return reject(error);
      }
      const sql = 'UPDATE responsable SET eliminado = 0 WHERE id = ?';
      const valores = [id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Inactivado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  activar(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        const rol = await this.permisos(id_log);
        await this.verificarAlcance(rol, id);
      } catch (error) {
        return reject(error);
      }
      const sql = 'UPDATE responsable SET eliminado = 1 WHERE id = ?';
      const valores = [id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Activado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = responsablesModel;