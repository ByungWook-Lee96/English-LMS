import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getTeachers } from '../../api/teachers'
import api from '../../lib/axios'
import { 
  User, Users, Calendar, Plus, X, Shield, ShieldCheck,
  Lock, UserPlus, ArrowRight, UserCircle 
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import PageHeader from '../../components/common/PageHeader'
import ModalHeader from '../../components/common/ModalHeader'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fixed: Moving ModalOverlay outside to prevent focus loss during state changes
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

const TeacherListPage = () => {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  })

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers
  })

  const createTeacherMutation = useMutation({
    mutationFn: (data: typeof formData) => api.post('/teachers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setIsAddModalOpen(false)
      setFormData({ username: '', password: '', name: '' })
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || error.message}`)
    }
  })

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsAddModalOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username || !formData.password || !formData.name) return
    createTeacherMutation.mutate(formData)
  }

  const addTeacherButton = (
    <button 
      onClick={() => setIsAddModalOpen(true)}
      className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
    >
      <UserPlus size={20} />
      <span>Add New Teacher</span>
    </button>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Teachers" 
        subtitle="Manage instructor accounts and their assigned loads." 
        icon={ShieldCheck}
        rightElement={addTeacherButton}
      />

      {isLoading ? (
        <div className="text-center py-20 animate-pulse text-slate-400">Loading teacher network...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teachers?.map((teacher: any) => (
            <Link 
              key={teacher.id} 
              to={`/teachers/${teacher.id}`}
              className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 block group"
            >
              <div className="flex items-center space-x-5">
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <UserCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{teacher.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {teacher.user.username}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Assigned Students</p>
                  <div className="flex items-center text-slate-700 font-bold">
                    <Users size={16} className="mr-2 text-indigo-500" />
                    <span>{teacher._count.students}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Active Classes</p>
                  <div className="flex items-center text-slate-700 font-bold">
                    <Calendar size={16} className="mr-2 text-emerald-500" />
                    <span>{teacher._count.schedules}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          ))}
          {teachers?.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <UserCircle size={64} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">No teachers have been onboarded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <ModalOverlay onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={onSubmit} className="p-8">
            <ModalHeader 
              title="New Instructor" 
              subtitle="Credentials Setup" 
              onClose={() => setIsAddModalOpen(false)} 
            />
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <User size={16} className="mr-2 text-indigo-500" /> Full Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Shield size={16} className="mr-2 text-indigo-500" /> Username (ID)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. sarah_teach"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Lock size={16} className="mr-2 text-indigo-500" /> Password
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="Create a strong password"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={createTeacherMutation.isPending}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] disabled:bg-slate-300 mt-2"
            >
              {createTeacherMutation.isPending ? 'Onboarding...' : 'Register Teacher'}
            </button>
          </form>
        </ModalOverlay>
      )}
    </div>
  )
}

export default TeacherListPage
