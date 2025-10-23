console.log('1. Intentando cargar rutas de empleados...');
try {
  const employeesRoutes = require('./routes/employees');
  console.log('✓ Rutas de empleados cargadas');
  console.log('Métodos disponibles:', Object.keys(employeesRoutes));
} catch (err) {
  console.error('✗ Error al cargar rutas de empleados:', err.message);
  console.error(err.stack);
}

console.log('\n2. Intentando cargar controlador de empleados...');
try {
  const employeeController = require('./controllers/employees/employeeController');
  console.log('✓ Controlador de empleados cargado');
  console.log('Funciones disponibles:', Object.keys(employeeController));
} catch (err) {
  console.error('✗ Error al cargar controlador:', err.message);
  console.error(err.stack);
}

console.log('\n3. Intentando cargar modelo Employee...');
try {
  const Employee = require('./models/Employee');
  console.log('✓ Modelo Employee cargado');
  console.log('Métodos del modelo:', typeof Employee.find, typeof Employee.create);
} catch (err) {
  console.error('✗ Error al cargar modelo:', err.message);
  console.error(err.stack);
}

console.log('\n✓ Todos los módulos se cargaron correctamente');
