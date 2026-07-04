const { Notification } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (is_read !== '') where.is_read = is_read === 'true';

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });

    res.json({
      success: true,
      data: rows,
      unread: unreadCount,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
    }

    await notification.update({ is_read: true });
    res.json({ success: true, message: 'Notifikasi telah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({ success: true, message: 'Semua notifikasi telah dibaca' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' });
    }

    await notification.destroy();
    res.json({ success: false, message: 'Notifikasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    await Notification.destroy({ where: { user_id: req.user.id } });
    res.json({ success: true, message: 'Semua notifikasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
