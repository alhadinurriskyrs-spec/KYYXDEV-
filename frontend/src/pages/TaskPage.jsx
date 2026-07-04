import { useState, useEffect, useRef } from 'react'
import axios from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Search, Plus, Edit, Trash2, Upload, CheckCircle, Clock, AlertCircle, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function TaskPage() {
  const { user } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef(null)
  
  const [data, setData] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [pramubaktis, setPramubaktis] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [filter, setFilter] = useState({ status: '', prioritas: '', tanggal: '' })
  const [uploading, setUploading] = useState(false)
  
  const [form, setForm] = useState({
    pramubakti_id: '', judul: '', deskripsi: '', tanggal: '', jam_mulai: '', jam_selesai: '', tenggat_waktu: '', prioritas: 'Sedang'
  })

  const isAdmin = user?.role === 'admin'
  const isPramubakti = user?.role === 'pramubakti'

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      if (isPramubakti) {
        const params = new URLSearchParams()
        if (filter.status) params.append('status', filter.status)
        if (filter.tanggal) params.append('tanggal', filter.tanggal)
        const res = await axios.get(`/api/tasks/my-tasks?${params}`)
        setMyTasks(res.data.data || [])
        setData(res.data.data || [])
      } else {
        const params = new URLSearchParams({ page, ...filter })
        const res = await axios.get(`/api/tasks?${params}`)
        setData(res.data.data)
        setPagination(res.data.pagination)
      }
    } catch (err) {
      toast.error('Gagal memuat data tugas')
    } finally {
      setLoading(false)
    }
  }

  const fetchPramubaktis = async () => {
    try {
      const res = await axios.get('/pramubakti?limit=100')
      setPramubaktis(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch pramubaktis')
    }
  }

  useEffect(() => {
    fetchData()
    if (isAdmin) fetchPramubaktis()
  }, [])

  const openModal = (item = null) => {
    if (item) {
      setEditData(item)
      setForm(item)
    } else {
      setEditData(null)
      setForm({ pramubakti_id: '', judul: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0], jam_mulai: '08:00', jam_selesai: '16:00', tenggat_waktu: '', prioritas: 'Sedang' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isAdmin && !form.pramubakti_id) {
      toast.error('Pilih pramubakti')
      return
    }
    try {
      if (editData) {
        await axios.put(`/api/tasks/${editData.id}`, form)
        toast.success('Tugas berhasil diperbarui')
      } else {
        await axios.post('/tasks', form)
        toast.success('Tugas berhasil dibuat')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return
    try {
      await axios.delete(`/api/tasks/${id}`)
      toast.success('Tugas berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus tugas')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/tasks/${id}/status`, { status })
      toast.success(`Status diubah ke "${status}"`)
      fetchData()
    } catch (err) {
      toast.error('Gagal mengubah status')
    }
  }

  const uploadEvidence = async (taskId, file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('bukti', file)
    try {
      await axios.post(`/api/tasks/${taskId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Bukti berhasil diunggah')
      fetchData()
    } catch (err) {
      toast.error('Gagal mengunggah bukti')
    } finally {
      setUploading(false)
    }
  }

  const priorityColors = {
    'Rendah': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Sedang': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Tinggi': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'Urgen': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }

  const statusIcons = {
    'Belum Dikerjakan': <Clock className="w-4 h-4 text-gray-400" />,
    'Sedang Dikerjakan': <AlertCircle className="w-4 h-4 text-blue-500" />,
    'Selesai': <CheckCircle className="w-4 h-4 text-green-500" />,
    'Overdue': <AlertCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tugas Harian</h1>
          <p className="text-gray-500">{isPramubakti ? 'Tugas Anda hari ini' : 'Kelola semua tugas pramubakti'}</p>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Buat Tugas Baru
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <select value={filter.status} onChange={(e) => { setFilter({...filter, status: e.target.value}); fetchData() }} className="input w-auto">
            <option value="">Semua Status</option>
            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Selesai">Selesai</option>
            <option value="Overdue">Overdue</option>
          </select>
          {!isPramubakti && (
            <select value={filter.prioritas} onChange={(e) => { setFilter({...filter, prioritas: e.target.value}); fetchData() }} className="input w-auto">
              <option value="">Semua Prioritas</option>
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Urgen">Urgen</option>
            </select>
          )}
          <input type="date" value={filter.tanggal} onChange={(e) => { setFilter({...filter, tanggal: e.target.value}); fetchData() }} className="input w-auto" />
          <button onClick={() => { setFilter({status: '', prioritas: '', tanggal: ''}); fetchData() }} className="btn-secondary">Reset</button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada tugas</p>
          </div>
        ) : (
          data.map((task) => (
            <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${task.status === 'Selesai' ? 'bg-green-100 dark:bg-green-900/30' : task.status === 'Sedang Dikerjakan' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                    {statusIcons[task.status]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{task.judul}</h3>
                    {task.deskripsi && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.deskripsi}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.prioritas]}`}>{task.prioritas}</span>
                      {task.pramubakti && <span className="text-xs text-gray-500">👤 {task.pramubakti.nama}</span>}
                      <span className="text-xs text-gray-500">📅 {task.tanggal}</span>
                      {task.jam_mulai && <span className="text-xs text-gray-500">⏰ {task.jam_mulai} - {task.jam_selesai}</span>}
                      {task.progress > 0 && <span className="text-xs text-blue-600 font-medium">{task.progress}%</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPramubakti && task.status !== 'Selesai' && (
                    <>
                      {task.status === 'Belum Dikerjakan' && (
                        <button onClick={() => updateStatus(task.id, 'Sedang Dikerjakan')} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">Mulai</button>
                      )}
                      {task.status === 'Sedang Dikerjakan' && (
                        <button onClick={() => updateStatus(task.id, 'Selesai')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">Selesai</button>
                      )}
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg">
                        <Upload className="w-4 h-4" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files[0] && uploadEvidence(task.id, e.target.files[0])} />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => openModal(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
              {task.bukti && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <span className="text-xs text-green-600 font-medium">✅ Bukti terlampir</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isPramubakti && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-gray-500">Halaman {pagination.page} dari {pagination.totalPages}</span>
          <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Tugas' : 'Buat Tugas Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium mb-1">Pramubakti *</label>
                  <select value={form.pramubakti_id} onChange={(e) => setForm({...form, pramubakti_id: e.target.value})} className="input" required>
                    <option value="">-- Pilih Pramubakti --</option>
                    {pramubaktis.map(p => (
                      <option key={p.id} value={p.id}>{p.nama} - {p.unit_kerja}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Judul Tugas *</label>
                <input type="text" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({...form, deskripsi: e.target.value})} className="input" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal *</label>
                  <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioritas</label>
                  <select value={form.prioritas} onChange={(e) => setForm({...form, prioritas: e.target.value})} className="input">
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Urgen">Urgen</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                  <input type="time" value={form.jam_mulai} onChange={(e) => setForm({...form, jam_mulai: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                  <input type="time" value={form.jam_selesai} onChange={(e) => setForm({...form, jam_selesai: e.target.value})} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenggat Waktu</label>
                <input type="datetime-local" value={form.tenggat_waktu} onChange={(e) => setForm({...form, tenggat_waktu: e.target.value})} className="input" />
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
