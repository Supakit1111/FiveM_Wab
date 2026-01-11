import { CheckCircle2, XCircle, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "O" | "L" | "A" | "-" | null;

interface AttendanceBadgeProps {
  status: StatusType;
  time?: string | null;
  className?: string;
  showTime?: boolean;
}

export function AttendanceBadge({
  status,
  time,
  className,
  showTime = true,
}: AttendanceBadgeProps) {
  // Format time (assuming ISO string or HH:mm)
  const formatTime = (t: string) => {
    if (!t) return "";
    const d = new Date(t);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return t; // fallback if already formatted or invalid
  };

  const getStatusConfig = (s: StatusType) => {
    switch (s) {
      case "O": // Present
        return {
          icon: CheckCircle2,
          text: "มา",
          style: "bg-green-500/20 text-green-400 border-green-500/50",
          iconColor: "text-green-400",
        };
      case "L": // Leave
        return {
          icon: Clock,
          text: "ลา",
          style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
          iconColor: "text-yellow-400",
        };
      case "A": // Absent (Added specifically for 'A')
      case "-": // Absent/Missing (Legacy)
        return {
          icon: XCircle,
          text: "ขาด",
          style: "bg-red-500/20 text-red-400 border-red-500/50",
          iconColor: "text-red-400",
        };
      default:
        return {
          icon: Circle,
          text: "-",
          style: "bg-slate-800/50 text-slate-500 border-slate-700",
          iconColor: "text-slate-600",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit",
        config.style,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
      <span>{config.text}</span>
      {showTime && time && (
        <span className="opacity-75 font-mono ml-0.5">{formatTime(time)}</span>
      )}
    </div>
  );
}
