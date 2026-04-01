import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth'
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

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Cargando...</div>
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
        <Route path="/my" element={<MyView />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/task/:taskId" element={<TaskDetail />} />
        <Route path="/procurement" element={<Procurement />} />
        <Route path="/blockers" element={<Blockers />} />
        <Route path="/pipeline" element={<Pipeline />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes - no auth required */}
          <Route path="/docs" element={<DocsIndex />} />
          <Route path="/docs/:slug" element={<DocView />} />
          {/* Auth-protected routes */}
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
