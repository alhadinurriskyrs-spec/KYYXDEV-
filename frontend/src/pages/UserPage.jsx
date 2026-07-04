import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { UserPlus, Edit, Trash2, Search, Shield, ChevronLeft, ChevronRight, Key } from 'lucide-react'

export default function UserPage() {
  const toast = useToast()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'pramubakti', pramubakti_id: ''
  })

  const roleLabels = {
    admin: { label: 'Administrator', color: 'bg-red-100 text-red-700' },
    pimpinan: { label: 'Pimpinan', color: 'bg-purple-100 text-purple-700' },
    pelapor: { label: 'Pelapor', color: 'bg-blue-100 text-blue-700' },
    pramubakti: { label: 'Pramubakti', color: 'bg-green-100 text-green-700' }
  }

  useEffect(() => { fetchData() }, [])

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/users?page=${page}&search=${search}`)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(1)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditData(item)
      setForm({ name: item.name, email: item.email, password: '', role: item.role, pramubakti_id: item.pramubakti_id || '' })
    } else {
      setEditData(null)
      setForm({ name: '', email: '', password: '', role: 'pramubakti', pramubakti_id: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        const updateData = { ...form }
        if (!updateData.password) delete updateData.password
        await axios.put(`/api/users/${editData.id}`, updateData)
        toast.success('Pengguna berhasil diperbarui')
      } else {
        await axios.post('/api/users', form)
        toast.success('Pengguna berhasil dibuat')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return
    try {
      await axios.delete(`/api/users/${id}`)
      toast.success('Pengguna berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus')
    }
  }

  const resetPassword = async (id) => {
    if (!confirm('Reset password ke default (password123)?')) return
    try {
      await axios.post(`/api/users/${id}/reset-password`)
      toast.success('Password berhasil direset ke default')
    } catch (err) {
      toast.error('Gagal reset password')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pengguna</h1>
          <p className="text-gray-500">Kelola akun dan hak akses pengguna</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <button type="submit" className="btn-primary">Cari</button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="4" className="px-4 py-3"><div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div></td></tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-bps-navy rounded-full flex items-center justify-center text-white text-sm font-medium">{item.name?.charAt(0)}</div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleLabels[item.role]?.color || 'bg-gray-100'}`}>
                        {roleLabels[item.role]?.label || item.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => resetPassword(item.id)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Reset Password"><Key className="w-4 h-4" /></button>
                        <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">Halaman {pagination.page} dari {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" required={!editData} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{editData ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input" required={!editData} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input">
                  <option value="admin">Administrator</option>
                  <option value="pimpinan">Pimpinan</option>
                  <option value="pelapor">Pelapor</option>
                  <option value="pramubakti">Pramubakti</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">{editData ? 'Simpan' : 'Buat'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
