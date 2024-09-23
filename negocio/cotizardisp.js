const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone'); 

// Definición del esquema de cotización
const cotizarSchema = new mongoose.Schema({
    cotizacion: { type: Number, default: null }, 
    detalles: String,
    estadoCotizaci: { type: String, default: 'En Curso' }, 
    estadoDisposit: String,
    fecha: { type: Date, default: Date.now }, 
    idCatalogo: { type: Number, default: null }, 
    idUsuario: { type: Number, default: null }, 
    imagen: String 
}, {
  versionKey: false 
});

// Plugin para auto-incrementar el campo idDispositivo
cotizarSchema.plugin(AutoIncrement, { inc_field: 'idDispositivo' });

// Definir el modelo de cotización
const Cotizacion = mongoose.model('dispositivos', cotizarSchema);

// Función para enviar la cotización
const env = async (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body);
  
    const { detalles, estado, idCatalogo, idUsuario } = req.body;
  
    if (!detalles || !estado) {
      console.log('Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
  
    try {
      const fechaLocal = moment().tz('America/La_Paz').toDate(); 

      const enviarcot = new Cotizacion({
        detalles: detalles,
        estadoDisposit: estado,
        fecha: fechaLocal, 
        idCatalogo: idCatalogo,
        idUsuario: idUsuario,
        imagen: 'sadas' // Imagen predeterminada (esto puede cambiar según tus necesidades)
      });
  
      await enviarcot.save();
  
      console.log('Guardado exitosamente en MongoDB');
      res.status(200).json({ message: 'Dispositivo registrado con éxito' });
  
    } catch (err) {
      console.error('Error al guardar en MongoDB:', err);
      res.status(500).json({ error: 'Error al guardar en MongoDB' });
    }
};

// Función para obtener todas las solicitudes de cotización
const obtenerSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Cotizacion.find({}); // Obtiene todas las cotizaciones
    res.status(200).json(solicitudes); // Envía las cotizaciones en formato JSON
  } catch (err) {
    console.error('Error al obtener las solicitudes:', err);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
};

// Función para actualizar la cotización de un dispositivo
const actualizarCotizacion = async (req, res) => {
  const { idDispositivo, cotizacion } = req.body;

  if (!idDispositivo || cotizacion === undefined) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Busca el dispositivo por su id y actualiza los campos cotizacion y estadoCotizaci
    const dispositivoActualizado = await Cotizacion.findOneAndUpdate(
      { idDispositivo: idDispositivo }, // Busca por idDispositivo
      { $set: { cotizacion: cotizacion, estadoCotizaci: 'Pendiente' } }, // Actualiza cotizacion y estadoCotizaci
      { new: true } // Retorna el documento actualizado
    );

    if (!dispositivoActualizado) {
      return res.status(404).json({ error: 'Dispositivo no encontrado' });
    }

    console.log('Cotización y estado actualizados:', dispositivoActualizado);
    res.status(200).json({ message: 'Cotización y estado actualizados exitosamente', dispositivo: dispositivoActualizado });
  } catch (err) {
    console.error('Error al actualizar la cotización:', err);
    res.status(500).json({ error: 'Error al actualizar la cotización' });
  }
};

// Exportar las funciones y el modelo Cotizacion
module.exports = {
  Cotizacion,  // Exportar el modelo de Cotizacion para ser usado en server.js
  env,
  obtenerSolicitudes,
  actualizarCotizacion
};
