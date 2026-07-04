const { Announcement, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', kategori = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    const today = new Date().toISOString().split('T')[0];

    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { konten: { [Op.like]: `%${search}%` } }
      ];
    }
    if (kategori) where.kategori = kategori;

    where[Op.or] = [
      { tgl_selesai: { [Op.gte]: today } },
      { tgl_selesai: null }
    ];

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      limit: parseInt(limit),
      offset,
      order: [['is_pinned', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }]
    });

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { judul, konten, kategori, lampiran, tgl_mulai, tgl_selesai, is_pinned } = req.body;

    if (!judul || !konten) {
      return res.status(400).json({ success: false, message: 'Judul dan konten harus diisi' });
    }

    const announcement = await Announcement.create({
      judul,
      konten,
      kategori: kategori || 'Umum',
      lampiran,
      tgl_mulai: tgl_mulai || new Date().toISOString().split('T')[0],
      tgl_selesai,
      is_pinned: is_pinned || false,
      created_by: req.user.id
    });

    // Send notification to all active users
    const users = await User.findAll({ where: { is_active: true, role: { [Op.ne]: 'admin' } } });
    for (const user of users) {
      await Notification.create({
        user_id: user.id,
        judul: 'Pengumuman Baru',
        pesan: judul,
        jenis: 'pengumuman',
        data: { announcement_id: announcement.id },
        link: `/pengumuman/${announcement.id}`
      });
    }

    res.status(201).json({ success: true, message: 'Pengumuman berhasil dibuat', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }

    const { judul, konten, kategori, lampiran, tgl_mulai, tgl_selesai, is_pinned, is_active } = req.body;

    await announcement.update({
      judul, konten, kategori, lampiran, tgl_mulai, tgl_selesai, is_pinned, is_active
    });

    res.json({ success: true, message: 'Pengumuman berhasil diperbarui', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }

    await announcement.destroy();
    res.json({ success: true, message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Pengumuman tidak ditemukan' });
    }

    await announcement.update({ is_pinned: !announcement.is_pinned });
    res.json({ success: true, message: 'Status pin berhasil diubah', data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
