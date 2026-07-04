import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Calendar, Clock, MapPin, CheckCircle, Camera, ChevronLeft, ChevronRight, Download, Filter, FileText } from 'lucide-react'

export default function AttendancePage() {
  const { user } = useAuth()
  const toast = useToast()
  
  const [tab, setTab] = useState('riwayat')
  const [data, setData] = useState([])
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [monthlyRecap, setMonthlyRecap] = useState([])
  const [yearlyData, setYearlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pramubaktiId, setPramubaktiId] = useState(null)
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() })
  const [pramubaktis, setPramubaktis] = useState([])
  const [clockInLoading, setClockInLoading] = useState(false)
  const [clockOutLoading, setClockOutLoading] = useState(false)

  const isPramubakti = user?.role === 'pramubakti'
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) fetchPramubaktis()
    fetchTodayAttendance()
    fetchData()
  }, [])

  useEffect(() => {
    if (tab === 'rekap-bulanan') fetchMonthlyRecap()
    if (tab === 'rekap-tahunan') fetchYearlyData()
  }, [tab, filter])

  const fetchPramubaktis = async () => {
    try {
      const res = await axios.get('/api/pramubakti?limit=100')
      setPramubaktis(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchTodayAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance/today')
      setTodayAttendance(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filter)
      if (pramubaktiId) params.append('pramubakti_id', pramubaktiId)
      const res = await axios.get(`/api/attendance?${params}`)
      setData(res.data.data || [])
    } catch (err) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyRecap = async () => {
    try {
      const res = await axios.get(`/api/attendance/recap/monthly?bulan=${filter.bulan}&tahun=${filter.tahun}`)
      setMonthlyRecap(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchYearlyData = async () => {
    try {
      const res = await axios.get(`/api/attendance/recap/yearly?tahun=${filter.tahun}`)
      setYearlyData(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const handleClockIn = async () => {
    if (!pramubaktiId && isPramubakti) {
      toast.error('Data pramubakti tidak ditemukan')
      return
    }
    setClockInLoading(true)
    try {
      const res = await axios.post('/api/attendance/clock-in', {
        pramubakti_id: pramubaktiId,
        jam_masuk: new Date().toTimeString().split(' ')[0].substring(0, 8),
        lokasi_masuk: 'Kantor BPS'
      })
      toast.success(res.data.message || 'Absensi masuk berhasil')
      fetchTodayAttendance()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal absensi masuk')
    } finally {
      setClockInLoading(false)
    }
  }

  const handleClockOut = async () => {
    setClockOutLoading(true)
    try {
      const res = await axios.post('/api/attendance/clock-out', {
        pramubakti_id: pramubaktiId,
        jam_pulang: new Date().toTimeString().split(' ')[0].substring(0, 8),
        lokasi_pulang: 'Kantor BPS'
      })
      toast.success(res.data.message || 'Absensi pulang berhasil')
      fetchTodayAttendance()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal absensi pulang')
    } finally {
      setClockOutLoading(false)
    }
  }

  const exportReport = async (format) => {
    try {
      const params = new URLSearchParams({ ...filter, format })
      if (pramubaktiId) params.append('pramubakti_id', pramubaktiId)
      window.open(`/api/reports/attendance?${params}`, '_blank')
    } catch (err) {
      toast.error('Gagal mengekspor laporan')
    }
  }

  const todayMyAttendance = todayAttendance?.find(a => !isAdmin || a.pramubakti_id === parseInt(pramubaktiId))

  const tabs = [
    { id: 'riwayat', label: 'Riwayat' },
    { id: 'rekap-bulanan', label: 'Rekap Bulanan' },
    { id: 'rekap-tahunan', label: 'Rekap Tahunan' },
  ]

  if (isPramubakti) {
    tabs.unshift({ id: 'absen', label: 'Absensi' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kehadiran</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {(isAdmin || user?.role === 'pimpinan' || user?.role === 'pelapor') && (
          <div className="flex gap-2">
            <button onClick={() => exportReport('pdf')} className="btn-secondary flex items-center gap-2"><FileText className="w-4 h-4" /> PDF</button>
            <button onClick={() => exportReport('excel')} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Excel</button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-bps-navy text-white' : 'bg-white dark:bg-slate-800 text-gray-600 hover:bg-gray-100'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Absensi Tab (Pramubakti only) */}
      {tab === 'absen' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" /> Absensi Masuk
            </h3>
            <p className="text-gray-500 text-sm mb-4">Klik tombol di bawah untuk melakukan absensi masuk</p>
            <button onClick={handleClockIn} disabled={clockInLoading || todayMyAttendance?.jam_masuk} className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
              {clockInLoading ? (
                <span className="animate-spin">⏳</span>
              ) : todayMyAttendance?.jam_masuk ? (
                <>✅ Sudah Absen ({todayMyAttendance.jam_masuk})</>
              ) : (
                <>📋 Absen Masuk Sekarang ({new Date().toLocaleTimeString('id-ID')})</>
              )}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Absensi Pulang
            </h3>
            <p className="text-gray-500 text-sm mb-4">Klik tombol di bawah untuk melakukan absensi pulang</p>
            <button onClick={handleClockOut} disabled={clockOutLoading || !todayMyAttendance?.jam_masuk || todayMyAttendance?.jam_pulang} className="w-full py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
              {clockOutLoading ? (
                <span className="animate-spin">⏳</span>
              ) : todayMyAttendance?.jam_pulang ? (
                <>✅ Sudah Pulang ({todayMyAttendance.jam_pulang})</>
              ) : !todayMyAttendance?.jam_masuk ? (
                <>⏳ Harus Absen Masuk Dulu</>
              ) : (
                <>📋 Absen Pulang Sekarang ({new Date().toLocaleTimeString('id-ID')})</>
              )}
            </button>
          </div>

          {/* Today's Summary */}
          <div className="md:col-span-2 bg-gradient-to-r from-bps-navy to-blue-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-4">📊 Ringkasan Hari Ini</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-blue-200">Jam Masuk</p>
                <p className="text-xl font-bold">{todayMyAttendance?.jam_masuk || '-'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-blue-200">Jam Pulang</p>
                <p className="text-xl font-bold">{todayMyAttendance?.jam_pulang || '-'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-blue-200">Status Masuk</p>
                <p className="text-xl font-bold">{todayMyAttendance?.status_masuk || '-'}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-blue-200">Status Pulang</p>
                <p className="text-xl font-bold">{todayMyAttendance?.status_pulang || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Tab */}
      {tab === 'riwayat' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4">
              {isAdmin && (
                <select value={pramubaktiId} onChange={(e) => { setPramubaktiId(e.target.value); fetchData() }} className="input w-auto">
                  <option value="">Semua Pramubakti</option>
                  {pramubaktis.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              )}
              <input type="month" value={`${filter.tahun}-${String(filter.bulan).padStart(2, '0')}`} onChange={(e) => { const [y, m] = e.target.value.split('-'); setFilter({ tahun: y, bulan: m }); }} className="input w-auto" />
              <button onClick={fetchData} className="btn-primary">Tampilkan</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    {!isPramubakti && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Masuk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Pulang</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Masuk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pulang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {loading ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center"><div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mx-auto w-1/2"></div></td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Tidak ada data kehadiran</td></tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-4 py-3 text-sm">{item.tanggal}</td>
                        {!isPramubakti && <td className="px-4 py-3 text-sm font-medium">{item.pramubakti?.nama || '-'}</td>}
                        <td className="px-4 py-3 text-sm">{item.jam_masuk || '-'}</td>
                        <td className="px-4 py-3 text-sm">{item.jam_pulang || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status_masuk === 'Tepat Waktu' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {item.status_masuk}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status_pulang === 'Pulang Tepat Waktu' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {item.status_pulang}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Rekap Bulanan */}
      {tab === 'rekap-bulanan' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold">Rekap Bulanan {new Date(filter.tahun, filter.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
            <select value={`${filter.tahun}-${String(filter.bulan).padStart(2, '0')}`} onChange={(e) => { const [y, m] = e.target.value.split('-'); setFilter({ tahun: y, bulan: m }); }} className="input w-auto">
              {[...Array(12)].map((_, i) => {
                const d = new Date(); d.setMonth(d.getMonth() - i)
                return <option key={i} value={`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`}>{d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</option>
              })}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Kerja</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Hadir</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Terlambat</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pulang Awal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {monthlyRecap.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3 text-sm font-medium">{item.pramubakti?.nama || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.pramubakti?.unit_kerja || '-'}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">{item.total_hadir}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-600">{item.total_terlambat}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-600">{item.total_pulang_awal}</td>
                  </tr>
                ))}
                {monthlyRecap.length === 0 && (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rekap Tahunan */}
      {tab === 'rekap-tahunan' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold">Rekap Tahunan {filter.tahun}</h3>
            <select value={filter.tahun} onChange={(e) => setFilter({ ...filter, tahun: e.target.value })} className="input w-auto">
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i
                return <option key={i} value={y}>{y}</option>
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((bulan, i) => {
              const data = yearlyData.find(d => d.bulan === i + 1)
              return (
                <div key={i} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">{bulan}</p>
                  <p className="text-2xl font-bold text-bps-navy">{data?.hadir_tepat_waktu || 0}</p>
                  <p className="text-xs text-gray-400">hadir tepat waktu</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
