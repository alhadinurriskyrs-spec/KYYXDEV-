import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Building2, Users, CalendarCheck, ClipboardList, Award, FileText,
  Phone, Mail, MessageCircle, Instagram, Send, ChevronDown, Menu, X,
  CheckCircle, ArrowRight, BarChart3, Bell, Shield
} from 'lucide-react'

const navLinks = [
  { name: 'Beranda', href: '#beranda' },
  { name: 'Tentang', href: '#tentang' },
  { name: 'Fitur', href: '#fitur' },
  { name: 'Statistik', href: '#statistik' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Kontak', href: '#kontak' },
]

const bantuanLinks = [
  { name: 'WhatsApp', value: '085188791564', href: 'https://wa.me/6285188791564', icon: Phone, color: 'bg-green-500' },
  { name: 'Instagram', value: '@kyy_sql', href: 'https://instagram.com/kyy_sql', icon: Instagram, color: 'bg-pink-500' },
  { name: 'Telegram', value: '@KYYSTARBOYY', href: 'https://t.me/KYYSTARBOYY', icon: Send, color: 'bg-blue-500' },
  { name: 'Email', value: 'alhadinurriskyrs@gmail.com', href: 'mailto:alhadinurriskyrs@gmail.com', icon: Mail, color: 'bg-red-500' },
]

const features = [
  { icon: Users, title: 'Manajemen Pramubakti', desc: 'Kelola data pramubakti dengan mudah dan efisien' },
  { icon: CalendarCheck, title: 'Absensi Digital', desc: 'Sistem absensi masuk dan pulang yang modern' },
  { icon: ClipboardList, title: 'Tugas Harian', desc: 'Pembagian dan pelacakan tugas harian' },
  { icon: Award, title: 'Penilaian Kinerja', desc: 'Sistem penilaian dan pemeringkatan otomatis' },
  { icon: FileText, title: 'Laporan Lengkap', desc: 'Generate laporan PDF dan Excel' },
  { icon: Bell, title: 'Notifikasi Real-time', desc: 'Pemberitahuan otomatis untuk setiap aktivitas' },
]

const stats = [
  { value: '30+', label: 'Pramubakti' },
  { value: '1000+', label: 'Data Kehadiran' },
  { value: '500+', label: 'Tugas Selesai' },
  { value: '24/7', label: 'Sistem Aktif' },
]

const faqs = [
  { q: 'Bagaimana cara login ke sistem?', a: 'Klik tombol Masuk di navbar dan gunakan akun yang telah diberikan oleh administrator.' },
  { q: 'Apakah saya bisa mengakses dari perangkat mobile?', a: 'Ya, sistem dirancang responsif dan dapat diakses dari smartphone, tablet, dan komputer.' },
  { q: 'Bagaimana cara melaporkan masalah teknis?', a: 'Hubungi tim support melalui WhatsApp, Instagram, Telegram, atau email yang tersedia.' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bps-navy rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-bps-navy dark:text-white text-sm md:text-base">SIM Pramubakti BPS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Sistem Informasi Manajemen</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-bps-navy dark:hover:text-white font-medium text-sm transition-colors">
                  {link.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/masuk" className="bg-bps-navy text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                Masuk
              </Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <a key={link.name} href={link.href} className="block text-gray-600 dark:text-gray-300 hover:text-bps-navy py-2">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="beranda" className="relative pt-20 md:pt-32 pb-20 md:pb-40 bg-gradient-to-br from-bps-navy via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-6">
                Sistem Informasi Manajemen Terintegrasi
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Kelola Pramubakti BPS dengan <span className="text-blue-300">Modern</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
                Sistem terintegrasi untuk mengelola kehadiran, tugas, dan kinerja pramubakti secara efisien dan transparan.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/masuk" className="bg-white text-bps-navy px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                  Masuk ke Sistem <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#fitur" className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2">
                  Pelajari Selengkapnya <ChevronDown className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Absensi Berhasil</p>
                      <p className="text-sm text-blue-200">08:00 WIB</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Hadir Hari Ini</span>
                      <span className="font-bold">28/30</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Tugas Selesai</span>
                      <span className="font-bold">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-sm">Rating Kinerja</span>
                      <span className="font-bold text-yellow-300">4.8/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent dark:from-slate-900"></div>
      </section>

      {/* Tentang Section */}
      <section id="tentang" className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Tentang Sistem Kami</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Sistem Informasi Manajemen Pramubakti BPS dirancang untuk meningkatkan efisiensi dan transparansi dalam pengelolaan sumber daya manusia.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Vis</h3>
              <p className="text-gray-600 dark:text-gray-300">Menjadi sistem manajemen pramubakti terbaik yang mendukung optimalisasi kinerja organisasi BPS.</p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Misi</h3>
              <p className="text-gray-600 dark:text-gray-300">Memberikan layanan digital yang andal, akurat, dan mudah digunakan untuk semua stakeholder.</p>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Tujuan</h3>
              <p className="text-gray-600 dark:text-gray-300">Meningkatkan produktivitas dan akuntabilitas pramubakti melalui sistem yang terstruktur dan terkontrol.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Fitur Unggulan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Berbagai fitur lengkap untuk memenuhi kebutuhan manajemen pramubakti modern.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-bps-navy rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik Section */}
      <section id="statistik" className="py-20 bg-bps-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Statistik Sistem</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">Data real-time dari sistem kami</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Pertanyaan Umum</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-slate-700 rounded-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak Section */}
      <section id="kontak" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Bantuan & Kontak</h2>
            <p className="text-gray-600 dark:text-gray-400">Hubungi kami melalui berbagai channel</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bantuanLinks.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bps-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">SIM Pramubakti BPS</h3>
                <p className="text-sm text-blue-200">Badan Pusat Statistik</p>
              </div>
            </div>
            <p className="text-sm text-blue-200">© 2024 Sistem Informasi Manajemen Pramubakti BPS. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
