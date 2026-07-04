import { useState, useEffect } from 'react'
import axios from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, Mail, Phone, MapPin, Calendar, Building2, Shield, Camera, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profil')
  const [pramubakti, setPramubakti] = useState(null)
  
  const [form, setForm] = useState({
    name: '', email: '', nomor_hp: '', alamat: ''
  })
  
  const [password, setPassword] = useState({
    current: '', baru: '', konfirmasi: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/auth/profile')
      const userData = res.data.data
      setForm({
        name: userData.name || userData.pramubakti?.nama || '',
        email: userData.email || '',
        nomor_hp: userData.pramubakti?.nomor_hp || '',
        alamat: userData.pramubakti?.alamat || ''
      })
      setPramubakti(userData.pramubakti)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.put('/auth/profile', form)
      updateUser(res.data.data)
      toast.success('Profil berhasil diperbarui')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (password.baru !== password.konfirmasi) {
      toast.error('Password baru dan konfirmasi tidak cocok')
      return
    }
    if (password.baru.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setSaving(true)
    try {
      await axios.post('/auth/change-password', {
        current_password: password.current,
        password: password.baru,
        password_confirmation: password.konfirmasi
      })
      toast.success('Password berhasil diubah')
      setPassword({ current: '', baru: '', konfirmasi: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password')
    } finally {
      setSaving(false)
    }
  }

  const roleLabels = {
    admin: 'Administrator',
    pimpinan: 'Pimpinan',
    pelapor: 'Pelapor',
    pramubakti: 'Pramubakti'
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    pimpinan: 'bg-purple-100 text-purple-700',
    pelapor: 'bg-blue-100 text-blue-700',
    pramubakti: 'bg-green-100 text-green-700'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-500">Kelola informasi profil dan password</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-bps-navy rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[user?.role]}`}>
              {roleLabels[user?.role]}
            </span>
            
            {pramubakti && (
              <div className="mt-6 text-left space-y-3 pt-6 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{pramubakti.jabatan} - {pramubakti.unit_kerja}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{pramubakti.nomor_hp || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{pramubakti.alamat || '-'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Tanggal Masuk: {pramubakti.tanggal_masuk || '-'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="border-b border-gray-200 dark:border-slate-700">
              <div className="flex">
                <button onClick={() => setTab('profil')} className={`px-6 py-3 font-medium border-b-2 ${tab === 'profil' ? 'border-bps-navy text-bps-navy' : 'text-gray-500 hover:text-gray-700'}`}>
                  Edit Profil
                </button>
                <button onClick={() => setTab('password')} className={`px-6 py-3 font-medium border-b-2 ${tab === 'password' ? 'border-bps-navy text-bps-navy' : 'text-gray-500 hover:text-gray-700'}`}>
                  Ubah Password
                </button>
              </div>
            </div>

            <div className="p-6">
              {tab === 'profil' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nomor HP</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="tel" value={form.nomor_hp} onChange={(e) => setForm({...form, nomor_hp: e.target.value})} className="input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} className="input pl-10" rows="2" />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                  </button>
                </form>
              )}

              {tab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
                    <input type="password" value={password.current} onChange={(e) => setPassword({...password, current: e.target.value})} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password Baru</label>
                    <input type="password" value={password.baru} onChange={(e) => setPassword({...password, baru: e.target.value})} className="input" required minLength={6} />
                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
                    <input type="password" value={password.konfirmasi} onChange={(e) => setPassword({...password, konfirmasi: e.target.value})} className="input" required />
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? 'Menyimpan...' : <><Shield className="w-4 h-4" /> Ubah Password</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
