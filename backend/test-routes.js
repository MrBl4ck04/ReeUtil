const express = require('express');
const employeesRoutes = require('./routes/employees');

const app = express();
app.use(express.json());

// Registrar rutas
app.use('/api/employees', employeesRoutes);

// Listar todas las rutas registradas
function showRoutes(stack, prefix = '') {
  stack.forEach(middleware => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      console.log(`${prefix}${middleware.route.path} [${methods.join(', ').toUpperCase()}]`);
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      const routerPrefix = prefix + (middleware.regexp.source.match(/\\\/(.+?)(?:\\|$)/) ? '/' + middleware.regexp.source.match(/\\\/(.+?)(?:\\|$)/)[1] : '');
      showRoutes(middleware.handle.stack, routerPrefix);
    }
  });
}

console.log('✓ Rutas registradas:');
showRoutes(app._router.stack);

// Iniciar servidor
app.listen(5500, () => {
  console.log('✓ Servidor de prueba en puerto 5500');
});
