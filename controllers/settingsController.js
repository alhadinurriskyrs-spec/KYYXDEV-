const { Setting } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const settings = await Setting.findAll({ order: [['grup', 'ASC'], ['key', 'ASC']] });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Pengaturan tidak ditemukan' });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { key, value, type, grup, description } = req.body;
    
    let setting = await Setting.findOne({ where: { key } });
    
    if (setting) {
      await setting.update({ value, type, grup, description });
    } else {
      setting = await Setting.create({ key, value, type: type || 'string', grup: grup || 'umum', description });
    }

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui', data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: req.params.key } });
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Pengaturan tidak ditemukan' });
    }
    await setting.destroy();
    res.json({ success: true, message: 'Pengaturan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getByGroup = async (req, res) => {
  try {
    const { grup } = req.params;
    const settings = await Setting.findAll({ where: { grup }, order: [['key', 'ASC']] });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
