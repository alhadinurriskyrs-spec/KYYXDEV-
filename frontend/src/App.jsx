import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import PramubaktiPage from './pages/PramubaktiPage'
import AttendancePage from './pages/AttendancePage'
import TaskPage from './pages/TaskPage'
import PerformancePage from './pages/PerformancePage'
import ReportPage from './pages/ReportPage'
import UserPage from './pages/UserPage'
import AnnouncementPage from './pages/AnnouncementPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/masuk" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/pramubakti" element={
          <ProtectedRoute roles={['admin', 'pimpinan', 'pelapor']}>
            <PramubaktiPage />
          </ProtectedRoute>
        } />
        
        <Route path="/kehadiran" element={
          <ProtectedRoute>
            <AttendancePage />
          </ProtectedRoute>
        } />
        
        <Route path="/tugas" element={
          <ProtectedRoute>
            <TaskPage />
          </ProtectedRoute>
        } />
        
        <Route path="/penilaian" element={
          <ProtectedRoute>
            <PerformancePage />
          </ProtectedRoute>
        } />
        
        <Route path="/laporan" element={
          <ProtectedRoute roles={['admin', 'pimpinan', 'pelapor']}>
            <ReportPage />
          </ProtectedRoute>
        } />
        
        <Route path="/pengguna" element={
          <ProtectedRoute roles={['admin']}>
            <UserPage />
          </ProtectedRoute>
        } />
        
        <Route path="/pengumuman" element={
          <ProtectedRoute>
            <AnnouncementPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profil" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/pengaturan" element={
          <ProtectedRoute roles={['admin']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
