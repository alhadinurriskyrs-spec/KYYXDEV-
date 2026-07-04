const { Task, Pramubakti, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', prioritas = '', pramubakti_id = '', tanggal = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { judul: { [Op.like]: `%${search}%` } },
        { deskripsi: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) where.status = status;
    if (prioritas) where.prioritas = prioritas;
    if (pramubakti_id) where.pramubakti_id = pramubakti_id;
    if (tanggal) where.tanggal = tanggal;

    // Pramubaiki only sees their own tasks
    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      if (pramubakti) where.pramubakti_id = pramubakti.id;
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [
        { model: Pramubakti, as: 'pramubakti', attributes: ['id', 'nama', 'nik', 'unit_kerja'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['tanggal', 'DESC'], ['prioritas', 'DESC']]
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
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    // Pramubaiki can only see their own tasks
    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      if (!pramubakti || task.pramubakti_id !== pramubakti.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke tugas ini' });
      }
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    const { status = '', prioritas = '', tanggal = '' } = req.query;
    const where = { pramubakti_id: pramubakti.id };
    
    if (status) where.status = status;
    if (prioritas) where.prioritas = prioritas;
    if (tanggal) where.tanggal = tanggal;

    const tasks = await Task.findAll({
      where,
      order: [['tanggal', 'DESC'], ['prioritas', 'DESC']]
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getTodayTasks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let pramubaktiId;

    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      pramubaktiId = pramubakti?.id;
    }

    const where = { tanggal: today };
    if (pramubaktiId) where.pramubakti_id = pramubaktiId;

    const tasks = await Task.findAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti', attributes: ['id', 'nama'] }],
      order: [['prioritas', 'DESC'], ['jam_mulai', 'ASC']]
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { pramubakti_id, judul, deskripsi, tanggal, jam_mulai, jam_selesai, tenggat_waktu, prioritas, lampiran } = req.body;

    if (!pramubakti_id || !judul || !tanggal) {
      return res.status(400).json({ success: false, message: 'Pramubakti, judul, dan tanggal harus diisi' });
    }

    const task = await Task.create({
      pramubakti_id,
      user_id: req.user.id,
      judul,
      deskripsi,
      tanggal,
      jam_mulai,
      jam_selesai,
      tenggat_waktu,
      prioritas: prioritas || 'Sedang',
      status: 'Belum Dikerjakan',
      lampiran,
      created_by: req.user.id
    });

    // Create notification for the assigned pramubakti
    const pramubakti = await Pramubakti.findByPk(pramubakti_id);
    if (pramubakti && pramubakti.user_id) {
      await Notification.create({
        user_id: pramubakti.user_id,
        judul: 'Tugas Baru',
        pesan: `Anda получили tugas baru: "${judul}" dengan tenggat waktu ${tenggat_waktu || tanggal}`,
        jenis: 'tugas_baru',
        data: { task_id: task.id },
        link: `/tugas/${task.id}`
      });
    }

    res.status(201).json({ success: true, message: 'Tugas berhasil dibuat', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    const { judul, deskripsi, tanggal, jam_mulai, jam_selesai, tenggat_waktu, prioritas, lampiran } = req.body;

    await task.update({
      judul, deskripsi, tanggal, jam_mulai, jam_selesai, tenggat_waktu, prioritas, lampiran,
      updated_by: req.user.id
    });

    res.json({ success: true, message: 'Tugas berhasil diperbarui', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, bukti, catatan, progress } = req.body;
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    // Check if pramubakti owns this task
    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      if (!pramubakti || task.pramubakti_id !== pramubakti.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke tugas ini' });
      }
    }

    const updateData = { status };
    if (bukti) updateData.bukti = bukti;
    if (catatan) updateData.catatan = catatan;
    if (progress !== undefined) updateData.progress = progress;
    
    if (status === 'Selesai') {
      updateData.completed_at = new Date();
      updateData.progress = 100;
    }

    await task.update(updateData);

    // Notify admin if task completed
    if (status === 'Selesai') {
      const admins = await User.findAll({ where: { role: 'admin', is_active: true } });
      for (const admin of admins) {
        await Notification.create({
          user_id: admin.id,
          judul: 'Tugas Selesai',
          pesan: `Tugas "${task.judul}" oleh ${task.pramubakti?.nama || 'Pramubakti'} telah selesai`,
          jenis: 'tugas_selesai',
          data: { task_id: task.id },
          link: `/tugas/${task.id}`
        });
      }
    }

    res.json({ success: true, message: 'Status tugas berhasil diperbarui', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.uploadEvidence = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      if (!pramubakti || task.pramubakti_id !== pramubakti.id) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke tugas ini' });
      }
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan' });
    }

    const bukti = `/uploads/${req.file.filename}`;
    await task.update({ bukti });

    res.json({ success: true, message: 'Bukti tugas berhasil diunggah', data: { bukti } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tugas tidak ditemukan' });
    }

    await task.destroy();
    res.json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { pramubakti_id, bulan, tahun } = req.query;
    const where = {};

    if (pramubakti_id) where.pramubakti_id = pramubakti_id;
    if (bulan && tahun) {
      where.tanggal = { [Op.between]: [`${tahun}-${String(bulan).padStart(2, '0')}-01`, `${tahun}-${String(bulan).padStart(2, '0')}-31`] };
    }

    const tasks = await Task.findAll({ where });

    const total = tasks.length;
    const selesai = tasks.filter(t => t.status === 'Selesai').length;
    const sedangDikerjakan = tasks.filter(t => t.status === 'Sedang Dikerjakan').length;
    const belumDikerjakan = tasks.filter(t => t.status === 'Belum Dikerjakan').length;
    const overdue = tasks.filter(t => t.status === 'Overdue').length;

    res.json({
      success: true,
      data: {
        total, selesai, sedangDikerjakan, belumDikerjakan, overdue,
        presentase_selesai: total > 0 ? Math.round((selesai / total) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
