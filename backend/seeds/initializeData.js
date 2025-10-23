const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PermissionModule = require('../models/PermissionModule');
const Role = require('../models/Role');

dotenv.config();

// Módulos del sistema
const modules = [
  {
    moduleId: 'rules',
    nombre: 'Reglas',
    display: 'Gestión de Reglas',
    description: 'Gestión de reglas del sistema',
    icon: 'BookOpen',
    orden: 1,
  },
  {
    moduleId: 'repairs',
    nombre: 'Reparaciones',
    display: 'Gestión de Reparaciones',
    description: 'Gestión de solicitudes de reparación',
    icon: 'Wrench',
    orden: 2,
  },
  {
    moduleId: 'recycle',
    nombre: 'Reciclaje',
    display: 'Gestión de Reciclaje',
    description: 'Gestión de solicitudes de reciclaje',
    icon: 'Recycle',
    orden: 3,
  },
  {
    moduleId: 'dashboards',
    nombre: 'Dashboards',
    display: 'Ver Dashboards',
    description: 'Visualización de estadísticas',
    icon: 'BarChart3',
    orden: 4,
  },
  {
    moduleId: 'sales',
    nombre: 'Ventas',
    display: 'Administrar Ventas',
    description: 'Gestión de ventas en el marketplace',
    icon: 'ShoppingCart',
    orden: 5,
  },
  {
    moduleId: 'satisfaction',
    nombre: 'Satisfacción',
    display: 'Satisfacción Cliente',
    description: 'Gestión de reseñas y calificaciones',
    icon: 'Star',
    orden: 6,
  },
  {
    moduleId: 'employees',
    nombre: 'Empleados',
    display: 'ABM Empleados',
    description: 'Gestión de empleados',
    icon: 'Users',
    orden: 7,
  },
  {
    moduleId: 'users',
    nombre: 'Usuarios',
    display: 'ABM Usuarios',
    description: 'Gestión de usuarios',
    icon: 'User',
    orden: 8,
  },
  {
    moduleId: 'osi',
    nombre: 'OSI',
    display: 'Gestión OSI',
    description: 'Gestión de permisos (solo para OSI)',
    icon: 'Shield',
    orden: 9,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');

    // Limpiar datos existentes
    await PermissionModule.deleteMany({});
    await Role.deleteMany({});
    console.log('✓ Base de datos limpiada');

    // Insertar módulos
    const createdModules = await PermissionModule.insertMany(modules);
    console.log(`✓ ${createdModules.length} módulos creados`);

    // Obtener IDs de módulos para los roles
    const allModuleIds = createdModules.map((m) => m._id);

    // Crear roles del sistema
    const roles = [
      {
        nombre: 'Administrador',
        description: 'Acceso total a todos los módulos',
        permissions: allModuleIds,
        isSystem: true,
      },
      {
        nombre: 'Gerente',
        description: 'Gestión general del negocio',
        permissions: allModuleIds.filter((_, i) =>
          [0, 1, 2, 3, 4, 5].includes(i)
        ),
        isSystem: true,
      },
      {
        nombre: 'Técnico',
        description: 'Solo gestión de reparaciones',
        permissions: [allModuleIds[1]],
        isSystem: true,
      },
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log(`✓ ${createdRoles.length} roles creados`);

    console.log('\n✓ Base de datos inicializada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error al inicializar la BD:', err.message);
    process.exit(1);
  }
};

seedDatabase();
