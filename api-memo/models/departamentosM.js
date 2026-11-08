const db = require('../database/db.js');

// Un memorando está activo mientras no llegue a un estado final.
// Los memorandos sin estado (recién creados) también se consideran activos.
const ESTADOS_FINALES = ['recibido', 'completado', 'anulado'];
const condicionActivo = (alias) =>
  `(${alias}.estado IS NULL OR LOWER(TRIM(${alias}.estado)) NOT IN (${ESTADOS_FINALES.map(() => '?').join(', ')}))`;

// Un departamento participa en un memorando como emisor, destinatario o vigilancia
const condicionParticipa = (alias) => `(${alias}.id_dep = ? OR ${alias}.pa_quien = ? OR ${alias}.vigilancia = ?)`;

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
        COALESCE(mm.memos_activos, 0) AS memos_activos,
        CASE WHEN COALESCE(mm.memos_activos, 0) = 0 THEN 1 ELSE 0 END AS eliminable
      FROM departamentos d
      LEFT JOIN (
        SELECT id_dep, COUNT(*) AS total_personal
        FROM responsable
        WHERE eliminado = 1
        GROUP BY id_dep
      ) p ON p.id_dep = d.id_dep
      LEFT JOIN (
        SELECT x.id_dep,
          COUNT(DISTINCT x.id) AS total_memos,
          COUNT(DISTINCT CASE WHEN x.activo = 1 THEN x.id END) AS memos_activos
        FROM (
          SELECT m.id, m.id_dep, ${condicionActivo('m')} AS activo FROM memorando m
          UNION ALL
          SELECT m.id, m.pa_quien, ${condicionActivo('m')} FROM memorando m
          UNION ALL
          SELECT m.id, m.vigilancia, ${condicionActivo('m')} FROM memorando m
        ) x
        WHERE x.id_dep IS NOT NULL
        GROUP BY x.id_dep
      ) mm ON mm.id_dep = d.id_dep
      WHERE d.dep_eli = 1
      ORDER BY d.nombre_dep ASC
      `;
      try {
        const [rows] = await db.query(sql, [...ESTADOS_FINALES, ...ESTADOS_FINALES, ...ESTADOS_FINALES]);
        resolve({ status: 200, data: rows, message: 'Datos obtenidos con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  memosActivos(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT COUNT(*) AS total FROM memorando m WHERE ${condicionParticipa('m')} AND ${condicionActivo('m')}`;
      try {
        const [rows] = await db.query(sql, [id, id, id, ...ESTADOS_FINALES]);
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

  // Evita departamentos activos con el mismo nombre
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
        const items = departamentos
          .map((fila) => {
            // Si las columnas tienen otros nombres: el nombre es el primer valor que no es un correo
            const valores = Object.values(fila).map((v) => String(v ?? '').trim()).filter(Boolean);
            const nombre = valorColumna(fila, ['nombre_dep', 'departamento', 'nombre'])
              ?? valores.find((v) => !v.includes('@'));
            const email = valorColumna(fila, ['email', 'correo', 'correo electrónico', 'correo electronico'])
              ?? valores.find((v) => /.+@.+\..+/.test(v));
            return [String(nombre ?? '').trim(), String(email ?? '').trim() || null];
          })
          .filter(([nombre]) => nombre);
        if (items.length === 0) {
          return reject(errorHttp(400, 'La lista no contiene departamentos'));
        }
        await db.query('INSERT INTO departamentos (nombre_dep, email) VALUES ?', [items]);
        resolve({ status: 201, data: [], message: 'Departamentos creados con éxito' });
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

  // Eliminación lógica: solo se permite si el departamento no participa en memorandos activos
  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const departamento = await this.buscar(id);
        const activos = await this.memosActivos(id);
        if (activos > 0) {
          return reject(errorHttp(409, `No se puede eliminar ${departamento.nombre_dep}: tiene ${activos} memorando${activos === 1 ? '' : 's'} activo${activos === 1 ? '' : 's'}`));
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
