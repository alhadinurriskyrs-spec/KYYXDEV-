const { Task, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.checkTaskDeadlines = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const today = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get tasks due tomorrow
    const dueTomorrowTasks = await Task.findAll({
      where: {
        status: { [Op.in]: ['Belum Dikerjakan', 'Sedang Dikerjakan'] },
        tanggal: tomorrowStr
      },
      include: [{ model: User, as: 'user' }]
    });

    for (const task of dueTomorrowTasks) {
      await Notification.create({
        user_id: task.user_id,
        judul: 'Tugas Akan Jatuh Tempo',
        pesan: `Tugas "${task.judul}" akan jatuh tempo besok!`,
        jenis: 'deadline',
        data: { task_id: task.id },
        link: `/tugas/${task.id}`
      });
    }

    // Get overdue tasks
    const overdueTasks = await Task.findAll({
      where: {
        status: { [Op.in]: ['Belum Dikerjakan', 'Sedang Dikerjakan'] },
        tanggal: { [Op.lt]: today }
      }
    });

    for (const task of overdueTasks) {
      await task.update({ status: 'Overdue' });
      await Notification.create({
        user_id: task.user_id,
        judul: 'Tugas Melebihi Tenggat Waktu',
        pesan: `Tugas "${task.judul}" sudah melewati tenggat waktu!`,
        jenis: 'deadline',
        data: { task_id: task.id },
        link: `/tugas/${task.id}`
      });
    }

    console.log(`Notifikasi tenggat waktu selesai. ${dueTomorrowTasks.length} tugas besok, ${overdueTasks.length} overdue.`);
  } catch (error) {
    console.error('Error checking task deadlines:', error);
  }
};
