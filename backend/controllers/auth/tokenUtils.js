const jwt = require('jsonwebtoken');

// Función para generar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Función para crear y enviar token (usuarios cliente)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Enviar respuesta
  res.status(statusCode).json({
    status: 'success',
    access_token: token,
    user: {
      idUsuario: user._id,
      nombre: user.name,
      apellido: user.lastName || '',
      apellidoMaterno: user.motherLastName || '',
      genero: user.gender || '',
      userId: user.userId,
      email: user.email,
      rol: user.role,
      loginAttempts: user.loginAttempts || 0,
      isBlocked: user.isBlocked || false
    }
  });
};

module.exports = {
  signToken,
  createSendToken
};
