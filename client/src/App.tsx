import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import StudentListPage from './pages/students/StudentListPage'
import StudentCreatePage from './pages/students/StudentCreatePage'
import StudentDetailPage from './pages/students/StudentDetailPage'
import SchedulePage from './pages/schedule/SchedulePage'
import TeacherListPage from './pages/teachers/TeacherListPage'
import TeacherDetailPage from './pages/teachers/TeacherDetailPage'

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />
  
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentListPage />} />
          <Route path="students/create" element={<StudentCreatePage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          
          {/* List is Master Only */}
          <Route path="teachers" element={
            <ProtectedRoute role="MASTER">
              <TeacherListPage />
            </ProtectedRoute>
          } />
          
          {/* Detail is for both MASTER and TEACHER (self) */}
          <Route path="teachers/:id" element={<TeacherDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
