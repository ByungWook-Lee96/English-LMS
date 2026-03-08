import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getSchedules, createSchedule, updateScheduleStatus, deleteSchedule } from '../../api/schedules'
import { getStudents } from '../../api/students'
import { getTeachers } from '../../api/teachers'
import { useAuthStore } from '../../stores/authStore'
import { 
  X, Trash2, Calendar as CalendarIcon, Clock, User, 
  CheckCircle2, Save, MessageSquare, Filter, Info, ChevronDown
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TimeSelect } from '../../components/ui/TimeSelect'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TEACHER_COLORS = [
  '#eff6ff', '#fef2f2', '#f0fdf4', '#fffbeb', '#faf5ff', 
  '#fff7ed', '#f5f3ff', '#ecfdf5', '#fdf2f8', '#f8fafc',
]

const TEACHER_BORDER_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', 
  '#f97316', '#6366f1', '#14b8a6', '#ec4899', '#64748b',
]

const STATUS_COLORS: Record<string, string> = {
  'PENDING': '#cbd5e1',
  'PRESENT': '#6366f1',
  'ABSENT': '#f59e0b',
  'NOSHOW': '#ef4444',
  'SUBSTITUTE': '#14b8a6',
}

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
)

const SchedulePage = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [studentId, setStudentId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [time, setTime] = useState('10:00')

  const [editDate, setEditDate] = useState<string>('')
  const [editTime, setEditTime] = useState<string>('')
  const [editStatus, setEditStatus] = useState<string>('')
  const [editNote, setEditNote] = useState<string>('')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCreateModalOpen(false)
      setSelectedEvent(null)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (selectedEvent) {
      const dt = new Date(selectedEvent.dateTime)
      setEditDate(dt.toISOString().split('T')[0])
      setEditTime(dt.toTimeString().split(' ')[0].substring(0, 5))
      setEditStatus(selectedEvent.status)
      setEditNote(selectedEvent.note || '')
    }
  }, [selectedEvent])

  const { data: schedules } = useQuery({
    queryKey: ['schedules', user?.teacherId, teacherId],
    queryFn: () => getSchedules({ teacherId: user?.role === 'TEACHER' ? user?.teacherId : (teacherId ? Number(teacherId) : undefined) })
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  })

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: user?.role === 'MASTER'
  })

  const teacherColorMap = useMemo(() => {
    const map: Record<number, number> = {}
    if (teachers) {
      teachers.forEach((t: any, idx: number) => {
        map[t.id] = idx
      })
    }
    return map
  }, [teachers])

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateScheduleStatus(id, data.status, data.note, data.dateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setSelectedEvent(null)
    }
  })

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setIsCreateModalOpen(false)
      setStudentId('')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setSelectedEvent(null)
    }
  })

  const events = useMemo(() => {
    if (!schedules) return []
    return schedules.map((s: any) => {
      const isMaster = user?.role === 'MASTER'
      const tIdx = isMaster ? (teacherColorMap[s.teacherId] ?? 0) : 0
      return {
        id: s.id.toString(),
        start: s.dateTime,
        extendedProps: { ...s, teacherIdx: tIdx },
      }
    })
  }, [schedules, user?.role, teacherColorMap])

  const renderEventContent = (eventInfo: any) => {
    const s = eventInfo.event.extendedProps
    const isMaster = user?.role === 'MASTER'
    const isPending = s.status === 'PENDING'
    const isSub = s.status === 'SUBSTITUTE'
    const statusColor = STATUS_COLORS[s.status] || '#cbd5e1'
    const teacherColor = TEACHER_COLORS[s.teacherIdx % TEACHER_COLORS.length]
    const teacherBorder = TEACHER_BORDER_COLORS[s.teacherIdx % TEACHER_BORDER_COLORS.length]
    const eventDate = new Date(s.dateTime)
    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

    return (
      <div 
        className="w-full h-full p-2 rounded flex flex-col gap-1 border-l-[6px] overflow-hidden shadow-sm"
        style={{ 
          backgroundColor: isMaster ? (isPending ? '#ffffff' : teacherColor) : 'white',
          borderLeftColor: statusColor,
          borderRight: `1px solid ${isMaster ? teacherBorder : '#f1f5f9'}30`,
          borderTop: `1px solid ${isMaster ? teacherBorder : '#f1f5f9'}30`,
          borderBottom: `1px solid ${isMaster ? teacherBorder : '#f1f5f9'}30`,
        }}
      >
        <span className="text-[11px] font-black text-slate-900 leading-none">
          {isSub && '(sub) '}{timeStr}
        </span>
        <div className="text-[11px] font-bold text-slate-600 truncate leading-tight mt-0.5">
          {isMaster && <span style={{ color: teacherBorder }}>[{s.teacher.name}] </span>}
          {s.student.nameEn}
        </div>
      </div>
    )
  }

  const handleSelect = (arg: any) => {
    const start = new Date(arg.startStr)
    const dateStr = start.toISOString().split('T')[0]
    const timeStr = start.toTimeString().split(' ')[0].substring(0, 5)
    setSelectedDate(dateStr)
    setTime(timeStr)
    setIsCreateModalOpen(true)
  }

  const handleEventClick = (arg: any) => {
    setSelectedEvent(arg.event.extendedProps)
  }

  const handleCreateSchedule = () => {
    if (!studentId || !selectedDate) return
    const finalTeacherId = user?.role === 'MASTER' ? Number(teacherId) : user?.teacherId
    if (!finalTeacherId) {
      alert('Please select a teacher.')
      return
    }
    createMutation.mutate({
      studentId: Number(studentId),
      dateTime: `${selectedDate}T${time}:00`,
      teacherId: finalTeacherId,
      status: 'PENDING'
    })
  }

  const handleUpdateSchedule = () => {
    if (!selectedEvent || editStatus === 'CHOOSE') return
    updateMutation.mutate({
      id: selectedEvent.id,
      data: {
        status: editStatus,
        note: editNote,
        dateTime: editStatus === 'SUBSTITUTE' ? `${editDate}T${editTime}:00` : selectedEvent.dateTime
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col space-y-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Class Schedule</h2>
          <p className="text-slate-500 font-medium">Manage team assignments and monitor student attendance.</p>
        </div>

        {/* Toolbar Container: 1 row, but items wrap if necessary */}
        <div className="flex flex-wrap xl:flex-row items-stretch justify-start gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          
          {/* Section 1: Instructor Filter */}
          {user?.role === 'MASTER' && (
            <div className="flex flex-col justify-center min-w-[240px] bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3 group hover:border-indigo-200 transition-all">
              <div className="flex items-center space-x-2 mb-1.5">
                <Filter size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Instructor Filter</span>
              </div>
              <div className="relative flex items-center">
                <select 
                  className="w-full bg-transparent border-none p-0 text-sm font-black text-slate-700 outline-none cursor-pointer appearance-none"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">All Instructors</option>
                  {teachers?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="ml-auto text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
          )}

          {/* Section 2: Instructor Map */}
          {user?.role === 'MASTER' && (
            <div className="flex-1 flex flex-col justify-center bg-slate-50 rounded-2xl border border-slate-100 px-5 py-3 min-w-[200px]">
              <div className="flex items-center space-x-2 mb-2">
                <Info size={12} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Instructor Map</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {teachers?.map((t: any, idx: number) => (
                  <div key={t.id} className="flex items-center space-x-2 shrink-0 bg-white/50 px-2 py-1 rounded-lg border border-white/50">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: TEACHER_BORDER_COLORS[idx % TEACHER_BORDER_COLORS.length] }}></div>
                    <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Legend Section - Wrappable */}
          <div className="flex flex-col justify-center bg-slate-50 rounded-2xl border border-slate-100 px-5 py-3 min-h-[5rem]">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 size={12} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Attendance Statuses</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">

              {[
                { label: 'Scheduled', color: '#cbd5e1' },
                { label: 'Present', color: '#6366f1' },
                { label: 'Absent', color: '#f59e0b' },
                { label: 'No-Show', color: '#ef4444' },
                { label: 'Substitute', color: '#14b8a6' },
              ].map(status => (
                <div key={status.label} className="flex items-center space-x-2 whitespace-nowrap">
                  <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: status.color }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          selectable={true}
          select={handleSelect}
          eventClick={handleEventClick}
          height="85vh"
          dayMaxEvents={3}
          themeSystem="standard"
          displayEventTime={false}
          fixedWeekCount={false}
          eventContent={renderEventContent}
        />
      </div>

      {/* Modals remain same */}
      {isCreateModalOpen && (
        <ModalOverlay onClose={() => setIsCreateModalOpen(false)}>
          <div className="p-8 space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Schedule Class</h3>
            <div className="space-y-4">
              {user?.role === 'MASTER' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Teacher *</label>
                  <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 font-bold" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                    <option value="">Select Teacher</option>
                    {teachers?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label>
                <input type="date" value={selectedDate} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</label>
                <TimeSelect value={time} onChange={setTime} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student *</label>
                <select className="w-full border border-slate-200 rounded-2xl px-4 py-3 font-bold" value={studentId} onChange={e => setStudentId(e.target.value)}>
                  <option value="">Select Student</option>
                  {students?.map((s: any) => <option key={s.id} value={s.id}>{s.nameEn} ({s.nameKo})</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleCreateSchedule} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">Confirm Schedule</button>
          </div>
        </ModalOverlay>
      )}

      {selectedEvent && (
        <ModalOverlay onClose={() => setSelectedEvent(null)}>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Management</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-900 text-lg">{selectedEvent.student.nameEn}</p>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Instructor: {selectedEvent.teacher.name}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Attendance Status</label>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-700 appearance-none bg-no-repeat bg-[right_1rem_center]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/xml' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`, backgroundSize: '1em' }}>
                    <option value="PENDING">Scheduled (Pending)</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="NOSHOW">No-Show</option>
                    <option value="SUBSTITUTE">Substitute</option>
                  </select>
                </div>
                {editStatus === 'SUBSTITUTE' && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2 font-bold" />
                    <TimeSelect value={editTime} onChange={setEditTime} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Class Memo</label>
                  <textarea value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Session details..." className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm min-h-[100px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(selectedEvent.id) }} className="flex-1 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors border border-slate-50">Delete</button>
              <button onClick={handleUpdateSchedule} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98]">Save Changes</button>
            </div>
          </div>
        </ModalOverlay>
      )}

      <style>{`
        .fc { font-family: inherit; }
        .fc-daygrid-event { border: none !important; margin: 2px 4px !important; padding: 0 !important; background: transparent !important; }
        .fc-event-main { padding: 0 !important; overflow: hidden !important; border-radius: 8px !important; }
        .fc-daygrid-day-number { font-weight: 800 !important; color: #94a3b8 !important; padding: 12px !important; }
        .fc-day-today { background: #f8fafc !important; }
        .fc-day-today .fc-daygrid-day-number { color: #6366f1 !important; }
        .fc-col-header-cell { background: #f8fafc; padding: 12px 0 !important; }
        .fc-col-header-cell-cushion { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 900 !important; color: #0f172a !important; }
        .fc-button { background: white !important; border: 1px solid #e2e8f0 !important; color: #64748b !important; font-weight: 700 !important; text-transform: capitalize !important; border-radius: 12px !important; padding: 0.5rem 1rem !important; }
        .fc-button-active { background: #6366f1 !important; border-color: #6366f1 !important; color: white !important; }
      `}</style>
    </div>
  )
}

export default SchedulePage
