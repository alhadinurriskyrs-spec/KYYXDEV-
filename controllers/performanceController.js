const { Performance, Pramubakti, User } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', bulan = '', tahun = '' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { '$pramubakti.nama$': { [Op.like]: `%${search}%` } },
        { '$pramubakti.nik$': { [Op.like]: `%${search}%` } }
      ];
    }
    if (bulan) where.bulan = bulan;
    if (tahun) where.tahun = tahun;

    const { count, rows } = await Performance.findAndCountAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      limit: parseInt(limit),
      offset,
      order: [['tahun', 'DESC'], ['bulan', 'DESC'], ['ranking', 'ASC']]
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
    const performance = await Performance.findByPk(req.params.id, {
      include: [{ model: Pramubakti, as: 'pramubakti' }]
    });

    if (!performance) {
      return res.status(404).json({ success: false, message: 'Data penilaian tidak ditemukan' });
    }

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getByPramubakti = async (req, res) => {
  try {
    const { pramubakti_id } = req.params;
    const { bulan = '', tahun = '' } = req.query;

    const where = { pramubakti_id };
    if (bulan) where.bulan = bulan;
    if (tahun) where.tahun = tahun;

    const performances = await Performance.findAll({
      where,
      order: [['tahun', 'DESC'], ['bulan', 'DESC']]
    });

    res.json({ success: true, data: performances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getMyPerformance = async (req, res) => {
  try {
    const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
    if (!pramubakti) {
      return res.status(404).json({ success: false, message: 'Data pramubakti tidak ditemukan' });
    }

    const performances = await Performance.findAll({
      where: { pramubakti_id: pramubakti.id },
      order: [['tahun', 'DESC'], ['bulan', 'DESC']]
    });

    res.json({ success: true, data: performances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { pramubakti_id, periode, bulan, tahun, kedisiplinan, produktivitas, kualitas_kerja, teamwork, inisiatif, komentar, catatan } = req.body;

    if (!pramubakti_id || !periode || !bulan || !tahun) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi' });
    }

    // Calculate average
    const rataRata = ((parseFloat(kedisiplinan) + parseFloat(produktivitas) + parseFloat(kualitas_kerja) + parseFloat(teamwork) + parseFloat(inisiatif)) / 5).toFixed(2);

    const performance = await Performance.create({
      pramubakti_id,
      user_id: req.user.id,
      periode,
      bulan: parseInt(bulan),
      tahun: parseInt(tahun),
      kedisiplinan: parseFloat(kedisiplinan),
      produktivitas: parseFloat(produktivitas),
      kualitas_kerja: parseFloat(kualitas_kerja),
      teamwork: parseFloat(teamwork),
      inisiatif: parseFloat(inisiatif),
      rata_rata: rataRata,
      komentar,
      catatan,
      created_by: req.user.id
    });

    // Calculate ranking
    await this.calculateRanking(bulan, tahun);

    res.status(201).json({ success: true, message: 'Penilaian berhasil disimpan', data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.calculateRanking = async (bulan, tahun) => {
  try {
    const performances = await Performance.findAll({
      where: { bulan: parseInt(bulan), tahun: parseInt(tahun) },
      order: [['rata_rata', 'DESC']]
    });

    for (let i = 0; i < performances.length; i++) {
      await performances[i].update({ ranking: i + 1 });
    }
  } catch (error) {
    console.error('Error calculating ranking:', error);
  }
};

exports.update = async (req, res) => {
  try {
    const performance = await Performance.findByPk(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Data penilaian tidak ditemukan' });
    }

    const { kedisiplinan, produktivitas, kualitas_kerja, teamwork, inisiatif, komentar, catatan } = req.body;

    const rataRata = ((parseFloat(kedisiplinan) + parseFloat(produktivitas) + parseFloat(kualitas_kerja) + parseFloat(teamwork) + parseFloat(inisiatif)) / 5).toFixed(2);

    await performance.update({
      kedisiplinan: parseFloat(kedisiplinan),
      produktivitas: parseFloat(produktivitas),
      kualitas_kerja: parseFloat(kualitas_kerja),
      teamwork: parseFloat(teamwork),
      inisiatif: parseFloat(inisiatif),
      rata_rata: rataRata,
      komentar,
      catatan
    });

    // Recalculate ranking
    await this.calculateRanking(performance.bulan, performance.tahun);

    res.json({ success: true, message: 'Penilaian berhasil diperbarui', data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const performance = await Performance.findByPk(req.params.id);
    if (!performance) {
      return res.status(404).json({ success: false, message: 'Data penilaian tidak ditemukan' });
    }

    await performance.destroy();
    res.json({ success: true, message: 'Penilaian berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const currentMonth = bulan || new Date().getMonth() + 1;
    const currentYear = tahun || new Date().getFullYear();

    const rankings = await Performance.findAll({
      where: { bulan: parseInt(currentMonth), tahun: parseInt(currentYear) },
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['ranking', 'ASC']]
    });

    res.json({ success: true, data: rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const currentMonth = bulan || new Date().getMonth() + 1;
    const currentYear = tahun || new Date().getFullYear();

    const performances = await Performance.findAll({
      where: { bulan: parseInt(currentMonth), tahun: parseInt(currentYear) }
    });

    if (performances.length === 0) {
      return res.json({
        success: true,
        data: { rata_rata_umum: 0, tertinggi: 0, terendah: 0, jumlah_dinilai: 0 }
      });
    }

    const avgScores = performances.map(p => parseFloat(p.rata_rata));
    const rataRataUmum = (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(2);
    const tertinggi = Math.max(...avgScores).toFixed(2);
    const terendah = Math.min(...avgScores).toFixed(2);

    res.json({
      success: true,
      data: { rata_rata_umum: rataRataUmum, tertinggi, terendah, jumlah_dinilai: performances.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
