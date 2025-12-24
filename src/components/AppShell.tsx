import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { OnlineUsers } from "./OnlineUsers";

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-800"
          >
            <Menu className="h-6 w-6 text-slate-300" />
          </button>
          <span className="font-bold text-teal-400">FiveM Manager</span>
        </div>

        <OnlineUsers />
      </div>

      {/* Desktop Online Users (Absolute Top Right) - Adjusted to left of Clock */}
      <div className="fixed top-6 right-80 z-50 hidden lg:block">
        <OnlineUsers />
      </div>

      <main className="flex-1 transition-all duration-300 lg:pl-64 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
