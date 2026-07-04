const jwt = require('jsonwebtoken');
const { User, Pramubakti, Notification } = require('../models');
const { Op } = require('sequelize');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'bps_pramubakti_secret_key_2024',
    { expiresIn: '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
    }

    user.last_login = new Date();
    if (remember_me) {
      user.remember_token = generateToken(user);
    }
    await user.save();

    const token = generateToken(user);

    // Buat notifikasi login
    await Notification.create({
      user_id: user.id,
      judul: 'Login Berhasil',
      pesan: `Anda berhasil masuk ke sistem pada ${new Date().toLocaleString('id-ID')}`,
      jenis: 'system'
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: user.toJSON(),
        token,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'pramubakti'
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await Notification.create({
      user_id: req.user.id,
      judul: 'Logout Berhasil',
      pesan: `Anda keluar dari sistem pada ${new Date().toLocaleString('id-ID')}`,
      jenis: 'system'
    });

    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat logout'
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data'
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak cocok'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password lama salah'
      });
    }

    user.password = new_password;
    await user.save();

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah password'
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan'
    });
  }
};
