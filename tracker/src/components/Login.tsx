import { useState } from 'react'
import { useAuth } from '../hooks/use-auth'

// Map short_name to email for Supabase Auth login
const EMAIL_MAP: Record<string, string> = {
  Daniel: 'daniel@laneta.com',
  Gabriel: 'gabriel@laneta.com',
  Lillian: 'lillian@laneta.com',
  Dayana: 'dayana@laneta.com',
  Eugenia: 'eugenia@laneta.com',
}

export default function Login() {
  const { members, login, loading } = useAuth()
  const [selected, setSelected] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Cargando...</div>

  if (members.length === 0) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-xl font-bold mb-2">Sin conexion a la base de datos</h1>
        <p className="text-gray-500 text-sm mb-4">No se encontraron miembros del equipo. Verifica que:</p>
        <ul className="text-left text-sm text-gray-600 space-y-1 mb-4">
          <li>1. Las migraciones SQL se ejecutaron en Supabase</li>
          <li>2. Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estan correctas</li>
          <li>3. RLS permite lectura publica en team_members</li>
        </ul>
        <p className="text-xs text-gray-400">Abre la consola del navegador (F12) para ver el error exacto</p>
      </div>
    </div>
  )

  const handleLogin = async () => {
    if (!selected) return
    setError('')
    const email = EMAIL_MAP[selected]
    if (!email) { setError('Usuario no configurado'); return }
    const errMsg = await login(email, password)
    if (errMsg) setError(errMsg)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Equipo 3: Infraestructura</h1>
        <p className="text-gray-500 text-center mb-6">Sprint Tracker</p>

        <div className="space-y-2 mb-6">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelected(m.short_name); setPassword(''); setError('') }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                selected === m.short_name ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: m.avatar_color }}
              >
                {m.short_name[0]}
              </div>
              <div className="text-left">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-500">{m.role}</div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Entrar como {selected}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
