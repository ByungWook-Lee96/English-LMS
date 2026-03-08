import { useParams, Link, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStudentById, updateStudent, addSessions } from '../../api/students'
import { getTeachers } from '../../api/teachers'
import { useAuthStore } from '../../stores/authStore'
import { 
  ArrowLeft, Plus, Minus, MessageSquare, BookOpen, Target, 
  Info, Edit2, Save, X, Calendar, Clock, User, Phone, 
  UserCircle, ClipboardList, CheckCircle2, History
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TimeSelect } from '../../components/ui/TimeSelect'
import PageHeader from '../../components/common/PageHeader'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DAYS = [
  { label: 'Mon', value: 'MON' },
  { label: 'Tue', value: 'TUE' },
  { label: 'Wed', value: 'WED' },
  { label: 'Thu', value: 'THU' },
  { label: 'Fri', value: 'FRI' },
  { label: 'Sat', value: 'SAT' },
  { label: 'Sun', value: 'SUN' },
]

const StudentDetailPage = () => {
  const { id } = useParams()
  const studentId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudentById(studentId)
  })

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: user?.role === 'MASTER'
  })

  useEffect(() => {
    if (student) {
      setEditData({
        ...student,
        classDays: student.classDays ? student.classDays.split(',') : []
      })
    }
  }, [student])

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateStudent(studentId, {
      ...data,
      classDays: data.classDays.join(',')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setIsEditing(false)
    }
  })

  const handleCancel = () => {
    if (student) {
      setEditData({
        ...student,
        classDays: student.classDays ? student.classDays.split(',') : []
      })
    }
    setIsEditing(false)
  }

  if (isLoading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading student profile...</div>
  if (!student) return <div className="text-center py-20 text-red-500 font-black italic">ERROR: Student not found.</div>

  const toggleDay = (day: string) => {
    const current = editData.classDays || []
    if (current.includes(day)) {
      setEditData({ ...editData, classDays: current.filter((d: string) => d !== day) })
    } else {
      setEditData({ ...editData, classDays: [...current, day] })
    }
  }

  const handleSessionChange = (increment: number) => {
    const current = Number(editData.totalSessions) || 0
    setEditData({ ...editData, totalSessions: Math.max(0, current + increment) })
  }

  const sessionMemos = [...(student.schedules || [])]
    .filter((s: any) => s.note)
    .sort((a: any, b: any) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const rightElement = (
    <div className="flex items-center space-x-3">
      {isEditing ? (
        <>
          <button 
            onClick={handleCancel}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl font-bold transition-all bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          <button 
            onClick={() => updateMutation.mutate(editData)}
            disabled={updateMutation.isPending}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl font-bold transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 disabled:bg-slate-300"
          >
            <Save size={18} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </>
      ) : (
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-2xl font-bold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Edit2 size={18} />
          <span>Edit Profile</span>
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader 
        title="Student Profile" 
        subtitle={`${student.nameKo} • ID: ${student.id}`}
        backButton={{ onClick: () => navigate('/students') }}
        rightElement={rightElement}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-center text-white relative">
              <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md p-5 rounded-3xl mb-4 shadow-inner">
                <UserCircle size={64} className="text-white" />
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={editData.nameKo} 
                    onChange={e => setEditData({...editData, nameKo: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-center text-xl font-bold placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                    placeholder="Korean Name"
                  />
                  <input 
                    type="text" 
                    value={editData.nameEn} 
                    onChange={e => setEditData({...editData, nameEn: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-center text-sm font-medium placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                    placeholder="English Name"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-black">{student.nameKo}</h3>
                  <p className="text-indigo-100 font-medium tracking-wide uppercase text-sm mt-1">{student.nameEn}</p>
                </>
              )}
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Phone size={14} className="mr-2" /> Phone / Kakao
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.phone} 
                      onChange={e => setEditData({...editData, phone: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-slate-700 font-semibold">{student.phone}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Age</label>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editData.age || ''} 
                        onChange={e => setEditData({...editData, age: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none"
                      />
                    ) : (
                      <p className="text-slate-700 font-semibold">{student.age || 'N/A'}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Textbook</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editData.textbook || ''} 
                        onChange={e => setEditData({...editData, textbook: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none"
                      />
                    ) : (
                      <p className="text-slate-700 font-semibold truncate" title={student.textbook}>{student.textbook || 'None'}</p>
                    )}
                  </div>
                </div>

                {user?.role === 'MASTER' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <User size={14} className="mr-2" /> Assigned Teacher
                    </label>
                    {isEditing ? (
                      <select 
                        value={editData.teacherId || ''} 
                        onChange={e => setEditData({...editData, teacherId: e.target.value})}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2 text-slate-700 outline-none"
                      >
                        <option value="">No Teacher Assigned</option>
                        {teachers?.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-indigo-600 font-bold">{student.teacher?.name || 'Unassigned'}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          {/* Unified Schedule & Session Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
              <h4 className="text-xl font-bold text-slate-900 flex items-center">
                <Calendar className="mr-3 text-indigo-500" size={24} /> Recurring Schedule & Sessions
              </h4>
              
              <div className="flex items-center space-x-4 bg-slate-900 p-4 px-6 rounded-2xl text-white shadow-xl shadow-slate-200 transition-all">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remaining</p>
                  <p className="text-2xl font-black">{isEditing ? editData.totalSessions : student.totalSessions} <span className="text-xs text-slate-400 uppercase ml-1 tracking-tighter">Classes</span></p>
                </div>
                {isEditing && (
                  <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                    <button onClick={() => handleSessionChange(-1)} className="p-1.5 hover:bg-white/10 rounded-lg text-red-400 transition-colors"><Minus size={16} /></button>
                    <button onClick={() => handleSessionChange(1)} className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"><Plus size={16} /></button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Class Days</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => {
                    const isActive = isEditing 
                      ? editData.classDays?.includes(day.value) 
                      : student.classDays?.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        disabled={!isEditing}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
                          isActive 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                        )}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Class Time</p>
                {isEditing ? (
                  <TimeSelect 
                    value={editData.classTime || '10:00'} 
                    onChange={val => setEditData({...editData, classTime: val})}
                  />
                ) : (
                  <div className="flex items-center space-x-3 text-slate-900">
                    <Clock className="text-slate-400" size={24} />
                    <span className="text-3xl font-black">{student.classTime || '--:--'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900 flex items-center">
                <Target className="mr-3 text-indigo-500" size={24} /> Study Goal
              </h4>
              {isEditing ? (
                <textarea 
                  rows={3}
                  value={editData.studyGoal || ''}
                  onChange={e => setEditData({...editData, studyGoal: e.target.value})}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                  {student.studyGoal || 'The study goal is not yet defined.'}
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900 flex items-center">
                <Info className="mr-3 text-indigo-500" size={24} /> Extra Information
              </h4>
              {isEditing ? (
                <textarea 
                  rows={3}
                  value={editData.extraInfo || ''}
                  onChange={e => setEditData({...editData, extraInfo: e.target.value})}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              ) : (
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                  {student.extraInfo || 'No additional information provided.'}
                </p>
              )}
            </div>
          </div>

          {/* Read-only Learning Log Section with Scroll */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center">
                <History className="mr-3 text-indigo-500" size={24} />
                <h4 className="text-xl font-bold text-slate-900">Learning Log</h4>
              </div>
              <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</span>
            </div>

            <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {sessionMemos.length > 0 ? (
                  sessionMemos.map((session: any) => (
                    <div key={session.id} className="group relative pl-8 border-l-2 border-slate-100 pb-2 last:border-l-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 shadow-sm transition-transform group-hover:scale-125"></div>
                      
                      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-black text-slate-900 tracking-tight">
                              {new Date(session.dateTime).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                              session.status === 'PRESENT' ? "text-indigo-600 bg-indigo-50" : "text-amber-600 bg-amber-50"
                            )}>
                              {session.status}
                            </span>
                          </div>
                          <div className="flex items-center text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                            <Clock size={10} className="mr-1" />
                            {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-wrap">{session.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <MessageSquare size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400 font-medium italic">No lesson notes recorded for this student.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  )
}

export default StudentDetailPage
