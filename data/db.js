const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5500;
const uri = 'mongodb+srv://mati:clapper123@reeutil.f0n5a.mongodb.net/';
app.use(cors());
app.use(express.json());
app.post('/conectar', async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conexión exitosa a MongoDB Atlas');
    res.json({ message: 'Conexión exitosa a MongoDB Atlas' });
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error);
    res.status(500).json({ message: 'Error al conectar a MongoDB Atlas' });
  } 
});
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

console.log(`Estado de la conexión: ${mongoose.connection.readyState}`);
