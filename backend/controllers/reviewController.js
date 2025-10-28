const Review = require('../models/Review');
const User = require('../models/User');

// Obtener mis reseñas
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    console.log('🔍 getMyReviews - userId:', userId);
    
    const reviews = await Review.find({ autor: userId })
      .populate('destinatario', 'name email')  // Usar 'name' en lugar de 'nombre'
      .sort({ createdAt: -1 });
    
    console.log(`✅ Reseñas encontradas: ${reviews.length}`);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('❌ Error en getMyReviews:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener reseñas sobre un vendedor
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const reviews = await Review.find({ 
      destinatario: sellerId,
      visible: true
    })
      .populate('autor', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length).toFixed(2)
      : 0;

    res.status(200).json({
      status: 'success',
      totalReviews,
      averageRating: parseFloat(averageRating),
      data: {
        reviews
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Crear una reseña
exports.createReview = async (req, res) => {
  try {
    const { titulo, comentario, calificacion, tipo, destinatarioId, ventaId } = req.body;
    const userId = req.user?.id || req.user?._id;

    console.log('✅ POST /api/reviews - createReview');
    console.log('   Usuario:', userId);
    console.log('   Datos:', { titulo, comentario, calificacion, tipo, destinatarioId });

    // Validaciones
    if (!titulo || !comentario || !calificacion || !tipo || !destinatarioId) {
      console.log('❌ Faltan datos requeridos');
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporciona todos los campos requeridos'
      });
    }

    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    if (comentario.length < 10 || comentario.length > 1000) {
      return res.status(400).json({
        status: 'fail',
        message: 'El comentario debe tener entre 10 y 1000 caracteres'
      });
    }

    // No permitir reseñas a uno mismo
    if (userId.toString() === destinatarioId.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'No puedes dejar una reseña sobre ti mismo'
      });
    }

    // Verificar si el destinatario existe
    const destinatario = await User.findById(destinatarioId);
    if (!destinatario) {
      return res.status(404).json({
        status: 'fail',
        message: 'El usuario destinatario no existe'
      });
    }

    // Crear la reseña
    const review = await Review.create({
      autor: userId,
      destinatario: destinatarioId,
      titulo,
      comentario,
      calificacion,
      tipo,
      ventaId: ventaId || undefined
    });

    await review.populate('destinatario', 'nombre apellido foto');

    res.status(201).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Actualizar una reseña
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, comentario, calificacion } = req.body;
    const userId = req.user.id || req.user._id;

    // Verificar que la reseña existe y pertenece al usuario
    let review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Reseña no encontrada'
      });
    }

    if (review.autor.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para editar esta reseña'
      });
    }

    // Validaciones
    if (calificacion && (calificacion < 1 || calificacion > 5)) {
      return res.status(400).json({
        status: 'fail',
        message: 'La calificación debe estar entre 1 y 5'
      });
    }

    if (comentario && (comentario.length < 10 || comentario.length > 1000)) {
      return res.status(400).json({
        status: 'fail',
        message: 'El comentario debe tener entre 10 y 1000 caracteres'
      });
    }

    // Actualizar
    review = await Review.findByIdAndUpdate(
      id,
      { titulo, comentario, calificacion },
      { new: true, runValidators: true }
    ).populate('destinatario', 'nombre apellido foto');

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    // Verificar que la reseña existe y pertenece al usuario
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Reseña no encontrada'
      });
    }

    if (review.autor.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permiso para eliminar esta reseña'
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Reportar una reseña
exports.flagReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { razon } = req.body;
    const userId = req.user.id || req.user._id;

    if (!razon) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporciona la razón del reporte'
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        status: 'fail',
        message: 'Reseña no encontrada'
      });
    }

    // Agregar el reporte
    review.reportes.push({
      usuario: userId,
      razon
    });

    await review.save();

    res.status(200).json({
      status: 'success',
      message: 'Reporte enviado correctamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener todas las reseñas (admin)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('autor', 'name email')  // User usa 'name', no 'nombre'
      .populate('destinatario', 'name email')  // User usa 'name', no 'nombre'
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener estadísticas de reseñas (admin)
exports.getReviewsStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$calificacion' }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$calificacion',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalReviews,
        averageRating: avgRating[0]?.average || 0,
        ratingDistribution
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
