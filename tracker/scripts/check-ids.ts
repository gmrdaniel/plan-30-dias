import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nvbanvwibmghxroybjxp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const { data: members } = await supabase.from('team_members').select('id, short_name')
  console.log('team_members:', JSON.stringify(members, null, 2))

  const { data: { users } } = await supabase.auth.admin.listUsers()
  console.log('\nauth.users:', users?.map(u => ({ id: u.id, email: u.email })))
}

main()
