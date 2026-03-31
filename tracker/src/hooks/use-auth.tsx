import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { TeamMember } from '../lib/types'

interface AuthCtx {
  user: TeamMember | null
  members: TeamMember[]
  login: (shortName: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  members: [],
  login: async () => false,
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeamMember | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('team_members').select('*').then(({ data }) => {
      if (data) setMembers(data)
      const saved = localStorage.getItem('tracker_user_id')
      if (saved && data) {
        const found = data.find((m) => m.id === saved)
        if (found) setUser(found)
      }
      setLoading(false)
    })
  }, [])

  const login = async (shortName: string, password: string) => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('short_name', shortName)
      .eq('password', password)
      .single()
    if (data) {
      setUser(data)
      localStorage.setItem('tracker_user_id', data.id)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tracker_user_id')
  }

  return (
    <AuthContext.Provider value={{ user, members, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
