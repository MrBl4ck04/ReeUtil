const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar el token de autenticación
exports.verifyToken = (req, res, next) => {
  try {
    // Obtener token del header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      // Buscar el usuario en la base de datos
      try {
        const user = await User.findOne({ idUsuario: decoded.idUsuario });
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        // Agregar datos del usuario al request
        req.user = {
          idUsuario: user.idUsuario,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol
        };

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error al verificar el usuario',
          error: error.message
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar el token',
      error: error.message
    });
  }
};

// Middleware para verificar si el usuario es administrador
exports.isAdmin = (req, res, next) => {
  if (!req.user.rol) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
  next();
};
