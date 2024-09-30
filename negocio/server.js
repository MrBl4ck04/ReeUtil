const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const formidable = require('formidable');
const path = require('path'); // Importar el módulo path
const app = express();
const port = 5500;
const { Types } = require('mongoose'); // Agregar esta línea al principio
const { ObjectId } = require('mongodb');
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

// Middleware para habilitar CORS
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

// Ruta para sacar catálogo
const cata = require('./catalogoClientes'); 
app.get('/obteCatalogo', cata.obtenerCatalogo);

// Ruta para sacar cotizaciones pendientes
const coti = require('./obtenercoti'); 
app.get('/obteCoti', coti.obtenercoti);

// Ruta para solicitar Evaluación
const cot = require('./cotizardisp');
app.post('/envcotizacion', cot.env);

// Ruta para obtener todas las solicitudes de cotización
app.get('/solicitudes', cot.obtenerSolicitudes);

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

// Ruta para obtener los tipos únicos de la colección
app.get('/tipos', async (req, res) => {
  try {
    const tipos = await Catalogo.distinct('tipo'); 
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los tipos' });
  }
});

const Dispositivo = require('./dispositivo');

// Ruta para obtener los datos del catálogo junto con los dispositivos asociados (GET)
app.get('/inventario', async (req, res) => {
  const { tipo, estado } = req.query; 
  try {
    const query = tipo ? { tipo } : {};
    const catalogo = await Catalogo.find(query).lean(); 
    let resultado = [];
    for (const item of catalogo) {
      let dispositivoQuery = { idCatalogo: item.idCatalogo };
      if (estado) {
        dispositivoQuery.estadoCotizaci = estado; 
      }
      else {
        dispositivoQuery.estadoCotizaci = { $in: ['Para reciclar', 'Para vender'] };
      }
      const dispositivosRelacionados = await Dispositivo.find(dispositivoQuery).lean();
        dispositivosRelacionados.forEach(dispositivo => {
          resultado.push({
            idCatalogo: item.idCatalogo,
            nombre: item.nombre,
            marca: item.marca,
            tipo: item.tipo,
            idDispositivo: dispositivo.idDispositivo,
            estadoCotizaci: dispositivo.estadoCotizaci
          });
        });
    }
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos del catálogo y dispositivos' });
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

// Ruta para modificar un dispositivo del catálogo (PUT)
app.put('/catalogo/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, marca, modelo, tipo, imagenProdu } = req.body;

  try {
    const dispositivoActualizado = await Catalogo.findByIdAndUpdate(
      id, 
      { nombre, descripcion, marca, modelo, tipo, imagenProdu },
      { new: true }
    );

    if (!dispositivoActualizado) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }

    res.status(200).json({ message: 'Dispositivo actualizado con éxito', dispositivo: dispositivoActualizado });
  } catch (error) {
    console.error('Error al actualizar el dispositivo:', error);
    res.status(500).json({ error: 'Error al actualizar el dispositivo' });
  }
});

// Importar el modelo Cotizacion de cotizardisp.js
const { Cotizacion } = require('./cotizardisp');

// Ruta para actualizar el estado del dispositivo (Para reciclar o Para vender)
app.post('/actualizarEstado', cot.actualizarEstadoDispositivo);


const Regla = require('./reglas'); // Importa el modelo de Reglas
let contadorReglas = 1; // Esto es solo un ejemplo, debes asegurarte de autoincrementar correctamente.

app.post('/reglas', async (req, res) => {
    const { idCatalogo, nombreRegla, descripcionRE } = req.body;

    try {
        const nuevaRegla = new Regla({
            idReglas: contadorReglas++, // Incrementa el contador
            nombreRegla,
            descripcionRE,
            idCatalogo,
        });

        await nuevaRegla.save();
        res.status(201).json({ message: 'Regla agregada exitosamente', regla: nuevaRegla });
    } catch (error) {
        console.error('Error al agregar la regla:', error);
        res.status(500).json({ error: 'Error al agregar la regla' });
    }
});

// Ruta para actualizar la cotización de un dispositivo
app.post('/actualizarCotizacionDP', async (req, res) => {
  const { id, estadoCotizaci } = req.body; // Obtenemos el ID y el nuevo estado

  console.log('ID recibido:', id); // Verificamos si el ID llega correctamente
  console.log('Estado recibido:', estadoCotizaci);

  try {
    // Buscar la cotización por su ID y actualizar su estado
    const cotizacionActualizada = await Cotizacion.findByIdAndUpdate(
      id, 
      { estadoCotizaci }, // Actualizamos solo el campo 'estadoCotizaci'
      { new: true } // Para que retorne la cotización actualizada
    );

    if (!cotizacionActualizada) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    res.status(200).json({ message: 'Estado de cotización actualizado correctamente', cotizacion: cotizacionActualizada });
  } catch (error) {
    console.error('Error al actualizar la cotización:', error);
    res.status(500).json({ error: 'Error al actualizar la cotización' });
  }
});


app.post('/actualizarCotizacion', async (req, res) => {
  const { idDispositivo, cotizacion, estadoCotizaci } = req.body; // Obtenemos los valores del body

  console.log('ID recibido:', idDispositivo);  // Verifica si el ID es recibido
  console.log('Cotización recibida:', cotizacion);
  console.log('Estado recibido:', estadoCotizaci);

  if (!idDispositivo || !cotizacion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Actualiza la cotización y el estado
    const cotizacionActualizada = await Cotizacion.findOneAndUpdate(
      { idDispositivo }, // Busca por idDispositivo
      { $set: { cotizacion, estadoCotizaci } }, // Actualiza cotización y estado
      { new: true } // Devuelve el documento actualizado
    );

    if (!cotizacionActualizada) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    res.status(200).json({ message: 'Cotización y estado actualizados exitosamente' });
  } catch (error) {
    console.error('Error al actualizar la cotización:', error);
    res.status(500).json({ error: 'Error al actualizar la cotización' });
  }
});
app.get('/reglas/:idCatalogo', async (req, res) => {
  const idCatalogo = req.params.idCatalogo; // Esto es un número

  try {
      // Primero, busca el catálogo por su id (numérico)
      const catalogo = await Catalogo.findOne({ idCatalogo: idCatalogo }); // Asegúrate de que 'Catalogo' sea tu modelo correcto

      if (!catalogo) {
          return res.status(404).send('Catálogo no encontrado');
      }

      // Ahora, busca las reglas usando el ObjectId del catálogo encontrado
      const reglas = await Regla.find({ idCatalogo: catalogo._id }); // Aquí usamos el ObjectId

      res.json(reglas);
  } catch (error) {
      console.error('Error al buscar reglas:', error);
      res.status(500).send('Error al buscar reglas');
  }
});




// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
