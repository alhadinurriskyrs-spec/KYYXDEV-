import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '../context/ToastContext'
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, User, Filter } from 'lucide-react'

export default function PramubaktiPage() {
  const toast = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({
    nik: '', nama: '', jenis_kelamin: 'Laki-laki', tempat_lahir: '', tanggal_lahir: '', 
    alamat: '', nomor_hp: '', email: '', jabatan: '', unit_kerja: '', tanggal_masuk: '', status: 'Aktif'
  })

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/pramubakti?page=${page}&search=${search}`)
      setData(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(1)
  }

  const openModal = (item = null) => {
    if (item) {
      setEditData(item)
      setForm(item)
    } else {
      setEditData(null)
      setForm({ nik: '', nama: '', jenis_kelamin: 'Laki-laki', tempat_lahir: '', tanggal_lahir: '', alamat: '', nomor_hp: '', email: '', jabatan: '', unit_kerja: '', tanggal_masuk: '', status: 'Aktif' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await axios.put(`/api/pramubakti/${editData.id}`, form)
        toast.success('Data berhasil diperbarui')
      } else {
        await axios.post('/api/pramubakti', form)
        toast.success('Data berhasil ditambahkan')
      }
      setShowModal(false)
      fetchData(pagination.page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    try {
      await axios.delete(`/api/pramubakti/${id}`)
      toast.success('Data berhasil dihapus')
      fetchData(pagination.page)
    } catch (err) {
      toast.error('Gagal menghapus data')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Pramubakti</h1>
          <p className="text-gray-500">Kelola data pramubakti BPS</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pramubakti
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Cari nama, NIK, atau unit kerja..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan="6" className="px-4 py-3"><div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div></td></tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-bps-navy rounded-full flex items-center justify-center text-white text-sm font-medium">{item.nama?.charAt(0)}</div>
                        <span className="font-medium">{item.nama}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.nik}</td>
                    <td className="px-4 py-3 text-sm">{item.jabatan}</td>
                    <td className="px-4 py-3 text-sm">{item.unit_kerja}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
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
        
        {/* Pagination */}
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
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Pramubakti' : 'Tambah Pramubakti'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NIK</label>
                  <input type="text" value={form.nik} onChange={(e) => setForm({...form, nik: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select value={form.jenis_kelamin} onChange={(e) => setForm({...form, jenis_kelamin: e.target.value})} className="input">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input type="text" value={form.tempat_lahir} onChange={(e) => setForm({...form, tempat_lahir: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({...form, tanggal_lahir: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor HP</label>
                  <input type="text" value={form.nomor_hp} onChange={(e) => setForm({...form, nomor_hp: e.target.value})} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alamat</label>
                <textarea value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} className="input" rows="2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Jabatan</label>
                  <input type="text" value={form.jabatan} onChange={(e) => setForm({...form, jabatan: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Kerja</label>
                  <input type="text" value={form.unit_kerja} onChange={(e) => setForm({...form, unit_kerja: e.target.value})} className="input" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Masuk</label>
                  <input type="date" value={form.tanggal_masuk} onChange={(e) => setForm({...form, tanggal_masuk: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input">
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Mutasi">Mutasi</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
