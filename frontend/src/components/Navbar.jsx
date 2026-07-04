import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Menu, Search, Bell, Moon, Sun, User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function Navbar({ onMenuClick, darkMode, toggleDarkMode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?limit=5')
      setNotifications(res.data.data || [])
      setUnreadCount(res.data.unread || 0)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const roleLabels = {
    admin: 'Administrator',
    pimpinan: 'Pimpinan',
    pelapor: 'Pelapor',
    pramubakti: 'Pramubakti'
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    pimpinan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    pelapor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    pramubakti: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifikasi</h3>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">Tidak ada notifikasi</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id)
                        if (notif.link) navigate(notif.link)
                        setNotifOpen(false)
                      }}
                      className={`p-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                        <div className={!notif.is_read ? '' : 'ml-4'}>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{notif.judul}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.pesan}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <div className="w-8 h-8 bg-bps-navy rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name || 'Pengguna'}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
                {roleLabels[user?.role] || user?.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/profil'); setDropdownOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                >
                  <User className="w-4 h-4" /> Profil
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => { navigate('/pengaturan'); setDropdownOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                  >
                    <Settings className="w-4 h-4" /> Pengaturan
                  </button>
                )}
                <button
                  onClick={() => { logout(); navigate('/masuk') }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
