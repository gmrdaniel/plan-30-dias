import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { LayoutDashboard, List, User, LogOut, Target, FileText } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  if (!user) return null

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/board', icon: List, label: 'Board' },
    { to: '/my', icon: User, label: 'Mi Vista' },
    { to: '/milestones', icon: Target, label: 'Hitos' },
    { to: '/docs', icon: FileText, label: 'Documentos' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold text-sm text-gray-900">Equipo 3</h1>
          <p className="text-xs text-gray-500">Sprint Tracker</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.short_name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.short_name}</div>
              <div className="text-xs text-gray-500 truncate">{user.role}</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
