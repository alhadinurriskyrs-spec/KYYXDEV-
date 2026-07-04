const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token otentikasi tidak ditemukan' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bps_pramubakti_secret_key_2024');
      
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Pengguna tidak ditemukan' 
        });
      }

      if (!user.is_active) {
        return res.status(401).json({ 
          success: false, 
          message: 'Akun tidak aktif' 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token sudah kadaluarsa' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Token tidak valid' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan pada autentikasi' 
    });
  }
};

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Autentikasi diperlukan' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Anda tidak memiliki akses ke fitur ini' 
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
