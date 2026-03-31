/**
 * Sync team_members IDs with auth.users IDs
 * The auth users have different UUIDs than the seeded team_members.
 * We need to update team_members, task_assignments, task_comments, task_checklist
 * to use the auth UUIDs so login works.
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nvbanvwibmghxroybjxp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ID_MAP: Record<string, string> = {
  // old (seeded) → new (auth)
  '11111111-1111-1111-1111-111111111111': '52826521-ca6e-4903-891d-04eb444555bb', // Daniel
  '22222222-2222-2222-2222-222222222222': '571b923f-7946-4202-9aa6-2a3d611c4ef1', // Gabriel
  '33333333-3333-3333-3333-333333333333': '6429e73a-edb9-4e5d-a60f-b8f60b4d6c6f', // Lillian
  '44444444-4444-4444-4444-444444444444': '0af64091-e498-4d32-a40a-737151e0cd4f', // Dayana
  '55555555-5555-5555-5555-555555555555': 'ed5b2649-dadc-49fe-bcff-e60717f1d55f', // Eugenia
}

async function main() {
  console.log('Syncing IDs...\n')

  // We can't update PKs directly. We need to:
  // 1. Create new team_members rows with auth IDs
  // 2. Update FKs in other tables
  // 3. Delete old team_members rows

  // Get current team_members
  const { data: members } = await supabase.from('team_members').select('*')
  if (!members) { console.error('No members found'); return }

  for (const member of members) {
    const newId = ID_MAP[member.id]
    if (!newId || newId === member.id) {
      console.log(`  ${member.short_name}: already synced`)
      continue
    }

    console.log(`  ${member.short_name}: ${member.id} → ${newId}`)

    // Insert new row with auth ID
    const { error: insertErr } = await supabase.from('team_members').insert({
      ...member,
      id: newId,
    })
    if (insertErr) {
      console.error(`    Insert error: ${insertErr.message}`)
      continue
    }

    // Update FKs
    const { error: e1 } = await supabase.from('task_assignments').update({ member_id: newId }).eq('member_id', member.id)
    if (e1) console.error(`    task_assignments error: ${e1.message}`)

    const { error: e2 } = await supabase.from('task_checklist').update({ checked_by: newId }).eq('checked_by', member.id)
    if (e2) console.error(`    task_checklist error: ${e2.message}`)

    const { error: e3 } = await supabase.from('task_comments').update({ author_id: newId }).eq('author_id', member.id)
    if (e3) console.error(`    task_comments error: ${e3.message}`)

    // Delete old row
    const { error: delErr } = await supabase.from('team_members').delete().eq('id', member.id)
    if (delErr) console.error(`    Delete error: ${delErr.message}`)
    else console.log(`    OK`)
  }

  // Verify
  const { data: final } = await supabase.from('team_members').select('id, short_name')
  console.log('\nFinal team_members:', JSON.stringify(final, null, 2))
}

main()
