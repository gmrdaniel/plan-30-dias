/**
 * Script para crear usuarios de auth en Supabase usando la Admin API.
 * Ejecutar una sola vez:
 *   npx tsx scripts/create-auth-users.ts
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nvbanvwibmghxroybjxp.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY en variables de entorno')
  console.error('Ejecuta: SUPABASE_SERVICE_ROLE_KEY=tu_key npx tsx scripts/create-auth-users.ts')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const USERS = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'daniel@laneta.com', password: 'daniel2026', name: 'Daniel Ramirez' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'gabriel@laneta.com', password: 'gabriel2026', name: 'Gabriel Pinero' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'lillian@laneta.com', password: 'lillian2026', name: 'Lillian Lucio' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'dayana@laneta.com', password: 'dayana2026', name: 'Dayana Vizcaya' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'eugenia@laneta.com', password: 'eugenia2026', name: 'Eugenia Garcia' },
]

async function main() {
  console.log('Creando usuarios de auth...\n')

  for (const u of USERS) {
    // Primero intentar eliminar si existe (para poder re-crear limpio)
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find((x) => x.email === u.email)
    if (found) {
      console.log(`  ${u.email} ya existe (${found.id}), eliminando...`)
      await supabase.auth.admin.deleteUser(found.id)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      user_metadata: { name: u.name },
      email: u.email,
      password: u.password,
      email_confirm: true,
    })

    if (error) {
      console.error(`  ERROR ${u.email}: ${error.message}`)
    } else {
      console.log(`  OK ${u.email} -> ${data.user.id}`)

      // Actualizar team_members para que el ID coincida
      if (data.user.id !== u.id) {
        console.log(`    Actualizando team_members: ${u.id} -> ${data.user.id}`)

        // Actualizar task_assignments primero (FK)
        await supabase.from('task_assignments').update({ member_id: data.user.id }).eq('member_id', u.id)
        // Actualizar task_comments
        await supabase.from('task_comments').update({ author_id: data.user.id }).eq('author_id', u.id)
        // Actualizar task_checklist
        await supabase.from('task_checklist').update({ checked_by: data.user.id }).eq('checked_by', u.id)
        // Actualizar team_members
        await supabase.from('team_members').update({ id: data.user.id }).eq('id', u.id)
      }
    }
  }

  console.log('\nListo. Usuarios creados.')
  console.log('\nCredenciales:')
  USERS.forEach(u => console.log(`  ${u.name}: ${u.email} / ${u.password}`))
}

main().catch(console.error)
