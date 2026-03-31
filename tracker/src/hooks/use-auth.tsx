import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamMember } from '../lib/types'

interface AuthCtx {
  user: TeamMember | null
  members: TeamMember[]
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  members: [],
  login: async () => 'Error',
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeamMember | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    const { data, error } = await supabase.from('team_members').select('*')
    if (error) console.error('Error loading team_members:', error)
    if (data) setMembers(data)
    return data
  }

  const loadUserFromSession = async (allMembers?: TeamMember[] | null) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const memberList = allMembers || members
      const found = memberList.find((m) => m.id === session.user.id)
      if (found) setUser(found)
    }
  }

  useEffect(() => {
    loadMembers().then((data) => {
      loadUserFromSession(data).then(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const found = members.find((m) => m.id === session.user.id)
        if (found) setUser(found)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message

    // Reload session to get user
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const found = members.find((m) => m.id === session.user.id)
      if (found) setUser(found)
    }
    return null
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, members, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
