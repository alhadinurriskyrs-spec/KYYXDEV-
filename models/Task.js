const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Task = db.sequelize.define('tasks', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pramubakti_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'pramubaktis', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  judul: { type: DataTypes.STRING, allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  jam_mulai: { type: DataTypes.TIME, allowNull: true },
  jam_selesai: { type: DataTypes.TIME, allowNull: true },
  tenggat_waktu: { type: DataTypes.DATE, allowNull: true },
  prioritas: { type: DataTypes.ENUM('Rendah', 'Sedang', 'Tinggi', 'Urgen'), defaultValue: 'Sedang' },
  status: { type: DataTypes.ENUM('Belum Dikerjakan', 'Sedang Dikerjakan', 'Selesai', 'Overdue'), defaultValue: 'Belum Dikerjakan' },
  bukti: { type: DataTypes.STRING, allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  lampiran: { type: DataTypes.STRING, allowNull: true },
  progress: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
  updated_by: { type: DataTypes.INTEGER, allowNull: true },
  completed_at: { type: DataTypes.DATE, allowNull: true }
}, {
  timestamps: true
});

module.exports = Task;
