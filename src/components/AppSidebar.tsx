import {
  KeyRound,
  Shield,
  User,
  Megaphone,
  Package,
  FileText,
  LayoutDashboard,
  Gamepad2,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getUser, logout } from "@/lib/auth";
import { motion } from "framer-motion"; // เพิ่ม import นี้

const menuItems = [
  {
    isDivider: true,
    title: "ทั่วไป",
    subtitle: "General",
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "ยืนยันตัวตนและบัญชี",
    subtitle: "Authentication & Account",
    icon: KeyRound,
    path: "/account",
  },
  // Admin Section
  {
    title: "เช็คชื่อ & เบิก/ฝากของ",
    subtitle: "Check-in & Withdraw",
    icon: User,
    path: "/self",
  },
  {
    title: "ประวัติการเช็คชื่อ",
    subtitle: "Attendance History",
    icon: Megaphone,
    path: "/attendance-history",
  },
  {
    title: "บันทึกและรายงาน",
    subtitle: "Logging & Reporting",
    icon: FileText,
    path: "/logs",
  },

  {
    isDivider: true,
    title: "การจัดการระบบ",
    subtitle: "System Management",
  },
  {
    title: "ระบบผู้ดูแล",
    subtitle: "Admin Panel",
    icon: Shield,
    path: "/admin",
    isAdmin: true,
  },
  {
    title: "จัดการคลัง",
    subtitle: "Inventory Management",
    icon: Package,
    path: "/inventory-management",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      {/* Logo Section with Entry Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 px-6 py-5 border-b border-slate-800"
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10"
        >
          <Gamepad2 className="h-6 w-6 text-teal-200" />
        </motion.div>
        <div>
          <p className="font-bold text-slate-100">GameAdmin</p>
          <p className="text-xs text-slate-400">ระบบจัดการข้อมูลเกม</p>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.isDivider) {
            return (
              <motion.div
                key={`divider-${item.title}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-2 mt-2"
              >
                <p className="text-xs font-medium text-teal-200/80 uppercase tracking-wider">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-500">{item.subtitle}</p>
              </motion.div>
            );
          }

          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <NavLink
              key={item.path}
              to={item.path || ""}
              className="relative block mb-1"
            >
              {/* Animation Wrapper */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }} // Stagger effect
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors duration-200",
                  isActive
                    ? "text-teal-200"
                    : "text-slate-300 hover:text-slate-100"
                )}
              >
                {/* Magic Background: 
                   ส่วนนี้สำคัญที่สุด ใช้ layoutId="activeNav" 
                   Framer Motion จะรู้เองว่าต้องเลื่อนกล่องนี้ไปที่ไหน
                */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-teal-500/15 border-l-2 border-teal-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover Effect Background (Optional for non-active items) */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg hover:bg-slate-800/40 transition-colors" />
                )}

                {/* Icon & Text (z-index 10 to stay above background) */}
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.2 }} // เด้งดึ๋งตอนชี้
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.icon && (
                    <item.icon
                      className={cn("h-5 w-5", isActive && "text-teal-200")}
                    />
                  )}
                </motion.div>

                <div className="relative z-10 flex flex-col">
                  <span
                    className={cn(
                      "font-medium",
                      item.isAdmin ? "text-red-400" : "",
                      isActive && "text-teal-200"
                    )}
                  >
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[10px] text-slate-400/70">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4 bg-slate-950">
        {user ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2 cursor-pointer border border-transparent hover:border-slate-700 transition-all"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <span className="text-teal-200 font-semibold text-sm">
                {user.inGameName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-100">
                {user.inGameName}
              </p>
              <p className="text-xs text-slate-400">คลิกเพื่อออกจากระบบ</p>
            </div>
          </motion.div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2 hover:bg-slate-800/70 transition-colors"
          >
            {/* Login UI code same as before */}
            <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <User className="h-4 w-4 text-teal-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100">Login</p>
            </div>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
