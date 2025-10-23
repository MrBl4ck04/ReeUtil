const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Función para generar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Función para crear y enviar token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Enviar respuesta
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email
      }
    }
  });
};

// Registro de usuario
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Verificar si se proporcionó email y password
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // 2) Verificar si el usuario existe y la contraseña es correcta
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos'
      });
    }

    // 3) Si todo está bien, enviar token al cliente
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
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

    // 3) Verificar si el usuario aún existe
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'El usuario al que pertenece este token ya no existe.'
      });
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