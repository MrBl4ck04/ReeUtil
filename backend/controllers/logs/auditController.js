const AuditLog = require('../../models/AuditLog');

// GET /api/logs
// Filtros: type, userType, email, start, end, page, limit
exports.getLogs = async (req, res) => {
  try {
    const { type, userType, email, start, end, page = 1, limit = 20, sort = 'desc' } = req.query;

    const filter = {};
    if (type) filter.type = { $in: String(type).split(',') };
    if (userType) filter.userType = userType;
    if (email) filter.email = new RegExp(String(email), 'i');
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = sort === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
      status: 'success',
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
