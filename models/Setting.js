const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Setting = db.sequelize.define('settings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, allowNull: true },
  type: { type: DataTypes.ENUM('string', 'number', 'boolean', 'json'), defaultValue: 'string' },
  grup: { type: DataTypes.STRING, defaultValue: 'umum' },
  description: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true
});

module.exports = Setting;
