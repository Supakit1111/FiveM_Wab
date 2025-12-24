import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'

export default function AppShell() {
  return (
    <div className="min-h-screen w-full bg-slate-950">
      <AppSidebar />
      <div className="pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}