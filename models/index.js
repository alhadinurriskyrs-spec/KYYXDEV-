const db = require('../config/database');
const User = require('./User');
const Pramubakti = require('./Pramubakti');
const Attendance = require('./Attendance');
const Task = require('./Task');
const Performance = require('./Performance');
const Announcement = require('./Announcement');
const Notification = require('./Notification');
const Setting = require('./Setting');

// User - Pramubakti relationship
User.hasOne(Pramubakti, { foreignKey: 'user_id', as: 'pramubakti' });
Pramubakti.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Attendance
User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Pramubakti - Attendance
Pramubakti.hasMany(Attendance, { foreignKey: 'pramubakti_id', as: 'attendanceRecords' });
Attendance.belongsTo(Pramubakti, { foreignKey: 'pramubakti_id', as: 'pramubakti' });

// User - Task
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks' });
Task.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Pramubakti - Task
Pramubakti.hasMany(Task, { foreignKey: 'pramubakti_id', as: 'taskRecords' });
Task.belongsTo(Pramubakti, { foreignKey: 'pramubakti_id', as: 'pramubakti' });

// User - Performance
User.hasMany(Performance, { foreignKey: 'user_id', as: 'performances' });
Performance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Pramubakti - Performance
Pramubakti.hasMany(Performance, { foreignKey: 'pramubakti_id', as: 'performanceRecords' });
Performance.belongsTo(Pramubakti, { foreignKey: 'pramubakti_id', as: 'pramubakti' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Announcement (creator)
User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  db,
  User,
  Pramubakti,
  Attendance,
  Task,
  Performance,
  Announcement,
  Notification,
  Setting
};
