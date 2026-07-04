import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { 
  Users, CalendarCheck, ClipboardList, Award, TrendingUp, Clock,
  CheckCircle, AlertCircle, Bell, ArrowRight, Calendar
} from 'lucide-react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [myData, setMyData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (user?.role === 'pramubakti') {
        const res = await axios.get('/api/dashboard/my-dashboard')
        setMyData(res.data.data)
      } else {
        const res = await axios.get('/api/dashboard/stats')
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value || 0}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-medium">{trend}</span>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Pramubakti Dashboard
  if (user?.role === 'pramubakti') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Selamat datang, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/kehadiran')} className="btn-primary flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" /> Absensi
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ClipboardList} label="Total Tugas Bulan Ini" value={myData?.totalTugas || 0} color="bg-blue-500" />
          <StatCard icon={CheckCircle} label="Tugas Selesai" value={myData?.tugasSelesai || 0} color="bg-green-500" />
          <StatCard icon={AlertCircle} label="Tugas Pending" value={myData?.tugasPending || 0} color="bg-yellow-500" />
        </div>

        {/* Kehadiran Hari Ini */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Kehadiran Hari Ini</h2>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {myData?.hadirHariIni ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Jam Masuk</p>
                  <p className="font-semibold">{myData.hadirHariIni.jam_masuk || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Jam Pulang</p>
                  <p className="font-semibold">{myData.hadirHariIni.jam_pulang || '-'}</p>
                </div>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                myData.hadirHariIni.jam_pulang ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {myData.hadirHariIni.jam_pulang ? 'Sudah Pulang' : 'Belum Pulang'}
              </span>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum melakukan absensi hari ini</p>
              <button onClick={() => navigate('/kehadiran')} className="mt-3 btn-primary">
                Absensi Sekarang
              </button>
            </div>
          )}
        </div>

        {/* Tugas Hari Ini */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Tugas Hari Ini</h2>
            <button onClick={() => navigate('/tugas')} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {myData?.tugasHariIni?.length > 0 ? (
            <div className="space-y-3">
              {myData.tugasHariIni.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.prioritas === 'Urgen' ? 'bg-red-500' :
                      task.prioritas === 'Tinggi' ? 'bg-orange-500' :
                      task.prioritas === 'Sedang' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.judul}</p>
                      <p className="text-xs text-gray-500">{task.jam_mulai} - {task.jam_selesai}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    task.status === 'Sedang Dikerjakan' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada tugas untuk hari ini</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Admin/Pimpinan/Pelapor Dashboard
  const chartData = {
    labels: stats?.monthlyAttendance?.map(d => d.tanggal.split('-')[2]) || [],
    datasets: [{
      label: 'Kehadiran',
      data: stats?.monthlyAttendance?.map(d => d.jumlah) || [],
      backgroundColor: 'rgba(37, 99, 235, 0.5)',
      borderColor: 'rgb(37, 99, 235)',
      borderWidth: 1,
      borderRadius: 4,
    }]
  }

  const taskChartData = {
    labels: ['Belum Dikerjakan', 'Sedang Dikerjakan', 'Selesai', 'Overdue'],
    datasets: [{
      data: [
        stats?.tugasPending || 0,
        (stats?.totalTugas || 0) - (stats?.tugasSelesai || 0) - (stats?.tugasPending || 0),
        stats?.tugasSelesai || 0,
        0
      ].filter(v => v >= 0),
      backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444'],
      borderWidth: 0,
    }]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ringkasan data {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Pramubakti" value={stats?.totalPramubakti || 0} color="bg-blue-500" />
        <StatCard icon={CalendarCheck} label="Hadir Hari Ini" value={`${stats?.hadirHariIni || 0}/${stats?.totalPramubakti || 0}`} color="bg-green-500" />
        <StatCard icon={ClipboardList} label="Total Tugas" value={stats?.totalTugas || 0} color="bg-purple-500" />
        <StatCard icon={Award} label="Tugas Selesai" value={stats?.tugasSelesai || 0} color="bg-orange-500" trend={`${stats?.totalTugas ? Math.round((stats.tugasSelesai / stats.totalTugas) * 100) : 0}%`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Kehadiran Bulanan</h2>
          <div className="h-64">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* Task Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Distribusi Tugas</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut 
              data={taskChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Aktivitas Terbaru</h2>
            <button onClick={() => navigate('/tugas')} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentTasks?.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'Selesai' ? 'bg-green-500' : task.status === 'Sedang Dikerjakan' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{task.judul}</p>
                    <p className="text-xs text-gray-500">{task.pramubakti?.nama}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{task.tanggal}</span>
              </div>
            ))}
            {(!stats?.recentTasks || stats.recentTasks.length === 0) && (
              <p className="text-center text-gray-500 py-8">Belum ada aktivitas</p>
            )}
          </div>
        </div>

        {/* Pengumuman */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Pengumuman</h2>
            <button onClick={() => navigate('/pengumuman')} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {stats?.activeAnnouncements > 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">{stats.activeAnnouncements} Pengumuman Aktif</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">Ada pengumuman baru yang perlu dilihat.</p>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Tidak ada pengumuman</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
