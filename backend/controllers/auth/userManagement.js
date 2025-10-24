const User = require('../../models/User');

// Listar todos los usuarios (clientes)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name lastName motherLastName email loginAttempts isBlocked telefono direccion');
    // Adaptar al shape esperado por el frontend (nombre/apellido)
    const adapted = users.map(u => ({
      _id: u._id,
      nombre: u.name,
      apellido: u.lastName,
      apellidoMaterno: u.motherLastName,
      email: u.email,
      telefono: u.telefono || null,
      direccion: u.direccion || null,
      loginAttempts: u.loginAttempts || 0,
      isBlocked: !!u.isBlocked,
    }));
    return res.status(200).json(adapted);
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Listar usuarios bloqueados
const getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ isBlocked: true }).select('name lastName motherLastName email loginAttempts isBlocked telefono direccion');
    const adapted = users.map(u => ({
      _id: u._id,
      nombre: u.name,
      apellido: u.lastName,
      apellidoMaterno: u.motherLastName,
      email: u.email,
      telefono: u.telefono || null,
      direccion: u.direccion || null,
      loginAttempts: u.loginAttempts || 0,
      isBlocked: !!u.isBlocked,
    }));
    return res.status(200).json(adapted);
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Endpoint para desbloquear una cuenta (uso administrativo)
const unblockAccount = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Se requiere el ID del usuario.'
      });
    }

    // Actualizar sin disparar middleware de validación
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false, loginAttempts: 0, blockedAt: null },
      { new: true, runValidators: false }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cuenta desbloqueada exitosamente.',
      user: {
        idUsuario: user._id,
        email: user.email,
        isBlocked: user.isBlocked,
        loginAttempts: user.loginAttempts
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Desbloquear usuario por ID (y resetear intentos)
const unblockUserById = async (req, res) => {
  try {
    console.log('BODY recibido en /auth/unblock-account:', req.body);   //  ←  temporal
    const { userId } = req.body;
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false, loginAttempts: 0, blockedAt: null },
      { new: true, runValidators: false }
    );
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Bloquear usuario por ID (ban)
const blockUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true, blockedAt: new Date() },
      { new: true, runValidators: false }
    );
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Endpoint para verificar estado de bloqueo de una cuenta
const checkBlockedStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Se requiere el email del usuario.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        email: user.email,
        isBlocked: user.isBlocked,
        loginAttempts: user.loginAttempts,
        blockedAt: user.blockedAt
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Búsqueda de usuarios por nombre (para reseñas)
const searchUsersByName = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Debes ingresar al menos 2 caracteres para buscar'
      });
    }

    // Buscar usuarios por nombre completo (name, lastName, motherLastName)
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { motherLastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } }
      ]
    })
      .select('_id name lastName motherLastName email userId')
      .limit(10); // Limitar a 10 resultados

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getBlockedUsers,
  unblockAccount,
  unblockUserById,
  blockUserById,
  checkBlockedStatus,
  searchUsersByName
};
