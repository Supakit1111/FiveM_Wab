import type { ReactNode } from 'react'

export type DataTableColumn<T> = {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
}: {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey?: (row: T, index: number) => string | number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60">
      <div
        className="grid gap-3 bg-slate-900/40 px-4 py-3 text-xs text-slate-400"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((c) => (
          <div key={c.header} className={c.className}>{c.header}</div>
        ))}
      </div>

      {data.map((row, idx) => (
        <div
          key={rowKey ? rowKey(row, idx) : idx}
          className="grid gap-3 border-t border-slate-800 px-4 py-3 text-sm"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((c) => {
            const value =
              typeof c.accessor === 'function'
                ? c.accessor(row)
                : ((row as any)[c.accessor] as ReactNode)
            return (
              <div key={c.header} className={['text-slate-200', c.className ?? ''].join(' ')}>
                {value}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
