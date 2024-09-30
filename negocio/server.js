const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const formidable = require('formidable');
const path = require('path'); // Importar el módulo path
const app = express();
const fs = require('fs');
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

// Middleware para habilitar CORS
app.use(cors());

// Importar las rutas de usuario
const usuarioNegocio = require('./usuarioNegocio');

// Ruta para registrar usuarios
app.post('/register', usuarioNegocio.registrarUsuario);

// Ruta para login de usuarios
app.post('/login', usuarioNegocio.loginUsuario);

// Hacer que la carpeta uploads sea accesible públicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para registrar dispositivos
app.post('/registerDevice', (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, 'uploads'); // Directorio donde se suben los archivos
  form.keepExtensions = true; // Mantener la extensión del archivo

  form.parse(req, async (err, fields, files) => {
      if (err) {
          console.error("Error al procesar el formulario:", err);
          res.status(500).json({ error: 'Error al procesar el formulario de imagen' });
          return;
      }

      // Depuración: mostrar los campos y archivos recibidos
      console.log("Campos recibidos:", fields);
      console.log("Archivos recibidos:", files);

      const nombre = fields.nombre[0];
      const descripcion = fields.descripcion[0];
      const marca = fields.marca[0];
      const modelo = fields.modelo[0];
      const tipo = fields.tipo[0];

      // Verificar si se recibió un archivo y acceder al primer archivo
      let rutaImagen = null;
      if (Array.isArray(files.imagenProdu) && files.imagenProdu.length > 0) {
          const archivo = files.imagenProdu[0]; // Obtener el primer archivo

          // Guardar la imagen con su nombre original en la carpeta uploads
          rutaImagen = path.join(__dirname, 'uploads', archivo.originalFilename); // Ruta completa

          // Renombrar el archivo subido a su nombre original
          fs.renameSync(archivo.filepath, rutaImagen); // Mover el archivo a la carpeta uploads
          console.log("Ruta de la imagen guardada:", rutaImagen); // Mostrar la ruta de la imagen
      } else {
          console.log("No se recibió ninguna imagen");
      }

      // Guardar el dispositivo en la base de datos
      const nuevoDispositivo = new Catalogo({
          nombre,
          descripcion,
          marca,
          modelo,
          tipo,
          imagenProdu: rutaImagen // Guardar la ruta de la imagen
      });

      try {
          await nuevoDispositivo.save();
          console.log("Dispositivo guardado con éxito");
          res.status(200).json({ message: 'Dispositivo registrado con éxito' });
      } catch (error) {
          console.error("Error al guardar el dispositivo:", error);
          res.status(500).json({ error: 'Error al guardar el dispositivo' });
      }
  });
});


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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
