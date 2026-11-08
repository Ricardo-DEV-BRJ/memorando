const db = require('../database/db.js');

// Un memorando está relacionado con un departamento si este lo emite, lo recibe o hace de vigilancia,
// sin importar el estado del memorando. Un departamento con memorandos relacionados no se puede eliminar.
const condicionRelacionado = (alias) => `(${alias}.id_dep = ? OR ${alias}.pa_quien = ? OR ${alias}.vigilancia = ?)`;

function errorHttp(status, message) {
  return { status, message };
}

function validarDatos(data) {
  const nombre_dep = String(data.nombre_dep ?? '').trim();
  const email = String(data.email ?? '').trim();
  if (!nombre_dep) {
    throw errorHttp(400, 'El nombre del departamento es obligatorio');
  }
  if (nombre_dep.length > 100) {
    throw errorHttp(400, 'El nombre del departamento no puede superar los 100 caracteres');
  }
  if (email && !/.+@.+\..+/.test(email)) {
    throw errorHttp(400, 'El correo electrónico no es válido');
  }
  return { nombre_dep, email };
}

// Busca el valor de una columna del Excel/CSV sin importar mayúsculas.
// Los nombres se revisan en orden de prioridad y se toma el primero que tenga valor.
function valorColumna(fila, nombres) {
  const claves = Object.keys(fila);
  for (const nombre of nombres) {
    const clave = claves.find((k) => k.trim().toLowerCase() === nombre);
    const valor = clave ? String(fila[clave] ?? '').trim() : '';
    if (valor) return valor;
  }
  return undefined;
}

class departamentosModel {

