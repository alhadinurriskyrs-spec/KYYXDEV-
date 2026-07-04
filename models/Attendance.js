const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Attendance = db.sequelize.define('attendances', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pramubakti_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'pramubaktis', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  jam_masuk: { type: DataTypes.TIME, allowNull: true },
  jam_pulang: { type: DataTypes.TIME, allowNull: true },
  status_masuk: { type: DataTypes.ENUM('Tepat Waktu', 'Terlambat', 'Tidak Masuk'), defaultValue: 'Tepat Waktu' },
  status_pulang: { type: DataTypes.ENUM('Pulang Tepat Waktu', 'Pulang Awal', 'Lembur'), defaultValue: 'Pulang Tepat Waktu' },
  keterangan: { type: DataTypes.TEXT, allowNull: true },
  lokasi_masuk: { type: DataTypes.STRING, allowNull: true },
  lokasi_pulang: { type: DataTypes.STRING, allowNull: true },
  foto_masuk: { type: DataTypes.STRING, allowNull: true },
  foto_pulang: { type: DataTypes.STRING, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  timestamps: true,
  indexes: [
    { fields: ['pramubakti_id', 'tanggal'], unique: true }
  ]
});

module.exports = Attendance;
