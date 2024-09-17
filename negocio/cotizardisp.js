const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Definir el esquema de cotización
const cotizarSchema = new mongoose.Schema({
    cotizacion: { type: Number, default: null }, 
    detalles: String,
    estadoCotizaci: { type: String, default: null}, 
    estadoDisposit: String,
    fecha: Date, 
    idCatalogo: { type: Number, default: null }, 
    idUsuario: { type: Number, default: null }, 
    imagen: String 
}, {
  versionKey: false // Eliminar el campo __v
});

cotizarSchema.plugin(AutoIncrement, { inc_field: 'idDispositivo' });

const Cotizacion = mongoose.model('dispositivo', cotizarSchema);
const evadisp = async (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body);
  
    const { detalles, estado, fecha, idCatalogo,idUsuario} = req.body;
  
    // Verificar que todos los campos obligatorios se reciban correctamente
    if (!detalles || !estado || !fecha) {
      console.log('Faltan datos obligatorios');
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
  
    try {
      // Crear un nuevo objeto de Cotización con los datos recibidos
      const evaluacion = new Cotizacion({
        detalles: detalles,
        estadoDisposit: estado,
        fecha: new Date(fecha),
        idCatalogo: idCatalogo,
        idUsuario: idUsuario,
        imagen: 'sadas' // Aquí puedes poner la imagen real
      });
  
      console.log('Guardando en MongoDB:', evaluacion);
  
      // Guardar el nuevo documento en MongoDB
      await evaluacion.save();
  
      console.log('Guardado exitosamente en MongoDB');
      res.status(200).json({ message: 'Dispositivo registrado con éxito' });
  
    } catch (err) {
      console.error('Error al guardar en MongoDB:', err);
      res.status(500).json({ error: `Error al registrar el dispositivo: ${err.message}` });
    }
  };
module.exports = {
  evadisp
};
