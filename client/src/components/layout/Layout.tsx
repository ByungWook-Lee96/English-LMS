import { Outlet, Link, useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '../../stores/authStore'
import { 
  LogOut, Home, Users, Calendar, 
  ChevronRight, LayoutDashboard,
  ShieldCheck, UserCircle, GraduationCap,
  User as UserIcon
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Layout = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/schedule', label: 'Class Schedule', icon: Calendar },
  ]

  if (user?.role === 'MASTER') {
    menuItems.push({ path: '/teachers', label: 'Teachers', icon: ShieldCheck })
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic">English <span className="text-indigo-400">LMS</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Main Menu</p>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400")} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-indigo-200" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-700/50 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center border border-slate-600">
                <UserCircle size={24} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user?.username}</p>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {user?.teacherId && (
                <Link 
                  to={`/teachers/${user.teacherId}`}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20"
                >
                  <UserIcon size={14} />
                  <span>My Profile</span>
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-slate-600 hover:border-red-500/30"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
            {menuItems.find(m => location.pathname.startsWith(m.path))?.label || 'Overview'}
          </h1>
        </header>
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
