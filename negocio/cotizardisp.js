const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone'); 

const cotizarSchema = new mongoose.Schema({
    cotizacion: { type: Number, default: null }, 
    detalles: String,
    estadoCotizaci: { type: String, default: 'En Curso'}, 
    estadoDisposit: String,
    fecha: { type: Date, default: Date.now }, 
    idCatalogo: { type: Number, default: null }, 
    idUsuario: { type: Number, default: null }, 
    imagen: String 
}, {
  versionKey: false 
});

cotizarSchema.plugin(AutoIncrement, { inc_field: 'idDispositivo' });

const Cotizacion = mongoose.model('dispositivos', cotizarSchema);

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
        imagen: 'sadas' 
      });
  
      await enviarcot.save();
  
      console.log('Guardado exitosamente en MongoDB');
      res.status(200).json({ message: 'Dispositivo registrado con éxito' });
  
    } catch (err) {
      console.error('Error al guardar en MongoDB:', err);
      res.status(500).json({ error: `Error al registrar el dispositivo: ${err.message}` });
    }
};

module.exports = {
  env
};
