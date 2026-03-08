import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTeacherById } from '../../api/teachers'
import { updateScheduleStatus } from '../../api/schedules'
import { 
  User, Users, Calendar, 
  ChevronRight, ShieldCheck, UserCircle,
  BarChart3, MessageSquare, X, Save
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import PageHeader from '../../components/common/PageHeader'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <div 
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <div 
      className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)

const TeacherDetailPage = () => {
  const { id } = useParams()
  const teacherId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [noteContent, setNoteContent] = useState('')

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teachers', teacherId],
    queryFn: () => getTeacherById(teacherId)
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number, note: string }) => updateScheduleStatus(id, selectedSchedule.status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers', teacherId] })
      setSelectedSchedule(null)
    }
  })

  const handleRowClick = (schedule: any) => {
    setSelectedSchedule(schedule)
    setNoteContent(schedule.note || '')
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedSchedule(null)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading instructor profile...</div>
  if (!teacher) return <div className="text-center py-20 text-red-500 font-black italic">ERROR: Instructor not found.</div>

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader 
        title="Instructor Profile" 
        subtitle={`Active Member • Joined ${new Date(teacher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        backButton={{ onClick: () => navigate('/teachers') }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center text-white relative">
              <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md p-5 rounded-3xl mb-4 border border-white/10 shadow-inner">
                <UserCircle size={64} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black">{teacher.name}</h3>
              <p className="text-indigo-400 font-bold tracking-widest uppercase text-[10px] mt-1">@{teacher.user?.username}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Users size={18} className="text-indigo-500" />
                    <span className="text-sm font-bold uppercase tracking-tighter">Students</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{teacher.students?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Calendar size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold uppercase tracking-tighter">Sessions</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{teacher.schedules?.length || 0}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Permissions</p>
                <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">{teacher.user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Assigned Students */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 px-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <Users size={20} className="mr-3 text-indigo-500" />
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Students</h4>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {teacher.students?.map((student: any) => (
                <Link 
                  key={student.id} 
                  to={`/students/${student.id}`}
                  className="p-6 px-8 flex justify-between items-center hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{student.nameEn} ({student.nameKo})</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{student.phone}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Schedules with Scroll */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 px-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center">
                <BarChart3 size={20} className="mr-3 text-emerald-500" />
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Recent Schedule</h4>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Timeline</p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                    <tr>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                      <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Memo</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teacher.schedules?.map((schedule: any) => (
                      <tr 
                        key={schedule.id} 
                        onClick={() => handleRowClick(schedule)}
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-8 py-5 font-bold text-slate-700">{schedule.student?.nameEn || 'N/A'}</td>
                        <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                          {new Date(schedule.dateTime).toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false
                          })}
                        </td>
                        <td className="px-8 py-5 text-center">
                          {schedule.note ? (
                            <MessageSquare size={16} className="mx-auto text-indigo-400" />
                          ) : (
                            <span className="text-slate-200">-</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            getStatusBadgeClass(schedule.status)
                          )}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Memo Edit Modal */}
      {selectedSchedule && (
        <ModalOverlay onClose={() => setSelectedSchedule(null)}>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Session Memo</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {selectedSchedule.student?.nameEn} • {new Date(selectedSchedule.dateTime).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setSelectedSchedule(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center px-1">
                <MessageSquare size={14} className="mr-2 text-indigo-500" /> Update Note
              </label>
              <textarea 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Details about this class session..."
                className="w-full border border-slate-200 rounded-3xl px-5 py-4 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[150px] shadow-sm"
              />
            </div>

            <button 
              onClick={() => updateNoteMutation.mutate({ id: selectedSchedule.id, note: noteContent })}
              disabled={updateNoteMutation.isPending}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{updateNoteMutation.isPending ? 'Saving...' : 'Save Memo'}</span>
            </button>
          </div>
        </ModalOverlay>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  )
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PRESENT': return 'bg-emerald-100 text-emerald-700'
    case 'ABSENT': return 'bg-amber-100 text-amber-700'
    case 'NOSHOW': return 'bg-red-100 text-red-700'
    case 'SUBSTITUTE': return 'bg-blue-100 text-blue-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}

export default TeacherDetailPage
