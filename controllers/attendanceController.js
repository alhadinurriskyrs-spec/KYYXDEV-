const { Attendance, Pramubakti, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.clockIn = async (req, res) => {
  try {
    const { pramubakti_id, jam_masuk, lokasi_masuk, foto_masuk, keterangan } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const existing = await Attendance.findOne({
      where: { pramubakti_id, tanggal: today }
    });

    if (existing && existing.jam_masuk) {
      return res.status(400).json({ success: false, message: 'Anda sudah melakukan absensi masuk hari ini' });
    }

    const jamMasukReal = jam_masuk || now;
    const isLate = jamMasukReal > '08:00:00';

    const attendance = await Attendance.create({
      pramubakti_id,
      user_id: req.user.id,
      tanggal: today,
      jam_masuk: jamMasukReal,
      status_masuk: isLate ? 'Terlambat' : 'Tepat Waktu',
      lokasi_masuk: lokasi_masuk || 'Kantor BPS',
      foto_masuk: foto_masuk,
      keterangan,
      created_by: req.user.id
    });

    await Notification.create({
      user_id: req.user.id,
      judul: 'Absensi Masuk Tercatat',
      pesan: `Absensi masuk berhasil dicatat pada ${jamMasukReal}`,
      jenis: 'absensi',
      data: { attendance_id: attendance.id }
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Absensi masuk berhasil. Anda terlambat.' : 'Absensi masuk berhasil',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { pramubakti_id, jam_pulang, lokasi_pulang, foto_pulang, keterangan } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    const attendance = await Attendance.findOne({
      where: { pramubakti_id, tanggal: today }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Anda belum melakukan absensi masuk' });
    }

    if (attendance.jam_pulang) {
      return res.status(400).json({ success: false, message: 'Anda sudah melakukan absensi pulang' });
    }

    const jamPulangReal = jam_pulang || now;
    const isEarly = jamPulangReal < '16:00:00';

    await attendance.update({
      jam_pulang: jamPulangReal,
      status_pulang: isEarly ? 'Pulang Awal' : 'Pulang Tepat Waktu',
      lokasi_pulang: lokasi_pulang || 'Kantor BPS',
      foto_pulang: foto_pulang,
      keterangan: keterangan || attendance.keterangan
    });

    await Notification.create({
      user_id: req.user.id,
      judul: 'Absensi Pulang Tercatat',
      pesan: `Absensi pulang berhasil dicatat pada ${jamPulangReal}`,
      jenis: 'absensi',
      data: { attendance_id: attendance.id }
    });

    res.json({
      success: true,
      message: 'Absensi pulang berhasil',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tanggal = '', bulan = '', tahun = '', pramubakti_id = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$pramubakti.nama$': { [Op.like]: `%${search}%` } },
        { '$pramubakti.nik$': { [Op.like]: `%${search}%` } }
      ];
    }
    if (tanggal) where.tanggal = tanggal;
    if (bulan && tahun) where.tanggal = { [Op.between]: [`${tahun}-${bulan.padStart(2, '0')}-01`, `${tahun}-${bulan.padStart(2, '0')}-31`] };
    if (pramubakti_id) where.pramubakti_id = pramubakti_id;

    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      if (pramubakti) where.pramubakti_id = pramubakti.id;
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      limit: parseInt(limit),
      offset,
      order: [['tanggal', 'DESC'], ['jam_masuk', 'DESC']]
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
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Data kehadiran tidak ditemukan' });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let pramubaktiId;
    if (req.user.role === 'pramubakti') {
      const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
      pramubaktiId = pramubakti?.id;
    }

    const where = { tanggal: today };
    if (pramubaktiId) where.pramubakti_id = pramubaktiId;

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['jam_masuk', 'ASC']]
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getMonthlyRecap = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendances = await Attendance.findAll({
      where: { tanggal: { [Op.between]: [startDate, endDate] } },
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['pramubakti_id', 'ASC'], ['tanggal', 'ASC']]
    });

    const pramubaktis = await Pramubakti.findAll({ where: { status: 'Aktif' } });
    
    const recap = pramubaktis.map(p => {
      const records = attendances.filter(a => a.pramubakti_id === p.id);
      const totalHadir = records.filter(r => r.jam_masuk).length;
      const totalTerlambat = records.filter(r => r.status_masuk === 'Terlambat').length;
      const totalPulangAwal = records.filter(r => r.status_pulang === 'Pulang Awal').length;

      return {
        pramubakti: p,
        total_hadir: totalHadir,
        total_terlambat: totalTerlambat,
        total_pulang_awal: totalPulangAwal,
        records
      };
    });

    res.json({ success: true, data: recap, bulan: month, tahun: year });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getYearlyRecap = async (req, res) => {
  try {
    const { tahun } = req.query;
    const year = tahun || new Date().getFullYear();

    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      const count = await Attendance.count({
        where: { tanggal: { [Op.between]: [startDate, endDate] }, status_masuk: 'Tepat Waktu' }
      });

      monthlyData.push({ bulan: month, hadir_tepat_waktu: count });
    }

    res.json({ success: true, data: monthlyData, tahun: year });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Data kehadiran tidak ditemukan' });
    }

    await attendance.update(req.body);
    res.json({ success: true, message: 'Data kehadiran berhasil diperbarui', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Data kehadiran tidak ditemukan' });
    }

    await attendance.destroy();
    res.json({ success: true, message: 'Data kehadiran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
