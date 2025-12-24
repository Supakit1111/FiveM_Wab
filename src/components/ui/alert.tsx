import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertData {
  type: AlertType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 = no auto-close
}

interface AlertProps {
  alert: AlertData | null;
  onClose: () => void;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgGradient: "from-slate-900 via-slate-900 to-emerald-950/40",
    borderColor: "border-emerald-500/40",
    iconBg: "bg-emerald-500",
    iconRing: "ring-emerald-500/30",
    titleColor: "text-emerald-300",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700",
  },
  error: {
    icon: XCircle,
    bgGradient: "from-slate-900 via-slate-900 to-rose-950/40",
    borderColor: "border-rose-500/40",
    iconBg: "bg-rose-500",
    iconRing: "ring-rose-500/30",
    titleColor: "text-rose-300",
    buttonBg: "bg-rose-600 hover:bg-rose-700",
  },
  warning: {
    icon: AlertTriangle,
    bgGradient: "from-slate-900 via-slate-900 to-amber-950/40",
    borderColor: "border-amber-500/40",
    iconBg: "bg-amber-500",
    iconRing: "ring-amber-500/30",
    titleColor: "text-amber-300",
    buttonBg: "bg-amber-600 hover:bg-amber-700",
  },
  info: {
    icon: Info,
    bgGradient: "from-slate-900 via-slate-900 to-sky-950/40",
    borderColor: "border-sky-500/40",
    iconBg: "bg-sky-500",
    iconRing: "ring-sky-500/30",
    titleColor: "text-sky-300",
    buttonBg: "bg-sky-600 hover:bg-sky-700",
  },
};

export function Alert({ alert, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
      setIsLeaving(false);

      // Auto-close after duration (default 4 seconds)
      const duration = alert.duration ?? 4000;
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [alert]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 200);
  };

  if (!alert || !isVisible) return null;

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",
        isLeaving
          ? "animate-out fade-out duration-200"
          : "animate-in fade-in duration-200"
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border p-6 shadow-2xl text-center",
          `bg-gradient-to-b ${config.bgGradient}`,
          config.borderColor,
          isLeaving
            ? "animate-out zoom-out-95 duration-200"
            : "animate-in zoom-in-95 duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-4",
            `${config.iconBg}/20`,
            config.iconRing,
            "animate-in zoom-in duration-500"
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-white",
              config.iconBg
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Title */}
        <h3 className={cn("text-xl font-bold mb-2", config.titleColor)}>
          {alert.title}
        </h3>

        {/* Message */}
        {alert.message && (
          <p className="text-slate-300 mb-4">{alert.message}</p>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            "w-full rounded-lg py-3 text-sm font-medium text-white transition-colors",
            config.buttonBg
          )}
        >
          ปิด
        </button>
      </div>
    </div>
  );
}

// Custom hook for easy alert management
export function useAlert() {
  const [alert, setAlert] = useState<AlertData | null>(null);

  const showAlert = (data: AlertData) => {
    setAlert(data);
  };

  const showSuccess = (title: string, message?: string) => {
    setAlert({ type: "success", title, message });
  };

  const showError = (title: string, message?: string) => {
    setAlert({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    setAlert({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    setAlert({ type: "info", title, message });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return {
    alert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeAlert,
  };
}

// Toast-style notification (appears at top-right, less intrusive)
interface ToastData {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (type: AlertType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const config = alertConfig[toast.type];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 w-80 rounded-xl border p-4 shadow-lg animate-in slide-in-from-right duration-300",
              `bg-gradient-to-r ${config.bgGradient}`,
              config.borderColor
            )}
          >
            <div
              className={cn("flex-shrink-0 rounded-full p-1", config.iconBg)}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-sm", config.titleColor)}>
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
