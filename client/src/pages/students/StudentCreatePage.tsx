import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createStudent } from '../../api/students'
import { getTeachers } from '../../api/teachers'
import { useAuthStore } from '../../stores/authStore'
import { Save, Calendar, Clock, User } from 'lucide-react'
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

const studentSchema = z.object({
  nameKo: z.string().min(1, 'Korean Name is required'),
  nameEn: z.string().min(1, 'English Name is required'),
  phone: z.string().min(1, 'Phone/Kakao is required'),
  age: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
  studyGoal: z.string().optional(),
  textbook: z.string().optional(),
  extraInfo: z.string().optional(),
  totalSessions: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number()),
  classTime: z.string().optional(),
  teacherId: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().optional()),
})

const StudentCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const [selectedDays, setSelectedDateDays] = useState<string[]>([])

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: getTeachers,
    enabled: user?.role === 'MASTER'
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nameKo: '',
      nameEn: '',
      phone: '',
      totalSessions: 10,
      age: undefined,
      studyGoal: '',
      textbook: '',
      extraInfo: '',
      classTime: '10:00',
      teacherId: undefined
    },
  })

  const mutation = useMutation({
    mutationFn: (data: any) => createStudent({
      ...data,
      classDays: selectedDays.join(',')
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      navigate('/students')
    },
  })

  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDateDays(selectedDays.filter(d => d !== day))
    } else {
      setSelectedDateDays([...selectedDays, day])
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Add New Student" 
        subtitle="Register a new student and set up their recurring class schedule."
        backButton={{ onClick: () => navigate('/students') }}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <User size={20} className="mr-2 text-indigo-500" /> Basic Information
            </h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Korean Name *</label>
            <input {...register('nameKo')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="홍길동" />
            {errors.nameKo && <p className="text-xs text-red-500 font-medium">{errors.nameKo.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">English Name *</label>
            <input {...register('nameEn')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="David" />
            {errors.nameEn && <p className="text-xs text-red-500 font-medium">{errors.nameEn.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Phone / Kakao ID *</label>
            <input {...register('phone')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="010-1234-5678" />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Age</label>
            <input type="number" {...register('age')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Total Sessions (Initial)</label>
            <input type="number" {...register('totalSessions')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Textbook</label>
            <input {...register('textbook')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="e.g. Speak Out" />
          </div>

          {user?.role === 'MASTER' && (
            <div className="md:col-span-2 space-y-1.5 pt-2">
              <label className="text-sm font-bold text-slate-700">Assign Teacher</label>
              <select {...register('teacherId')} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none bg-slate-50 cursor-pointer">
                <option value="">Select Teacher</option>
                {teachers?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4 mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <Calendar size={20} className="mr-2 text-indigo-500" /> Recurring Class Schedule
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium italic">Schedules for the next 4 weeks will be automatically created.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Class Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                      selectedDays.includes(day.value) 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                        : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Class Time</label>
              <TimeSelect 
                value={watch('classTime')} 
                onChange={(val) => setValue('classTime', val)} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Study Goal</label>
            <textarea {...register('studyGoal')} rows={3} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="What is the primary goal?" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Extra Information</label>
            <textarea {...register('extraInfo')} rows={3} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Any other details?" />
          </div>
        </div>

        <div className="flex justify-end pb-10">
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            <Save size={24} />
            <span>{isSubmitting ? 'Creating...' : 'Create Student & Auto-Schedule'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default StudentCreatePage
