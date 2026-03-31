-- Sprint Tracker: Equipo 3 Infraestructura
-- Migration 001: Create all tables

create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  role text not null,
  avatar_color text not null default '#6366f1',
  password text not null,
  is_leader boolean default false,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  task_id text unique not null,
  title text not null,
  objective text,
  priority text not null check (priority in ('CRITICA', 'ALTA', 'MEDIA')),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'bloqueada', 'completada')),
  phase text not null
    check (phase in ('pre_sprint', 'semana_1', 'semana_2', 'semana_3_4', 'cierre')),
  start_date date not null,
  due_date date not null,
  blocked_by text[] default '{}',
  blocks text[] default '{}',
  detail_md text,
  progress_pct integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_assignments (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references tasks(task_id) on delete cascade,
  member_id uuid not null references team_members(id) on delete cascade,
  assignment_role text not null check (assignment_role in ('responsable', 'apoyo', 'co-ejecuta')),
  unique(task_id, member_id)
);

create table task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references tasks(task_id) on delete cascade,
  category text not null check (category in ('entregable', 'criterio')),
  description text not null,
  is_checked boolean default false,
  checked_by uuid references team_members(id),
  checked_at timestamptz,
  sort_order integer default 0
);

create table task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references tasks(task_id) on delete cascade,
  author_id uuid not null references team_members(id),
  content text not null,
  created_at timestamptz default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  milestone_id text unique not null,
  title text not null,
  target_date date not null,
  success_criteria text not null,
  is_completed boolean default false,
  completed_at timestamptz
);

-- Auto-compute progress from checklist
create or replace function update_task_progress()
returns trigger as $$
declare
  total int;
  checked int;
begin
  select count(*), count(*) filter (where is_checked)
  into total, checked
  from task_checklist
  where task_id = coalesce(new.task_id, old.task_id);

  if total > 0 then
    update tasks
    set progress_pct = round((checked::numeric / total) * 100),
        updated_at = now()
    where task_id = coalesce(new.task_id, old.task_id);
  end if;

  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger checklist_progress_trigger
after insert or update or delete on task_checklist
for each row execute function update_task_progress();

-- RLS (simple: all authenticated can read/write)
alter table team_members enable row level security;
alter table tasks enable row level security;
alter table task_assignments enable row level security;
alter table task_checklist enable row level security;
alter table task_comments enable row level security;
alter table milestones enable row level security;

create policy "public_read_all" on team_members for select using (true);
create policy "public_read_all" on tasks for select using (true);
create policy "public_update_tasks" on tasks for update using (true);
create policy "public_read_all" on task_assignments for select using (true);
create policy "public_read_all" on task_checklist for select using (true);
create policy "public_update_checklist" on task_checklist for update using (true);
create policy "public_read_all" on task_comments for select using (true);
create policy "public_insert_comments" on task_comments for insert with check (true);
create policy "public_read_all" on milestones for select using (true);
create policy "public_update_milestones" on milestones for update using (true);
