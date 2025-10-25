const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');

dotenv.config();

const resetPassword = async (email, newPassword) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    const employee = await Employee.findOne({ email });
    if (!employee) {
      console.error('✗ Empleado no encontrado con email:', email);
      process.exit(1);
    }

    console.log('✓ Empleado encontrado:', employee.nombre, employee.apellido);
    
    // Asignar nueva contraseña (el middleware pre-save la encriptará automáticamente)
    employee.contraseA = newPassword;
    await employee.save();

    console.log('✓ Contraseña actualizada correctamente');
    console.log('  Email:', email);
    console.log('  Nueva contraseña:', newPassword);
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

// Uso: node scripts/resetEmployeePassword.js email@example.com nuevaContraseña
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Uso: node scripts/resetEmployeePassword.js <email> <contraseña>');
  console.error('Ejemplo: node scripts/resetEmployeePassword.js admin@reeutil.com MiContraseña123');
  process.exit(1);
}

resetPassword(email, password);
