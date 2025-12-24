import type { ElementType } from 'react'

export function SectionHeader({
  number,
  icon: Icon,
  title,
  subtitle,
  className = '',
}: {
  number?: number
  icon: ElementType
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={['mb-3 flex items-start justify-between gap-4', className].join(' ')}>
      <div className="flex items-center gap-2">
        {typeof number === 'number' ? (
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-800/40 px-2 text-sm font-semibold text-teal-200 ring-1 ring-slate-700/30">
            {number}.
          </span>
        ) : null}
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/40 ring-1 ring-slate-700/30">
          <Icon className="h-5 w-5 text-teal-200" />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {subtitle ? <div className="text-xs text-slate-400">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  )
}
