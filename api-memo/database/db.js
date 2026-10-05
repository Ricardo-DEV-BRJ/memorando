const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('Conexión exitosa a la base de datos');
        conn.release();
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

module.exports = pool;