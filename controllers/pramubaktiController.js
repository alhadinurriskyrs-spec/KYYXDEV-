const { Pramubakti, User, Attendance, Task, Performance } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', unit_kerja = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nama: { [Op.like]: `%${search}%` } },
        { nik: { [Op.like]: `%${search}%` } },
        { unit_kerja: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (unit_kerja) where.unit_kerja = unit_kerja;

    const { count, rows } = await Pramubakti.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }],
      limit: parseInt(limit),
      offset,
      order: [['nama', 'ASC']]
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
    const pramubakti = await Pramubakti.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] },
        { model: Attendance, as: 'attendanceRecords', limit: 10, order: [['tanggal', 'DESC']] },
        { model: Task, as: 'taskRecords', limit: 10, order: [['tanggal', 'DESC']] },
        { model: Performance, as: 'performanceRecords', limit: 5, order: [['tahun', 'DESC'], ['bulan', 'DESC']] }
      ]
    });

    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    res.json({ success: true, data: pramubakti });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    const pramubakti = await Pramubakti.findOne({
      where: { user_id: req.params.userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }]
    });

    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    res.json({ success: true, data: pramubakti });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { user_id, nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_hp, email, jabatan, unit_kerja, tanggal_masuk, status, foto, foto_ktp } = req.body;

    const existingNik = await Pramubakti.findOne({ where: { nik } });
    if (existingNik) {
      return res.status(400).json({ success: false, message: 'NIK sudah terdaftar' });
    }

    const pramubakti = await Pramubakti.create({
      user_id, nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_hp, email, jabatan, unit_kerja, tanggal_masuk, status: status || 'Aktif', foto, foto_ktp, created_by: req.user.id
    });

    res.status(201).json({ success: true, message: 'Data pramubakti berhasil ditambahkan', data: pramubakti });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const pramubakti = await Pramubakti.findByPk(req.params.id);
    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    const { nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_hp, email, jabatan, unit_kerja, tanggal_masuk, status, foto, foto_ktp } = req.body;

    if (nik && nik !== pramubakti.nik) {
      const existing = await Pramubakti.findOne({ where: { nik } });
      if (existing) return res.status(400).json({ success: false, message: 'NIK sudah terdaftar' });
    }

    await pramubakti.update({ nik, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nomor_hp, email, jabatan, unit_kerja, tanggal_masuk, status, foto, foto_ktp });

    res.json({ success: true, message: 'Data pramubakti berhasil diperbarui', data: pramubakti });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const pramubakti = await Pramubakti.findByPk(req.params.id);
    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    await pramubakti.destroy();
    res.json({ success: true, message: 'Data pramubakti berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Pramubakti.count();
    const aktif = await Pramubakti.count({ where: { status: 'Aktif' } });
    const nonaktif = await Pramubakti.count({ where: { status: 'Nonaktif' } });
    const cuti = await Pramubakti.count({ where: { status: 'Cuti' } });

    const unitKerja = await Pramubakti.findAll({
      attributes: ['unit_kerja', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'jumlah']],
      group: ['unit_kerja']
    });

    res.json({
      success: true,
      data: { total, aktif, nonaktif, cuti, unitKerja }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
