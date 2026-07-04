const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Announcement = db.sequelize.define('announcements', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul: { type: DataTypes.STRING, allowNull: false },
  konten: { type: DataTypes.TEXT, allowNull: false },
  kategori: { type: DataTypes.ENUM('Umum', 'Penting', 'Urgent', 'Info'), defaultValue: 'Umum' },
  lampiran: { type: DataTypes.STRING, allowNull: true },
  tgl_mulai: { type: DataTypes.DATEONLY, allowNull: false },
  tgl_selesai: { type: DataTypes.DATEONLY, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  timestamps: true
});

module.exports = Announcement;
