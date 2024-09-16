const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const formidable = require('formidable');
const path = require('path'); // Importar el módulo path
const app = express();
const port = 5500;

// Middleware para manejar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Importar las rutas de usuario
const usuarioNegocio = require('./usuarioNegocio');

// Ruta para registrar usuarios
app.post('/register', usuarioNegocio.registrarUsuario);

// Ruta para login de usuarios
app.post('/login', usuarioNegocio.loginUsuario);

// Ruta para registrar dispositivos
const newDispos = require('./newDispos');
app.post('/registerDevice', newDispos.registrarDispositivo);

// Ruta para sacar catalogo
const cata= require('./catalogoClientes'); 
app.get('/obteCatalogo', cata.obtenerCatalogo);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Importar modelo del catálogo
const Catalogo = require('./catalogo');

// Ruta para obtener los datos del catálogo (GET)
app.get('/catalogo', async (req, res) => {
  try {
    const catalogo = await Catalogo.find({});
    res.json(catalogo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos del catálogo' });
  }
});

// Ruta para eliminar un dispositivo del catálogo (DELETE)
app.delete('/catalogo/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dispositivoEliminado = await Catalogo.findByIdAndDelete(id);

    if (!dispositivoEliminado) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }

    res.status(200).json({ message: 'Dispositivo eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el dispositivo:', error);
    res.status(500).json({ error: 'Error al eliminar el dispositivo' });
  }
});
