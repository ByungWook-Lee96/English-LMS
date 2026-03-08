import { X } from 'lucide-react'

interface ModalHeaderProps {
  title: string
  subtitle?: string
  onClose?: () => void
}

/**
 * Standard Modal Header component for consistent modal titles.
 */
const ModalHeader = ({ title, subtitle, onClose }: ModalHeaderProps) => {
  return (
    <div className="flex justify-between items-center border-b border-slate-100/50 pb-5 mb-6">
      <div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all active:scale-90"
        >
          <X size={24} />
        </button>
      )}
    </div>
  )
}

export default ModalHeader
