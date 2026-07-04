import { useState, useEffect } from 'react'
import axios from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Settings as SettingsIcon, Building2, Database, Bell, Shield, Save, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const toast = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('umum')
  
  const [general, setGeneral] = useState({
    app_name: 'SIM Pramubakti BPS',
    app_description: 'Sistem Informasi Manajemen Pramubakti Badan Pusat Statistik',
   Instansi: 'Badan Pusat Statistik',
   alamat: 'Jl. Dr. Sutomo No. 6-8, Jakarta',
    telepon: '(021) 3841195',
    email: 'bps@bps.go.id'
  })
  
  const [attendance, setAttendance] = useState({
    jam_masuk: '08:00',
    jam_pulang: '16:00',
    toleransi_terlambat: 15,
    require_location: true
  })
  
  const [notification, setNotification] = useState({
    email_notifications: true,
    task_reminders: true,
    deadline_alerts: true,
    announcement_alerts: true
  })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/settings')
      const data = res.data.data || {}
      setGeneral(prev => ({ ...prev, ...data.general || {} }))
      setAttendance(prev => ({ ...prev, ...data.attendance || {} }))
      setNotification(prev => ({ ...prev, ...data.notification || {} }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (type) => {
    setSaving(true)
    try {
      await axios.put('/settings', {
        type,
        [type === 'umum' ? 'general' : type === 'attendance' ? 'attendance' : 'notification']: 
          type === 'umum' ? general : type === 'attendance' ? attendance : notification
      })
      toast.success('Pengaturan berhasil disimpan')
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset semua pengaturan ke default?')) return
    try {
      await axios.post('/settings/reset')
      toast.success('Pengaturan berhasil direset')
      fetchSettings()
    } catch (err) {
      toast.error('Gagal reset pengaturan')
    }
  }

  const tabs = [
    { id: 'umum', label: 'Umum', icon: Building2 },
    { id: 'attendance', label: 'Kehadiran', icon: SettingsIcon },
    { id: 'notification', label: 'Notifikasi', icon: Bell },
    { id: 'keamanan', label: 'Keamanan', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
          <p className="text-gray-500">Konfigurasi sistem dan aplikasi</p>
        </div>
        <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50">
          <RefreshCw className="w-4 h-4" /> Reset Default
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-2">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${tab === t.id ? 'bg-bps-navy text-white' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === 'umum' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-bps-navy" /> Pengaturan Umum
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Aplikasi</label>
                    <input type="text" value={general.app_name} onChange={(e) => setGeneral({...general, app_name: e.target.value})} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Instansi</label>
                    <input type="text" value={general.Instansi} onChange={(e) => setGeneral({...general,Instansi: e.target.value})} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi Aplikasi</label>
                  <input type="text" value={general.app_description} onChange={(e) => setGeneral({...general, app_description: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <textarea value={general.alamat} onChange={(e) => setGeneral({...general, alamat: e.target.value})} className="input" rows="2" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Telepon</label>
                    <input type="text" value={general.telepon} onChange={(e) => setGeneral({...general, telepon: e.target.value})} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={general.email} onChange={(e) => setGeneral({...general, email: e.target.value})} className="input" />
                  </div>
                </div>
                <button onClick={() => handleSave('umum')} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          {tab === 'attendance' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-bps-navy" /> Pengaturan Kehadiran
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Jam Masuk</label>
                    <input type="time" value={attendance.jam_masuk} onChange={(e) => setAttendance({...attendance, jam_masuk: e.target.value})} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jam Pulang</label>
                    <input type="time" value={attendance.jam_pulang} onChange={(e) => setAttendance({...attendance, jam_pulang: e.target.value})} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Toleransi Terlambat (menit)</label>
                  <input type="number" value={attendance.toleransi_terlambat} onChange={(e) => setAttendance({...attendance, toleransi_terlambat: e.target.value})} className="input" min="0" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="require_location" checked={attendance.require_location} onChange={(e) => setAttendance({...attendance, require_location: e.target.checked})} className="w-4 h-4 rounded" />
                  <label htmlFor="require_location" className="text-sm">Wajib mengisi lokasi saat absensi</label>
                </div>
                <button onClick={() => handleSave('attendance')} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          {tab === 'notification' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-bps-navy" /> Pengaturan Notifikasi
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifikasi</p>
                    <p className="text-sm text-gray-500">Kirim notifikasi melalui email</p>
                  </div>
                  <input type="checkbox" checked={notification.email_notifications} onChange={(e) => setNotification({...notification, email_notifications: e.target.checked})} className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">Pengingat Tugas</p>
                    <p className="text-sm text-gray-500">Notifikasi untuk tugas baru dan pembaruan</p>
                  </div>
                  <input type="checkbox" checked={notification.task_reminders} onChange={(e) => setNotification({...notification, task_reminders: e.target.checked})} className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">Peringatan Batas Waktu</p>
                    <p className="text-sm text-gray-500">Notifikasi saat deadline mendekati</p>
                  </div>
                  <input type="checkbox" checked={notification.deadline_alerts} onChange={(e) => setNotification({...notification, deadline_alerts: e.target.checked})} className="w-5 h-5 rounded" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium">Pengumuman Baru</p>
                    <p className="text-sm text-gray-500">Notifikasi untuk pengumuman baru</p>
                  </div>
                  <input type="checkbox" checked={notification.announcement_alerts} onChange={(e) => setNotification({...notification, announcement_alerts: e.target.checked})} className="w-5 h-5 rounded" />
                </div>
                <button onClick={() => handleSave('notification')} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          {tab === 'keamanan' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-bps-navy" /> Pengaturan Keamanan
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Kebijakan Keamanan</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Semua password dienkripsi dengan bcrypt</li>
                    <li>• Token JWT expire dalam 7 hari</li>
                    <li>• CSRF protection aktif</li>
                    <li>• Rate limiting pada login</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <h3 className="font-medium mb-2">Database Backup</h3>
                  <p className="text-sm text-gray-500 mb-3">Backup database dilakukan secara otomatis setiap hari</p>
                  <button className="btn-secondary text-sm">Backup Manual Sekarang</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
