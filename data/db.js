const { Pool } = require('pg');

// Configura tu conexión a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'reeutil',
    password: 'admin',
    port: 5432, // Puerto por defecto de PostgreSQL
});

// Función para hacer consultas
const query = (text, params) => {
    return pool.query(text, params);
};

module.exports = { query };
