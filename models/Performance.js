const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Performance = db.sequelize.define('performances', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pramubakti_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'pramubaktis', key: 'id' } },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  periode: { type: DataTypes.STRING, allowNull: false },
  bulan: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 12 } },
  tahun: { type: DataTypes.INTEGER, allowNull: false },
  kedisiplinan: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  produktivitas: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  kualitas_kerja: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  teamwork: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  inisiatif: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  rata_rata: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  ranking: { type: DataTypes.INTEGER, allowNull: true },
  komentar: { type: DataTypes.TEXT, allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  timestamps: true
});

module.exports = Performance;
