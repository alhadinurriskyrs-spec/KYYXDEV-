import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Award, Plus, Edit, Trash2, Trophy, ChevronLeft, ChevronRight, TrendingUp, Star } from 'lucide-react'

export default function PerformancePage() {
  const { user } = useAuth()
  const toast = useToast()
  
  const [tab, setTab] = useState('penilaian')
  const [data, setData] = useState([])
  const [ranking, setRanking] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [pramubaktis, setPramubaktis] = useState([])
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() })
  
  const [form, setForm] = useState({
    pramubakti_id: '', periode: '', bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(),
    kedisiplinan: 80, produktivitas: 80, kualitas_kerja: 80, teamwork: 80, inisiatif: 80, komentar: '', catatan: ''
  })

  const isAdmin = user?.role === 'admin'
  const isPramubakti = user?.role === 'pramubakti'

  useEffect(() => {
    if (isAdmin) fetchPramubaktis()
    fetchData()
    if (tab === 'ranking') fetchRanking()
    if (tab === 'statistik') fetchStats()
  }, [tab, filter])

  const fetchPramubaktis = async () => {
    try {
      const res = await axios.get('/api/pramubakti?limit=100')
      setPramubaktis(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filter)
      if (isPramubakti) {
        const res = await axios.get(`/api/performance/my-performance?${params}`)
        setData(res.data.data || [])
      } else {
        const res = await axios.get(`/api/performance?${params}`)
        setData(res.data.data || [])
      }
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRanking = async () => {
    try {
      const res = await axios.get(`/api/performance/ranking?bulan=${filter.bulan}&tahun=${filter.tahun}`)
      setRanking(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`/api/performance/stats?bulan=${filter.bulan}&tahun=${filter.tahun}`)
      setStats(res.data.data)
    } catch (err) { console.error(err) }
  }

  const openModal = (item = null) => {
    if (item) {
      setEditData(item)
      setForm(item)
    } else {
      setEditData(null)
      const now = new Date()
      const bulan = now.toLocaleDateString('id-ID', { month: 'long' })
      setForm({ pramubakti_id: '', periode: `${bulan} ${now.getFullYear()}`, bulan: now.getMonth() + 1, tahun: now.getFullYear(), kedisiplinan: 80, produktivitas: 80, kualitas_kerja: 80, teamwork: 80, inisiatif: 80, komentar: '', catatan: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.pramubakti_id) {
      toast.error('Pilih pramubakti')
      return
    }
    try {
      if (editData) {
        await axios.put(`/api/performance/${editData.id}`, form)
        toast.success('Penilaian berhasil diperbarui')
      } else {
        await axios.post('/api/performance', form)
        toast.success('Penilaian berhasil disimpan')
      }
      setShowModal(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus penilaian ini?')) return
    try {
      await axios.delete(`/api/performance/${id}`)
      toast.success('Penilaian berhasil dihapus')
      fetchData()
    } catch (err) {
      toast.error('Gagal menghapus')
    }
  }

  const calculateAvg = (item) => {
    const avg = (parseFloat(item.kedisiplinan) + parseFloat(item.produktivitas) + parseFloat(item.kualitas_kerja) + parseFloat(item.teamwork) + parseFloat(item.inisiatif)) / 5
    return avg.toFixed(2)
  }

  const getGrade = (avg) => {
    if (avg >= 90) return { grade: 'A', color: 'text-green-600 bg-green-100' }
    if (avg >= 80) return { grade: 'B', color: 'text-blue-600 bg-blue-100' }
    if (avg >= 70) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100' }
    return { grade: 'D', color: 'text-red-600 bg-red-100' }
  }

  const tabs = [
    { id: 'penilaian', label: 'Penilaian' },
    { id: 'ranking', label: 'Peringkat' },
  ]
  if (!isPramubakti) tabs.push({ id: 'statistik', label: 'Statistik' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penilaian Kinerja</h1>
          <p className="text-gray-500">{new Date(filter.tahun, filter.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
        {isAdmin && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Input Penilaian
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-bps-navy text-white' : 'bg-white dark:bg-slate-800 text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
        <select value={`${filter.tahun}-${String(filter.bulan).padStart(2, '0')}`} onChange={(e) => { const [y, m] = e.target.value.split('-'); setFilter({ tahun: y, bulan: m }); }} className="input w-auto ml-auto">
          {[...Array(12)].map((_, i) => {
            const d = new Date(); d.setMonth(d.getMonth() - i)
            return <option key={i} value={`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`}>{d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</option>
          })}
        </select>
      </div>

      {/* Penilaian Tab */}
      {tab === 'penilaian' && (
        <div className="grid gap-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>)
          ) : data.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada data penilaian</p>
            </div>
          ) : (
            data.map((item) => {
              const avg = calculateAvg(item)
              const { grade, color } = getGrade(avg)
              return (
                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-bps-navy rounded-xl flex items-center justify-center text-white text-xl font-bold">
                        {item.pramubakti?.nama?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.pramubakti?.nama || '-'}</h3>
                        <p className="text-sm text-gray-500">{item.periode}</p>
                        {!isPramubakti && <p className="text-xs text-gray-400">{item.pramubakti?.jabatan} - {item.pramubakti?.unit_kerja}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full font-bold ${color}`}>{grade}</span>
                      <span className="text-2xl font-bold text-bps-navy">{avg}</span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button onClick={() => openModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {[
                      { label: 'Kedisiplinan', value: item.kedisiplinan },
                      { label: 'Produktivitas', value: item.produktivitas },
                      { label: 'Kualitas', value: item.kualitas_kerja },
                      { label: 'Teamwork', value: item.teamwork },
                      { label: 'Inisiatif', value: item.inisiatif },
                    ].map((metric, i) => (
                      <div key={i} className="text-center">
                        <div className="relative pt-1">
                          <div className="flex mb-1 items-center justify-between">
                            <div className="text-xs font-medium">{metric.label}</div>
                            <div className="text-xs font-bold">{metric.value}</div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div style={{ width: `${metric.value}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-bps-navy"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(item.komentar || item.catatan) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                      {item.komentar && <p className="text-sm text-gray-600"><strong>Komentar:</strong> {item.komentar}</p>}
                      {item.catatan && <p className="text-sm text-gray-500 mt-1"><strong>Catatan:</strong> {item.catatan}</p>}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Ranking Tab */}
      {tab === 'ranking' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-bold text-lg">Peringkat Kinerja</h3>
                <p className="text-sm text-gray-500">{new Date(filter.tahun, filter.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {ranking.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Belum ada data ranking</div>
            ) : (
              ranking.slice(0, 10).map((item, index) => {
                const avg = item.rata_rata || calculateAvg(item)
                const { grade, color } = getGrade(avg)
                return (
                  <div key={item.id} className={`flex items-center gap-4 p-4 ${index < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.pramubakti?.nama || '-'}</p>
                      <p className="text-sm text-gray-500">{item.pramubakti?.unit_kerja || '-'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${color}`}>{grade}</span>
                      <p className="text-lg font-bold text-bps-navy mt-1">{avg}</p>
                    </div>
                    {index < 3 && <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Statistik Tab */}
      {tab === 'statistik' && stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-gray-500 mb-2">Rata-rata Umum</p>
            <p className="text-4xl font-bold text-bps-navy">{stats.rata_rata_umum || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-gray-500 mb-2">Tertinggi</p>
            <p className="text-4xl font-bold text-green-600">{stats.tertinggi || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-gray-500 mb-2">Terendah</p>
            <p className="text-4xl font-bold text-red-600">{stats.terendah || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-gray-500 mb-2">Jumlah Dinilai</p>
            <p className="text-4xl font-bold text-blue-600">{stats.jumlah_dinilai || 0}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editData ? 'Edit Penilaian' : 'Input Penilaian Kinerja'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pramubakti *</label>
                <select value={form.pramubakti_id} onChange={(e) => setForm({...form, pramubakti_id: e.target.value})} className="input" required>
                  <option value="">-- Pilih Pramubakti --</option>
                  {pramubaktis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              {[
                { key: 'kedisiplinan', label: 'Kedisiplinan' },
                { key: 'produktivitas', label: 'Produktivitas' },
                { key: 'kualitas_kerja', label: 'Kualitas Kerja' },
                { key: 'teamwork', label: 'Teamwork' },
                { key: 'inisiatif', label: 'Inisiatif' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">{field.label} ({form[field.key]})</label>
                  <input type="range" min="0" max="100" value={form[field.key]} onChange={(e) => setForm({...form, [field.key]: e.target.value})} className="w-full" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Komentar</label>
                <textarea value={form.komentar} onChange={(e) => setForm({...form, komentar: e.target.value})} className="input" rows="2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea value={form.catatan} onChange={(e) => setForm({...form, catatan: e.target.value})} className="input" rows="2" />
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
