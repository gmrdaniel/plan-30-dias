import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { TEAM_CONFIG, type TeamId } from './lib/types'
import Login from './components/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import MyView from './pages/MyView'
import TaskDetail from './pages/TaskDetail'
import Milestones from './pages/Milestones'
import Procurement from './pages/Procurement'
import Blockers from './pages/Blockers'
import Pipeline from './pages/Pipeline'
import DocsIndex from './pages/DocsIndex'
import DocView from './pages/DocView'
import ConfiguradorPage from './prototipos/configurador-flujo/ConfiguradorPage'
import MarketingAnalysisPage from './prototipos/marketing-analysis/MarketingAnalysisPage'
import PlanFastTrackPage from './prototipos/plan-fast-track/PlanFastTrackPage'
import MetaReportePage from './prototipos/meta-reporte/MetaReportePage'
import FormulariosReportePage from './prototipos/formularios-reporte/FormulariosReportePage'
import CapacidadEnviosPage from './prototipos/capacidad-envios/CapacidadEnviosPage'
import SmartleadHubPage from './prototipos/smartlead-hub/SmartleadHubPage'

const PlantillasPage = lazy(() => import('./prototipos/plantillas/PlantillasPage'))

function ValidateTeam({ children }: { children: ReactNode }) {
  const { team } = useParams<{ team: string }>()
  if (!team || !(team in TEAM_CONFIG)) return <Navigate to="/team3" replace />
  return <>{children}</>
}

function ModuleGuard({ module: mod, children }: { module: 'procurement' | 'blockers' | 'pipeline'; children: ReactNode }) {
  const { currentTeam } = useAuth()
  if (!TEAM_CONFIG[currentTeam].modules[mod]) return <Navigate to={`/${currentTeam}`} replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading, currentTeam } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>
  if (!user) return <Login />

  const modules = TEAM_CONFIG[currentTeam].modules

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="board" element={<Board />} />
        <Route path="my" element={<MyView />} />
        <Route path="milestones" element={<Milestones />} />
        <Route path="task/:taskId" element={<TaskDetail />} />
        {modules.procurement && <Route path="procurement" element={<ModuleGuard module="procurement"><Procurement /></ModuleGuard>} />}
        {modules.blockers && <Route path="blockers" element={<ModuleGuard module="blockers"><Blockers /></ModuleGuard>} />}
        {modules.pipeline && <Route path="pipeline" element={<ModuleGuard module="pipeline"><Pipeline /></ModuleGuard>} />}
      </Route>
    </Routes>
  )
}

function TeamSelector() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Sprint Tracker</h1>
        <p className="text-gray-500 text-center mb-6">Selecciona tu equipo</p>
        <div className="space-y-3">
          {(Object.keys(TEAM_CONFIG) as TeamId[]).map((tid) => (
            <a
              key={tid}
              href={`/${tid}`}
              className="block w-full px-4 py-4 border-2 rounded-lg text-center font-medium border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              {TEAM_CONFIG[tid].name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/docs" element={<DocsIndex />} />
          <Route path="/docs/:slug" element={<DocView />} />
          <Route path="/configurador" element={<ConfiguradorPage />} />
          <Route path="/marketing-analysis" element={<MarketingAnalysisPage />} />
          <Route path="/plan-fast-track-abril" element={<PlanFastTrackPage />} />
          <Route path="/meta-reporte" element={<MetaReportePage />} />
          <Route path="/formularios-reporte" element={<FormulariosReportePage />} />
          <Route path="/capacidad-envios" element={<CapacidadEnviosPage />} />
          <Route path="/smartlead" element={<SmartleadHubPage />} />
          <Route path="/smartLead" element={<SmartleadHubPage />} />
          <Route
            path="/plantillas"
            element={
              <Suspense fallback={<div className="p-10 text-slate-400">Cargando editor de plantillas…</div>}>
                <PlantillasPage />
              </Suspense>
            }
          />
          <Route path="/" element={<TeamSelector />} />
          <Route path="/:team/*" element={<ValidateTeam><AppRoutes /></ValidateTeam>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
