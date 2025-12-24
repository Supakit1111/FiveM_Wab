import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <img
            src="/OMG.png"
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-bold text-slate-100">FiveM Manager</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64">
        <main className="min-h-screen w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
