import type { PropsWithChildren } from 'react'

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export function Badge({
  variant = 'default',
  className = '',
  children,
}: PropsWithChildren<{ variant?: BadgeVariant; className?: string }>) {
  const base =
    'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium'

  const byVariant: Record<BadgeVariant, string> = {
    default: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
    secondary: 'border-slate-600/30 bg-slate-700/20 text-slate-200',
    destructive: 'border-rose-500/30 bg-rose-500/15 text-rose-200',
    outline: 'border-slate-700/40 bg-transparent text-slate-200',
  }

  return <span className={[base, byVariant[variant], className].join(' ')}>{children}</span>
}
