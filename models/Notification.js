const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Notification = db.sequelize.define('notifications', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  judul: { type: DataTypes.STRING, allowNull: false },
  pesan: { type: DataTypes.TEXT, allowNull: false },
  jenis: { type: DataTypes.ENUM('tugas_baru', 'deadline', 'tugas_selesai', 'pengumuman', 'system', 'absensi'), defaultValue: 'system' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  data: { type: DataTypes.JSON, allowNull: true },
  link: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true
});

module.exports = Notification;
