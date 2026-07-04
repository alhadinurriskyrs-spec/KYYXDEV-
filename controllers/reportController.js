const { Pramubakti, Attendance, Task, Performance, User } = require('../models');
const { Op } = require('sequelize');
const JsPDF = require('jspdf');
const autoTable = require('jspdf-autotable');
const ExcelJS = require('exceljs');

exports.generatePramubaktiReport = async (req, res) => {
  try {
    const { format = 'pdf', bulan, tahun } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const pramubaktis = await Pramubakti.findAll({ 
      where: { status: 'Aktif' },
      order: [['nama', 'ASC']]
    });

    const data = await Promise.all(pramubaktis.map(async (p) => {
      const tugas = await Task.count({ 
        where: { pramubakti_id: p.id, tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } }
      });
      const tugasSelesai = await Task.count({ 
        where: { pramubakti_id: p.id, status: 'Selesai', tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } }
      });
      const kehadiran = await Attendance.count({ 
        where: { pramubakti_id: p.id, tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } }
      });
      const terlambat = await Attendance.count({ 
        where: { pramubakti_id: p.id, status_masuk: 'Terlambat', tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } }
      });

      return {
        nama: p.nama,
        nik: p.nik,
        jabatan: p.jabatan,
        unit_kerja: p.unit_kerja,
        total_tugas: tugas,
        tugas_selesai: tugasSelesai,
        kehadiran: kehadiran,
        terlambat: terlambat,
        persentase: tugas > 0 ? Math.round((tugasSelesai / tugas) * 100) : 0
      };
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan Pramubakti');
      
      sheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'NIK', key: 'nik', width: 15 },
        { header: 'Jabatan', key: 'jabatan', width: 20 },
        { header: 'Unit Kerja', key: 'unit_kerja', width: 20 },
        { header: 'Total Tugas', key: 'total_tugas', width: 12 },
        { header: 'Tugas Selesai', key: 'tugas_selesai', width: 14 },
        { header: 'Kehadiran', key: 'kehadiran', width: 12 },
        { header: 'Terlambat', key: 'terlambat', width: 12 },
        { header: '%', key: 'persentase', width: 8 }
      ];

      data.forEach((item, index) => {
        sheet.addRow({ ...item, no: index + 1 });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Laporan_Pramubakti_${month}_${year}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    // PDF format
    const doc = new JsPDF();
    doc.setFontSize(16);
    doc.text('LAPORAN DATA PRAMUBAKTI', 14, 20);
    doc.setFontSize(10);
    doc.text(`Bulan: ${month}/${year}`, 14, 28);

    autoTable(doc, {
      head: [['No', 'Nama', 'NIK', 'Jabatan', 'Unit Kerja', 'Tugas', 'Selesai', 'Hadir', 'Telat', '%']],
      body: data.map((item, index) => [
        index + 1, item.nama, item.nik, item.jabatan, item.unit_kerja,
        item.total_tugas, item.tugas_selesai, item.kehadiran, item.terlambat, item.persentase + '%'
      ]),
      startY: 35
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Pramubakti_${month}_${year}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.generateAttendanceReport = async (req, res) => {
  try {
    const { format = 'pdf', bulan, tahun, pramubakti_id } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const where = { tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } };
    if (pramubakti_id) where.pramubakti_id = pramubakti_id;

    const attendances = await Attendance.findAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['pramubakti_id', 'ASC'], ['tanggal', 'ASC']]
    });

    const data = attendances.map(a => ({
      tanggal: a.tanggal,
      nama: a.pramubakti?.nama || '-',
      nik: a.pramubakti?.nik || '-',
      jam_masuk: a.jam_masuk || '-',
      jam_pulang: a.jam_pulang || '-',
      status_masuk: a.status_masuk,
      status_pulang: a.status_pulang
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan Kehadiran');
      
      sheet.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 12 },
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'NIK', key: 'nik', width: 15 },
        { header: 'Jam Masuk', key: 'jam_masuk', width: 12 },
        { header: 'Jam Pulang', key: 'jam_pulang', width: 12 },
        { header: 'Status Masuk', key: 'status_masuk', width: 15 },
        { header: 'Status Pulang', key: 'status_pulang', width: 15 }
      ];

      data.forEach(item => sheet.addRow(item));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Laporan_Kehadiran_${month}_${year}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    const doc = new JsPDF('landscape');
    doc.setFontSize(14);
    doc.text('LAPORAN KEHADIRAN PRAMUBAKTI', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${month}/${year}`, 14, 28);

    autoTable(doc, {
      head: [['Tanggal', 'Nama', 'NIK', 'Jam Masuk', 'Jam Pulang', 'Status Masuk', 'Status Pulang']],
      body: data.map(d => [d.tanggal, d.nama, d.nik, d.jam_masuk, d.jam_pulang, d.status_masuk, d.status_pulang])
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Kehadiran_${month}_${year}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.generateTaskReport = async (req, res) => {
  try {
    const { format = 'pdf', bulan, tahun, pramubakti_id } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const where = { tanggal: { [Op.between]: [`${year}-${String(month).padStart(2, '0')}-01`, `${year}-${String(month).padStart(2, '0')}-31`] } };
    if (pramubakti_id) where.pramubakti_id = pramubakti_id;

    const tasks = await Task.findAll({
      where,
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['pramubakti_id', 'ASC'], ['tanggal', 'ASC']]
    });

    const data = tasks.map(t => ({
      tanggal: t.tanggal,
      nama: t.pramubakti?.nama || '-',
      judul: t.judul,
      prioritas: t.prioritas,
      status: t.status,
      progress: t.progress + '%'
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan Tugas');
      
      sheet.columns = [
        { header: 'Tanggal', key: 'tanggal', width: 12 },
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'Judul Tugas', key: 'judul', width: 30 },
        { header: 'Prioritas', key: 'prioritas', width: 12 },
        { header: 'Status', key: 'status', width: 18 },
        { header: 'Progress', key: 'progress', width: 10 }
      ];

      data.forEach(item => sheet.addRow(item));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Laporan_Tugas_${month}_${year}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    const doc = new JsPDF('landscape');
    doc.setFontSize(14);
    doc.text('LAPORAN TUGAS HARIAN PRAMUBAKTI', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${month}/${year}`, 14, 28);

    autoTable(doc, {
      head: [['Tanggal', 'Nama', 'Judul Tugas', 'Prioritas', 'Status', 'Progress']],
      body: data.map(d => [d.tanggal, d.nama, d.judul, d.prioritas, d.status, d.progress])
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Tugas_${month}_${year}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.generatePerformanceReport = async (req, res) => {
  try {
    const { format = 'pdf', bulan, tahun } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const performances = await Performance.findAll({
      where: { bulan: parseInt(month), tahun: parseInt(year) },
      include: [{ model: Pramubakti, as: 'pramubakti' }],
      order: [['ranking', 'ASC']]
    });

    const data = performances.map(p => ({
      ranking: p.ranking,
      nama: p.pramubakti?.nama || '-',
      nik: p.pramubakti?.nik || '-',
      kedisiplinan: p.kedisiplinan,
      produktivitas: p.produktivitas,
      kualitas: p.kualitas_kerja,
      teamwork: p.teamwork,
      inisiatif: p.inisiatif,
      rata_rata: p.rata_rata
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan Penilaian');
      
      sheet.columns = [
        { header: 'Ranking', key: 'ranking', width: 10 },
        { header: 'Nama', key: 'nama', width: 25 },
        { header: 'NIK', key: 'nik', width: 15 },
        { header: 'Kedisiplinan', key: 'kedisiplinan', width: 14 },
        { header: 'Produktivitas', key: 'produktivitas', width: 16 },
        { header: 'Kualitas', key: 'kualitas', width: 12 },
        { header: 'Teamwork', key: 'teamwork', width: 12 },
        { header: 'Inisiatif', key: 'inisiatif', width: 12 },
        { header: 'Rata-rata', key: 'rata_rata', width: 12 }
      ];

      data.forEach(item => sheet.addRow(item));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Laporan_Penilaian_${month}_${year}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    const doc = new JsPDF();
    doc.setFontSize(14);
    doc.text('LAPORAN PENILAIAN KINERJA PRAMUBAKTI', 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${month}/${year}`, 14, 28);

    autoTable(doc, {
      head: [['Ranking', 'Nama', 'NIK', 'Kedisiplinan', 'Produktivitas', 'Kualitas', 'Teamwork', 'Inisiatif', 'Rata-rata']],
      body: data.map(d => [d.ranking, d.nama, d.nik, d.kedisiplinan, d.produktivitas, d.kualitas, d.teamwork, d.inisiatif, d.rata_rata])
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Penilaian_${month}_${year}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
