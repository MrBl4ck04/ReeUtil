const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Employee = require('../../models/Employee');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  try {
    // 1) Obtener token y verificar si existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No has iniciado sesión. Por favor inicia sesión para obtener acceso.'
      });
    }

    // 2) Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe (en cualquiera de las colecciones)
    let currentUser = await Employee.findById(decoded.id).populate('roleId');
    if (!currentUser) {
      currentUser = await User.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'El usuario al que pertenece este token ya no existe.'
      });
    }

    // Normalizar el campo role para ambos tipos de usuario
    if (!currentUser.role && currentUser.roleId) {
      // Es un Employee, asignar role desde roleId
      currentUser.role = currentUser.roleId.nombre || 'employee';
      currentUser.userType = 'employee';
    } else {
      // Es un User normal
      currentUser.userType = 'user';
    }

    // 4) Otorgar acceso a la ruta protegida
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'No autorizado: ' + err.message
    });
  }
};

// Middleware para restringir acceso solo a administradores
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Verificar si el usuario es un Employee (los empleados son admin)
    // Los Employee tienen 'roleId', los User normales tienen 'role'
    const isEmployee = req.user.roleId !== undefined;
    
    // Si es empleado, permitir acceso (los empleados son admin)
    if (isEmployee && roles.includes('admin')) {
      return next();
    }
    
    // Para usuarios normales, verificar el campo 'role'
    if (req.user.role && roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({
      status: 'fail',
      message: 'No tienes permisos para realizar esta acción'
    });
  };
};

module.exports = {
  protect,
  restrictTo
};
