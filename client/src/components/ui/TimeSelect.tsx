import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface TimeSelectProps {
  value: string // "HH:mm"
  onChange: (value: string) => void
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
// 5-minute intervals
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

export const TimeSelect = ({ value, onChange, className }: TimeSelectProps) => {
  const [currentHour, currentMinute] = (value || "10:00").split(':')

  const handleHourChange = (h: string) => {
    onChange(`${h}:${currentMinute}`)
  }

  const handleMinuteChange = (m: string) => {
    onChange(`${currentHour}:${m}`)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex-1 relative">
        <select
          value={currentHour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
        >
          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none uppercase">HR</span>
      </div>
      
      <span className="text-xl font-black text-slate-300">:</span>

      <div className="flex-1 relative">
        <select
          value={currentMinute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
        >
          {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 pointer-events-none uppercase">MIN</span>
      </div>
    </div>
  )
}
