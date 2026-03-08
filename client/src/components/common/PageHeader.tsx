import type { ReactNode } from 'react'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  rightElement?: ReactNode
  backButton?: {
    onClick: () => void
  }
}

/**
 * Standard Page Header component to maintain UI consistency across the app.
 * Used for main page titles (H2 level).
 */
const PageHeader = ({ title, subtitle, icon: Icon, rightElement, backButton }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center space-x-4">
        {backButton && (
          <button 
            onClick={backButton.onClick}
            className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 shadow-sm transition-all text-slate-400 hover:text-slate-900 active:scale-95"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div>
          <div className="flex items-center">
            {Icon && (
              <div className="mr-4 p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100/50 shadow-sm shadow-indigo-100/20">
                <Icon className="text-indigo-600" size={24} />
              </div>
            )}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-slate-500 mt-2 font-medium text-sm md:text-base pl-[calc(0px)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightElement && (
        <div className="flex items-center gap-3">
          {rightElement}
        </div>
      )}
    </div>
  )
}

export default PageHeader
