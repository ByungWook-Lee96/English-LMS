import { useAuthStore } from '../stores/authStore'
import { LayoutDashboard, Users, Calendar, CheckCircle2, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getStudents } from '../api/students'
import { getSchedules } from '../api/schedules'
import PageHeader from '../components/common/PageHeader'
import { Link } from 'react-router'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  // Fetch student count
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  })

  // Fetch all relevant schedules to calculate stats
  const { data: schedules } = useQuery({
    queryKey: ['dashboard-schedules'],
    queryFn: () => getSchedules({ 
      teacherId: user?.role === 'TEACHER' ? user?.teacherId : undefined 
    })
  })

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0]
  const todayClasses = schedules?.filter((s: any) => s.dateTime.startsWith(today)) || []
  
  const pastSchedules = schedules?.filter((s: any) => s.status !== 'PENDING') || []
  const presentSchedules = pastSchedules.filter((s: any) => s.status === 'PRESENT')
  const attendanceRate = pastSchedules.length > 0 
    ? Math.round((presentSchedules.length / pastSchedules.length) * 100) 
    : 0

  const stats = [
    { 
      label: 'Total Students', 
      value: students?.length || 0, 
      icon: Users, 
      color: 'bg-indigo-50', 
      textColor: 'text-indigo-600',
      link: '/students'
    },
    { 
      label: "Today's Classes", 
      value: todayClasses.length, 
      icon: Calendar, 
      color: 'bg-emerald-50', 
      textColor: 'text-emerald-600',
      link: '/schedule'
    },
    { 
      label: 'Attendance Rate', 
      value: `${attendanceRate}%`, 
      icon: CheckCircle2, 
      color: 'bg-amber-50', 
      textColor: 'text-amber-600',
      link: '/schedule'
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title={`Welcome, ${user?.username}!`}
        subtitle={`Role: ${user?.role} • You have ${todayClasses.length} sessions scheduled for today.`}
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link 
            key={stat.label}
            to={stat.link}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/40 transition-all active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.color} p-4 rounded-3xl`}>
                <stat.icon className={stat.textColor} size={28} />
              </div>
              <div className="p-2 bg-slate-50 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ArrowRight size={18} />
              </div>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{stat.value}</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access/Activity Feed could go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4">Start your day</h3>
            <p className="text-slate-400 font-medium mb-8 max-w-xs leading-relaxed">Check your schedule and students to prepare for today's English sessions.</p>
            <Link 
              to="/schedule" 
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-900/40"
            >
              <span>Go to Schedule</span>
              <ArrowRight size={20} />
            </Link>
          </div>
          <Calendar size={200} className="absolute -right-10 -bottom-10 text-white/5 group-hover:text-white/10 transition-all rotate-12 group-hover:rotate-0" />
        </div>

        <div className="bg-indigo-50 rounded-[3rem] p-10 overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-indigo-900 mb-4">Student Management</h3>
            <p className="text-indigo-700/60 font-medium mb-8 max-w-xs leading-relaxed">Review student profiles, session memos, and learning progress in real-time.</p>
            <Link 
              to="/students" 
              className="inline-flex items-center space-x-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-100"
            >
              <span>Manage Students</span>
              <ArrowRight size={20} />
            </Link>
          </div>
          <Users size={200} className="absolute -right-10 -bottom-10 text-indigo-200/50 group-hover:text-indigo-200 transition-all -rotate-12 group-hover:rotate-0" />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
