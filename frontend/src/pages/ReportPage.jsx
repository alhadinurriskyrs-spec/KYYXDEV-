import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FileText, Download, Printer, Users, CalendarCheck, ClipboardList, Award } from 'lucide-react'

export default function ReportPage() {
  const { user } = useAuth()
  const toast = useToast()
  
  const [tab, setTab] = useState('pramubakti')
  const [pramubaktis, setPramubaktis] = useState([])
  const [filter, setFilter] = useState({ bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear() })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchPramubaktis()
  }, [])

  const fetchPramubaktis = async () => {
    try {
      const res = await axios.get('/api/pramubakti?limit=100')
      setPramubaktis(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const generateReport = async (type, format) => {
    setGenerating(true)
    try {
      const params = new URLSearchParams({ ...filter, format })
      window.open(`/api/reports/${type}?${params}`, '_blank')
      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`)
    } catch (err) {
      toast.error('Gagal menghasilkan laporan')
    } finally {
      setGenerating(false)
    }
  }

  const printReport = (type) => {
    window.print()
  }

  const reportTypes = [
    { id: 'pramubakti', label: 'Laporan Pramubakti', icon: Users, desc: 'Data lengkap pramubakti BPS' },
    { id: 'attendance', label: 'Laporan Kehadiran', icon: CalendarCheck, desc: 'Rekapitulasi kehadiran harian' },
    { id: 'tasks', label: 'Laporan Tugas Harian', icon: ClipboardList, desc: 'Pencatatan tugas harian' },
    { id: 'performance', label: 'Laporan Penilaian', icon: Award, desc: 'Hasil penilaian kinerja' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan</h1>
        <p className="text-gray-500">Generate dan unduh laporan dalam format PDF atau Excel</p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Bulan</label>
            <select value={filter.bulan} onChange={(e) => setFilter({...filter, bulan: e.target.value})} className="input w-auto">
              {[
                { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' }, { value: 3, label: 'Maret' },
                { value: 4, label: 'April' }, { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
                { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' }, { value: 9, label: 'September' },
                { value: 10, label: 'Oktober' }, { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
              ].map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select value={filter.tahun} onChange={(e) => setFilter({...filter, tahun: e.target.value})} className="input w-auto">
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - i
                return <option key={i} value={y}>{y}</option>
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <report.icon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{report.label}</h3>
                <p className="text-sm text-gray-500">{report.desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => generateReport(report.id, 'pdf')} 
                disabled={generating}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {generating ? 'Memproses...' : 'PDF'}
              </button>
              <button 
                onClick={() => generateReport(report.id, 'excel')} 
                disabled={generating}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button 
                onClick={() => generateReport(report.id, 'pdf')}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Informasi Laporan</h4>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Laporan PDF menggunakan format resmi BPS</li>
              <li>• Laporan Excel dapat diedit sesuai kebutuhan</li>
              <li>• Periode: {new Date(filter.tahun, filter.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</li>
              <li>• Data diambil langsung dari database sistem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
