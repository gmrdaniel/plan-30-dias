import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { TEAM_CONFIG } from '../lib/types'
import { LayoutDashboard, List, User, LogOut, Target, FileText, GitBranch, ShoppingCart, AlertTriangle, BarChart3 } from 'lucide-react'

export default function Layout() {
  const { user, logout, currentTeam } = useAuth()
  if (!user) return null

  const cfg = TEAM_CONFIG[currentTeam]
  const base = `/${currentTeam}`

  const links = [
    { to: `${base}`, icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: `${base}/board`, icon: List, label: 'Board' },
    { to: `${base}/my`, icon: User, label: 'Mi Vista' },
    { to: `${base}/milestones`, icon: Target, label: 'Hitos' },
    ...(cfg.modules.procurement ? [{ to: `${base}/procurement`, icon: ShoppingCart, label: 'Contratacion' }] : []),
    ...(cfg.modules.blockers ? [{ to: `${base}/blockers`, icon: AlertTriangle, label: 'Bloqueantes' }] : []),
    ...(cfg.modules.pipeline ? [{ to: `${base}/pipeline`, icon: BarChart3, label: 'Pipeline B2B' }] : []),
    { to: '/docs', icon: FileText, label: 'Documentos' },
    ...(cfg.modules.procurement ? [{ to: '/docs/dtos-dependencias', icon: GitBranch, label: 'DTOs / Contratos' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-14 md:w-56 bg-white border-r shrink-0 flex flex-col transition-all duration-200">
        <div className="p-2 md:p-4 border-b flex items-center justify-center md:justify-start">
          <h1 className="hidden md:block font-bold text-sm text-gray-900">{cfg.shortName}</h1>
          <span className="md:hidden font-bold text-sm text-gray-900">{cfg.shortName.replace(/\s/g, '').slice(0, 2)}</span>
          <p className="hidden md:block text-xs text-gray-500 ml-0">Sprint Tracker</p>
        </div>
        <nav className="flex-1 p-1 md:p-2 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              title={l.label}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start gap-2 px-2 md:px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <l.icon size={18} className="shrink-0" />
              <span className="hidden md:inline">{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-2 md:p-3 border-t">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.short_name[0]}
            </div>
            <div className="hidden md:block min-w-0">
              <div className="text-sm font-medium truncate">{user.short_name}</div>
              <div className="text-xs text-gray-500 truncate">{user.role}</div>
            </div>
          </div>
          <button onClick={logout} title="Salir" className="flex items-center justify-center md:justify-start gap-1 text-xs text-gray-400 hover:text-gray-600 w-full">
            <LogOut size={14} /> <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
