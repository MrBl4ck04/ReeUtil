const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5500;

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Esto es importante para recibir datos de formularios

// URI de conexión a MongoDB Atlas
const uri = 'mongodb+srv://mati:clapper123@reeutil.f0n5a.mongodb.net/reeutil';

// Conexión a MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB Atlas:', error);
  });

// Middleware
app.use(cors());
app.use(express.json()); // Ya lo tienes, pero asegúrate de que esté aquí
app.use(express.urlencoded({ extended: true })); // Importante para manejar datos de formularios

// Ruta para registrar usuarios
const usuarioNegocio = require('./usuarioNegocio');
app.post('/register', usuarioNegocio.registrarUsuario);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