  all() {
    return new Promise(async (resolve, reject) => {
      const sql = `
      SELECT d.id_dep, d.nombre_dep, d.email,
        COALESCE(p.total_personal, 0) AS total_personal,
        COALESCE(mm.total_memos, 0) AS total_memos,
        CASE WHEN COALESCE(mm.total_memos, 0) = 0 THEN 1 ELSE 0 END AS eliminable
      FROM departamentos d
      LEFT JOIN (
        SELECT id_dep, COUNT(*) AS total_personal
        FROM responsable
        WHERE eliminado = 1
        GROUP BY id_dep
      ) p ON p.id_dep = d.id_dep
      LEFT JOIN (
        -- Un memorando cuenta una sola vez aunque el departamento sea emisor y destinatario
        SELECT x.id_dep, COUNT(DISTINCT x.id) AS total_memos
        FROM (
          SELECT id, id_dep FROM memorando
          UNION ALL
          SELECT id, pa_quien FROM memorando
          UNION ALL
          SELECT id, vigilancia FROM memorando
        ) x
        WHERE x.id_dep IS NOT NULL
        GROUP BY x.id_dep
      ) mm ON mm.id_dep = d.id_dep
      WHERE d.dep_eli = 1
      ORDER BY d.nombre_dep ASC
      `;
      try {
        const [rows] = await db.query(sql);
        resolve({ status: 200, data: rows, message: 'Datos obtenidos con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  memosRelacionados(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT COUNT(*) AS total FROM memorando m WHERE ${condicionRelacionado('m')}`;
      try {
        const [rows] = await db.query(sql, [id, id, id]);
        resolve(Number(rows[0].total));
      } catch (error) {
        reject(error);
      }
    });
  }

  buscar(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await db.query('SELECT id_dep, nombre_dep FROM departamentos WHERE id_dep = ? AND dep_eli = 1', [id]);
        if (rows.length === 0) {
          return reject(errorHttp(404, 'El departamento no existe o fue eliminado'));
        }
        resolve(rows[0]);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Evita departamentos vigentes (no eliminados) con el mismo nombre
  validarNombreUnico(nombre_dep, idExcluir = null) {
    return new Promise(async (resolve, reject) => {
      let sql = 'SELECT id_dep FROM departamentos WHERE LOWER(TRIM(nombre_dep)) = LOWER(?) AND dep_eli = 1';
      const valores = [nombre_dep];
      if (idExcluir) {
        sql += ' AND id_dep <> ?';
        valores.push(idExcluir);
      }
      try {
        const [rows] = await db.query(sql, valores);
        if (rows.length > 0) {
          return reject(errorHttp(409, `Ya existe un departamento llamado "${nombre_dep}"`));
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const { nombre_dep, email } = validarDatos(data);
        await this.validarNombreUnico(nombre_dep);
        await db.query('INSERT INTO departamentos (nombre_dep, email) VALUES (?,?)', [nombre_dep, email || null]);
        resolve({ status: 201, data: [], message: 'Departamento creado con éxito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  agregarDepartamentos(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let departamentos;
        try {
          departamentos = JSON.parse(data.lista);
        } catch {
          return reject(errorHttp(400, 'La lista de departamentos no es válida'));
        }
        if (!Array.isArray(departamentos)) {
          return reject(errorHttp(400, 'La lista de departamentos no es válida'));
        }
        const errores = [];
        const items = [];
        const filaPorNombre = new Map();
        departamentos.forEach((fila, i) => {
          const numero = i + 2; // fila del Excel (la 1 es el encabezado)
          // Si las columnas tienen otros nombres: el nombre es el primer valor que no es un correo
          const valores = Object.values(fila || {}).map((v) => String(v ?? '').trim()).filter(Boolean);
          if (valores.length === 0) return; // fila vacía
          const nombre = String(valorColumna(fila, ['nombre_dep', 'departamento', 'nombre'])
            ?? valores.find((v) => !v.includes('@')) ?? '').trim();
          const email = String(valorColumna(fila, ['email', 'correo', 'correo electrónico', 'correo electronico'])
            ?? valores.find((v) => /.+@.+\..+/.test(v)) ?? '').trim();
          if (!nombre) {
            errores.push(`Fila ${numero}: falta el nombre del departamento`);
            return;
          }
          if (nombre.length > 100) {
            errores.push(`Fila ${numero}: el nombre no puede superar los 100 caracteres`);
          }
          if (email && !/.+@.+\..+/.test(email)) {
            errores.push(`Fila ${numero}: el correo "${email}" no es válido`);
          }
          const clave = nombre.toLowerCase();
          if (filaPorNombre.has(clave)) {
            errores.push(`Fila ${numero}: "${nombre}" está repetido (fila ${filaPorNombre.get(clave)})`);
          } else {
            filaPorNombre.set(clave, numero);
          }
          items.push([nombre, email || null]);
        });
        if (items.length === 0 && errores.length === 0) {
          return reject(errorHttp(400, 'La lista no contiene departamentos'));
        }
        // Departamentos vigentes que ya tienen ese nombre
        const nombres = [...filaPorNombre.keys()];
        if (nombres.length) {
          const [existentes] = await db.query(
            'SELECT nombre_dep FROM departamentos WHERE dep_eli = 1 AND LOWER(TRIM(nombre_dep)) IN (?)', [nombres]
          );
          existentes.forEach((d) => {
            const clave = d.nombre_dep.trim().toLowerCase();
            errores.push(`Fila ${filaPorNombre.get(clave)}: ya existe un departamento llamado "${d.nombre_dep}"`);
          });
        }
        if (errores.length) {
          // Ordenados por fila para corregir el archivo de arriba hacia abajo
        errores.sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)));
        const resumen = errores.length === 1 ? 'Hay 1 error' : `Hay ${errores.length} errores`;
          return reject({ ...errorHttp(400, `No se agregó ningún departamento. ${resumen} en el archivo`), errores });
        }
        await db.query('INSERT INTO departamentos (nombre_dep, email) VALUES ?', [items]);
        const total = items.length;
        resolve({ status: 201, data: [], message: `${total} ${total === 1 ? 'departamento agregado' : 'departamentos agregados'} con éxito` });
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const { nombre_dep, email } = validarDatos(data);
        await this.buscar(id);
        await this.validarNombreUnico(nombre_dep, id);
        await db.query('UPDATE departamentos SET nombre_dep = ?, email = ? WHERE id_dep = ?', [nombre_dep, email || null, id]);
        resolve({ status: 200, data: [], message: 'Departamento actualizado con éxito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Eliminación lógica: solo se permite si el departamento no tiene memorandos relacionados (en cualquier estado)
  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const departamento = await this.buscar(id);
        const relacionados = await this.memosRelacionados(id);
        if (relacionados > 0) {
          return reject(errorHttp(409, `No se puede eliminar ${departamento.nombre_dep}: tiene ${relacionados} memorando${relacionados === 1 ? '' : 's'} relacionado${relacionados === 1 ? '' : 's'}`));
        }
        await db.query('UPDATE departamentos SET dep_eli = 0 WHERE id_dep = ?', [id]);
        resolve({ status: 200, data: [], message: 'Departamento eliminado con éxito' });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = departamentosModel;
