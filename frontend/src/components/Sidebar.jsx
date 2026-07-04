import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, CalendarCheck, ClipboardList, Award,
  FileText, Bell, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, Shield
} from 'lucide-react'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
  { path: '/pramubakti', icon: Users, label: 'Manajemen Pramubakti', roles: ['admin', 'pimpinan', 'pelapor'] },
  { path: '/kehadiran', icon: CalendarCheck, label: 'Kehadiran', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
  { path: '/tugas', icon: ClipboardList, label: 'Tugas Harian', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
  { path: '/penilaian', icon: Award, label: 'Penilaian Kinerja', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
  { path: '/laporan', icon: FileText, label: 'Laporan', roles: ['admin', 'pimpinan', 'pelapor'] },
  { path: '/pengguna', icon: Shield, label: 'Pengguna', roles: ['admin'] },
  { path: '/pengumuman', icon: Bell, label: 'Pengumuman', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
  { path: '/pengaturan', icon: Settings, label: 'Pengaturan', roles: ['admin'] },
  { path: '/profil', icon: User, label: 'Profil', roles: ['admin', 'pimpinan', 'pelapor', 'pramubakti'] },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bps-navy rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-bps-navy dark:text-white text-sm">SIM</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pramubakti BPS</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-bps-navy rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-bps-navy text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
              text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-sm">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
