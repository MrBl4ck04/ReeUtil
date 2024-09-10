const http = require('http');
const fs = require('fs');
const url = require('url');
const { Pool } = require('pg');

// Conectar con PostgreSQL
const pool = new Pool({
    user: 'postgres',  // Cambia esto a tu usuario de pgAdmin
    host: 'localhost',
    database: 'reeutil',
    password: 'admin', // Cambia esto a tu contraseña
    port: 5432
});

// Función para manejar las solicitudes HTTP
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/') {
        fs.readFile('./view/login.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error al cargar la página');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST' && pathname === '/register') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const nombre = params.get('txt');
            const apellido = params.get('apellido');
            const email = params.get('email');
            const pswd = params.get('pswd');
            const direccion = params.get('direccion');
            const telefono = params.get('telefono');
            const rol = params.get('rol') ? true : false;  // Asume rol como booleano
    
            console.log('Datos recibidos para registro:', nombre, apellido, email, pswd, direccion, telefono, rol);
    
            const queryText = `INSERT INTO usuario (nombre, apellido, email, contraseña, direccion, telefono, rol) 
                               VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`;
    
            pool.query(queryText, [nombre, apellido, email, pswd, direccion, telefono, rol], (err, result) => {
                if (err) {
                    console.error('Error al insertar en la base de datos', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error al registrar usuario');
                } else {
                    console.log('Usuario registrado con ID:', result.rows[0].id_usuario);
                    res.writeHead(302, { 'Location': './view/login.html' });  // Redirige al index
                    res.end();
                }
            });
        });
    } else if (req.method === 'POST' && pathname === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const email = params.get('email');
            const pswd = params.get('pswd');

            const queryText = `SELECT * FROM usuario WHERE email = $1 AND contraseña = $2`;
            pool.query(queryText, [email, pswd], (err, result) => {
                if (err || result.rows.length === 0) {
                    res.writeHead(401, { 'Content-Type': 'text/plain' });
                    res.end('Credenciales incorrectas');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(`Bienvenido, ${result.rows[0].nombre}`);
                }
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Página no encontrada');
    }
};

const server = http.createServer(requestHandler);

server.listen(5500, () => {
    console.log('Servidor corriendo en http://127.0.0.1/:5500');
});