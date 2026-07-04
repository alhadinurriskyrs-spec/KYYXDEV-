const { User, Pramubakti, Attendance, Task, Performance, Announcement, Notification } = require('../models');
const { Op } = require('sequelize');
const { fn, col, literal } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Basic counts
    const totalPramubakti = await Pramubakti.count({ where: { status: 'Aktif' } });
    const totalUsers = await User.count({ where: { is_active: true } });

    // Today's attendance
    const hadirHariIni = await Attendance.count({
      where: { tanggal: today, jam_masuk: { [Op.ne]: null } }
    });
    const terlambatHariIni = await Attendance.count({
      where: { tanggal: today, status_masuk: 'Terlambat' }
    });

    // Tasks statistics
    const totalTugas = await Task.count({
      where: { tanggal: { [Op.between]: [`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, today] } }
    });
    const tugasSelesai = await Task.count({
      where: { tanggal: { [Op.between]: [`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, today] }, status: 'Selesai' }
    });
    const tugasPending = await Task.count({
      where: { tanggal: { [Op.between]: [`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, today] }, status: { [Op.in]: ['Belum Dikerjakan', 'Sedang Dikerjakan'] } }
    });

    // Performance average
    const avgPerformance = await Performance.findOne({
      where: { bulan: currentMonth, tahun: currentYear },
      attributes: [[fn('AVG', col('rata_rata')), 'avg']],
      raw: true
    });

    // Monthly attendance data for chart
    const monthlyAttendance = [];
    for (let i = 1; i <= 31; i++) {
      const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const count = await Attendance.count({ where: { tanggal: date } });
      monthlyAttendance.push({ tanggal: date, jumlah: count });
    }

    // Task completion by priority
    const tugasPrioritas = await Task.findAll({
      where: { tanggal: { [Op.between]: [`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`, today] } },
      attributes: ['prioritas', 'status', [fn('COUNT', col('id')), 'jumlah']],
      group: ['prioritas', 'status']
    });

    // Recent activities
    const recentTasks = await Task.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Pramubakti, as: 'pramubakti', attributes: ['nama'] }]
    });

    const recentAttendances = await Attendance.findAll({
      limit: 5,
      where: { tanggal: today },
      order: [['jam_masuk', 'DESC']],
      include: [{ model: Pramubakti, as: 'pramubakti', attributes: ['nama'] }]
    });

    // Unread notifications
    const unreadNotifications = await Notification.count({
      where: { user_id: req.user.id, is_read: false }
    });

    // Active announcements
    const activeAnnouncements = await Announcement.count({
      where: {
        is_active: true,
        tgl_selesai: { [Op.gte]: today }
      }
    });

    res.json({
      success: true,
      data: {
        totalPramubakti,
        totalUsers,
        hadirHariIni,
        terlambatHariIni,
        totalTugas,
        tugasSelesai,
        tugasPending,
        avgPerformance: avgPerformance?.avg || 0,
        monthlyAttendance,
        tugasPrioritas,
        recentTasks,
        recentAttendances,
        unreadNotifications,
        activeAnnouncements
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getMyDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get pramubakti data
    const pramubakti = await Pramubakti.findOne({ where: { user_id: req.user.id } });
    
    if (!pramubakti) {
      return res.json({
        success: true,
        data: {
          totalTugas: 0,
          tugasSelesai: 0,
          tugasPending: 0,
          hadirHariIni: false,
          tugasHariIni: [],
          recentNotifications: []
        }
      });
    }

    // Today's tasks
    const tugasHariIni = await Task.findAll({
      where: { pramubakti_id: pramubakti.id, tanggal: today },
      order: [['prioritas', 'DESC'], ['jam_mulai', 'ASC']]
    });

    // Task stats this month
    const startOfMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
    const tugasBulanIni = await Task.count({
      where: { pramubakti_id: pramubakti.id, tanggal: { [Op.between]: [startOfMonth, today] } }
    });
    const tugasSelesaiBulanIni = await Task.count({
      where: { pramubakti_id: pramubakti.id, tanggal: { [Op.between]: [startOfMonth, today] }, status: 'Selesai' }
    });

    // Today's attendance
    const hadirHariIni = await Attendance.findOne({
      where: { pramubakti_id: pramubakti.id, tanggal: today }
    });

    // Recent notifications
    const recentNotifications = await Notification.findAll({
      where: { user_id: req.user.id },
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    // Latest performance
    const latestPerformance = await Performance.findOne({
      where: { pramubakti_id: pramubakti.id },
      order: [['tahun', 'DESC'], ['bulan', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        pramubakti,
        tugasHariIni,
        totalTugas: tugasBulanIni,
        tugasSelesai: tugasSelesaiBulanIni,
        tugasPending: tugasBulanIni - tugasSelesaiBulanIni,
        hadirHariIni,
        recentNotifications,
        latestPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    // Get all attendance for the month
    const attendances = await Attendance.findAll({
      where: { tanggal: { [Op.between]: [startDate, endDate] } },
      include: [{ model: Pramubakti, as: 'pramubakti', attributes: ['nama'] }]
    });

    // Get all tasks for the month
    const tasks = await Task.findAll({
      where: { tanggal: { [Op.between]: [startDate, endDate] } },
      include: [{ model: Pramubakti, as: 'pramubakti', attributes: ['nama'] }]
    });

    res.json({
      success: true,
      data: { attendances, tasks }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan', error: error.message });
  }
};
