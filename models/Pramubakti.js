const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Pramubakti = db.sequelize.define('pramubaktis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
  nik: { type: DataTypes.STRING(16), allowNull: false, unique: true },
  nama: { type: DataTypes.STRING, allowNull: false },
  jenis_kelamin: { type: DataTypes.ENUM('Laki-laki', 'Perempuan'), allowNull: false },
  tempat_lahir: { type: DataTypes.STRING, allowNull: false },
  tanggal_lahir: { type: DataTypes.DATEONLY, allowNull: false },
  alamat: { type: DataTypes.TEXT, allowNull: false },
  nomor_hp: { type: DataTypes.STRING(15), allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  jabatan: { type: DataTypes.STRING, allowNull: false },
  unit_kerja: { type: DataTypes.STRING, allowNull: false },
  tanggal_masuk: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('Aktif', 'Nonaktif', 'Cuti', 'Mutasi'), defaultValue: 'Aktif' },
  foto: { type: DataTypes.STRING, allowNull: true },
  foto_ktp: { type: DataTypes.STRING, allowNull: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
}, {
  timestamps: true
});

module.exports = Pramubakti;
