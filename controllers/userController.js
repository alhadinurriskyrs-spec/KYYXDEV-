const { User, Pramubakti } = require('../models');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, is_active } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const user = await User.create({
      name, email, password, role: role || 'pramubakti', is_active: is_active !== false
    });

    res.status(201).json({ success: true, message: 'Pengguna berhasil dibuat', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, is_active } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
      }
    }

    await user.update({ name, email, role, is_active });

    res.json({ success: true, message: 'Pengguna berhasil diperbarui', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    await user.destroy();

    res.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({ name, photo });

    res.json({ success: true, message: 'Profil berhasil diperbarui', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
