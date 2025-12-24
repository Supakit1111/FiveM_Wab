import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: ElementType;
  trend?: { value: number; positive: boolean };
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-950/60 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-slate-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-100">
            {value}
          </div>
          {subtitle ? (
            <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
          ) : null}
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-500/25">
          <Icon className={cn("h-5 w-5 text-teal-200", iconClassName)} />
        </span>
      </div>

      {trend ? (
        <div className="mt-3 text-xs">
          <span
            className={trend.positive ? "text-emerald-200" : "text-rose-200"}
          >
            {trend.positive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
          <span className="ml-1 text-slate-400">จากสัปดาห์ที่แล้ว</span>
        </div>
      ) : null}
    </div>
  );
}
