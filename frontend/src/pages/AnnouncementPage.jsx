import { useState, useEffect } from 'react'
import axios from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Bell, Plus, Edit, Trash2, Pin, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'

export default function AnnouncementPage() {
  const { user } = useAuth()
  const toast = useToast()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  const [editData, setEditData] = useState(null)
  const [search, setSearch] = useState('')
  
  const [form, setForm] = useState({
    judul: '', konten: '', kategori: 'Umum', tgl_mulai: '', tgl_selesai: '', is_pinned: false
  })

  const isAdmin = user?.role === 'admin'

  useEffect(() => { fetchData() }, [])

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/announcements?page=${page}&search=${search}`)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error('Gagal memuat pengumuman')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (item = null) => {
    if (item) {
      setEditData(item)
      setForm(item)
    } else {
      setEditData(null)
      setForm({ judul: '', konten: '', kategori: 'Umum', tgl_mulai: new Date().toISOString().split('T')[0], tgl_selesai: '', is_pinned: false })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await axios.put(`/api/announcements/${editData.id}`, form)
        toast.success('Pengumuman berhasil diperbarui')
      } else {
        await axios.post('/announcements', form)
        toast.success('Pengumuman berhasil dibuat')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return
    try {
      await axios.delete(`/api/announcements/${id}`)
      toast.success('Pengumuman berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus')
    }
  }

  const togglePin = async (id) => {
    try {
      await axios.patch(`/api/announcements/${id}/pin`)
      toast.success('Status pin berhasil diubah')
      fetchData()
    } catch (err) {
      toast.error('Gagal mengubah status pin')
    }
  }

  const categoryColors = {
    'Umum': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Penting': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'Info': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
          <p className="text-gray-500">Informasi dan pengumuman penting</p>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Buat Pengumuman
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); fetchData() }} className="flex gap-2">
        <input type="text" placeholder="Cari pengumuman..." value={search} onChange={(e) => setSearch(e.target.value)} className="input flex-1" />
        <button type="submit" className="btn-primary">Cari</button>
      </form>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada pengumuman</p>
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow ${item.is_pinned ? 'border-l-4 border-l-yellow-500' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${item.kategori === 'Urgent' ? 'bg-red-100 dark:bg-red-900/30' : item.kategori === 'Penting' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <Bell className={`w-5 h-5 ${item.kategori === 'Urgent' ? 'text-red-600' : item.kategori === 'Penting' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.judul}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.kategori]}`}>{item.kategori}</span>
                      {item.is_pinned && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 flex items-center gap-1"><Pin className="w-3 h-3" />Disematkan</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.konten}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.tgl_mulai}</span>
                      {item.tgl_selesai && <><span>-</span><span>{item.tgl_selesai}</span></>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowDetail(item)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">Baca</button>
                  {isAdmin && (
                    <>
                      <button onClick={() => togglePin(item.id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"><Pin className="w-4 h-4" /></button>
                      <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchData(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-gray-500">Halaman {pagination.page} dari {pagination.totalPages}</span>
          <button onClick={() => fetchData(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[showDetail.kategori]}`}>{showDetail.kategori}</span>
                {showDetail.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
              </div>
              <button onClick={() => setShowDetail(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <h2 className="text-xl font-bold mb-4">{showDetail.judul}</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{showDetail.konten}</p>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-sm text-gray-500">
              <span>Berlaku: {showDetail.tgl_mulai} {showDetail.tgl_selesai ? `- ${showDetail.tgl_selesai}` : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Pengumuman' : 'Buat Pengumuman'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul *</label>
                <input type="text" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Konten *</label>
                <textarea value={form.konten} onChange={(e) => setForm({...form, konten: e.target.value})} className="input" rows="5" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})} className="input">
                    <option value="Umum">Umum</option>
                    <option value="Penting">Penting</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({...form, is_pinned: e.target.checked})} className="w-4 h-4 rounded" />
                    <span className="text-sm">Sematkan di atas</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                  <input type="date" value={form.tgl_mulai} onChange={(e) => setForm({...form, tgl_mulai: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                  <input type="date" value={form.tgl_selesai} onChange={(e) => setForm({...form, tgl_selesai: e.target.value})} className="input" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">{editData ? 'Simpan' : 'Publikasikan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
