import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { TeamMember, TeamId } from '../lib/types'

interface AuthCtx {
  user: TeamMember | null
  members: TeamMember[]
  currentTeam: TeamId
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  members: [],
  currentTeam: 'team3',
  login: async () => 'Error',
  logout: () => {},
  loading: true,
})

function getTeamFromPath(pathname: string): TeamId {
  const seg = pathname.split('/').filter(Boolean)[0]
  return seg === 'team2' ? 'team2' : 'team3'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const currentTeam = getTeamFromPath(location.pathname)

  const [user, setUser] = useState<TeamMember | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const loadMembers = async (team: TeamId) => {
    const { data, error } = await supabase.from('team_members').select('*').eq('team_id', team)
    if (error) console.error('Error loading team_members:', error)
    if (data) setMembers(data as TeamMember[])
    return data as TeamMember[] | null
  }

  const loadUserFromSession = async (allMembers?: TeamMember[] | null) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const memberList = allMembers || members
      const found = memberList.find((m) => m.id === session.user.id)
      setUser(found || null)
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadMembers(currentTeam).then((data) => {
      loadUserFromSession(data).then(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadMembers(currentTeam).then((data) => {
          const found = (data || []).find((m) => m.id === session.user.id)
          setUser(found || null)
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [currentTeam])

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const found = members.find((m) => m.id === session.user.id)
      if (found) setUser(found)
      else return 'Este usuario no pertenece a este equipo'
    }
    return null
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, members, currentTeam, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
