-- Migration 005: Procurement tracking table for Daniel

create table procurement (
  id uuid primary key default gen_random_uuid(),
  tool_key text unique not null,
  tool_name text not null,
  category text,
  cost_monthly text,
  cost_onetime text,
  priority text not null,
  priority_order integer not null default 0,
  deadline text,
  needed_by_task text,
  needed_by_date text,
  is_contracted boolean default false,
  contracted_at timestamptz,
  contracted_by uuid references team_members(id),
  notes text,
  created_at timestamptz default now()
);

alter table procurement enable row level security;
create policy "public_read_procurement" on procurement for select using (true);
create policy "public_update_procurement" on procurement for update using (true);

GRANT SELECT, UPDATE ON procurement TO anon, authenticated;

-- Seed procurement items ordered by priority
INSERT INTO procurement (tool_key, tool_name, category, cost_monthly, cost_onetime, priority, priority_order, deadline, needed_by_task, needed_by_date) VALUES
  -- P0 — ADELANTAR
  ('dominios', '5 Dominios Secundarios (GoDaddy)', 'Infraestructura', null, '~$60', 'P0 — ADELANTAR', 0, 'Antes del 6 Abr', 'T01', '6 Abr'),
  ('google_workspace_new', '15 Cuentas Email (Google Workspace)', 'Infraestructura', '~$108', null, 'P0 — ADELANTAR', 0, 'Antes del 6 Abr', 'T01', '6 Abr'),
  ('smartlead', 'Smartlead', 'Email Masivo', '$94', null, 'P0 — ADELANTAR', 0, '6 Abr', 'T01, T07', '6 Abr'),
  -- P1 — DIA 1
  ('clay_upgrade', 'Clay Upgrade (Base → Pro)', 'Enriquecimiento', '+$346', null, 'P1 — DIA 1', 1, '6 Abr', 'T06, T11', '8 Abr'),
  ('hubspot', 'HubSpot CRM', 'CRM', 'Free', null, 'P1 — DIA 1', 1, '7 Abr', 'T02', '7 Abr'),
  ('telegram', 'Telegram (grupos)', 'Comunicacion', 'Free', null, 'P1 — DIA 1', 1, '7 Abr', 'T03', '7 Abr'),
  -- P2 — DIAS 2-4
  ('relay', 'Relay.app', 'Automatizacion', '$9', null, 'P2 — DIAS 2-4', 2, '7 Abr', 'T03', '7 Abr'),
  ('expandi', 'Expandi', 'LinkedIn Automation', '$99', null, 'P2 — DIAS 2-4', 2, '9 Abr', 'T07', '9 Abr'),
  ('justcall', 'JustCall', 'Telefonia', '$30', null, 'P2 — DIAS 2-4', 2, '9 Abr', 'T07', '9 Abr'),
  -- P3 — DIAS 5-7
  ('manychat', 'ManyChat Pro', 'Chatbot / Messaging', '$65', null, 'P3 — DIAS 5-7', 3, '10 Abr', 'T08, T12', '10 Abr'),
  ('branch', 'Branch.io', 'Deep Linking', 'Free', null, 'P3 — DIAS 5-7', 3, '10 Abr', 'T08', '10 Abr'),
  ('twilio', 'Twilio', 'SMS / RCS', '~$30', null, 'P3 — DIAS 5-7', 3, '10 Abr', 'T08', '10 Abr'),
  ('sendspark', 'Sendspark', 'Video Personalizado', '$129', null, 'P3 — DIAS 5-7', 3, '13 Abr', 'T09', '13 Abr'),
  ('elevenlabs', 'ElevenLabs', 'Clonacion Voz IA', '$99', null, 'P3 — DIAS 5-7', 3, '13 Abr', 'T09', '13 Abr'),
  ('klaviyo', 'Klaviyo', 'Email / SMS Marketing', '$20', null, 'P3 — DIAS 5-7', 3, '13 Abr', 'T09', '13 Abr'),
  ('slybroadcast', 'Slybroadcast', 'Voicemail Masivo', null, '$175', 'P3 — DIAS 5-7', 3, '14 Abr', 'T10', '14 Abr'),
  ('socialblade', 'Social Blade API', 'Analytics Creadores', '$4', null, 'P3 — DIAS 5-7', 3, '14 Abr', 'T10', '14 Abr'),
  ('outgrow', 'Outgrow', 'Calculadoras Interactivas', '$22', null, 'P3 — DIAS 5-7', 3, '14 Abr', 'T10, T16', '14 Abr'),
  -- P4 — SEMANA 2
  ('unbounce', 'Unbounce', 'Landing Pages B2B', '$99', null, 'P4 — SEMANA 2', 4, '20 Abr', 'T16', '17 Abr'),
  ('leadpages', 'Leadpages', 'Landing Pages Creadores', '$49', null, 'P4 — SEMANA 2', 4, '20 Abr', 'T16', '17 Abr'),
  -- P5 — SEMANA 3+
  ('visualping', 'Visualping', 'Monitoreo Web', '$25', null, 'P5 — SEMANA 3+', 5, '22 Abr', 'T17', '22 Abr'),
  -- Opcionales
  ('linkedin_sales_nav', 'LinkedIn Sales Navigator', 'Enriquecimiento', '$100/usuario', null, 'OPCIONAL', 6, 'Evaluar 8 Abr', 'T06, T11', '8 Abr'),
  ('synthflow', 'Agente Voz IA (Synthflow/Bland)', 'Audio y Llamadas', '$29-500', null, 'OPCIONAL', 6, 'Evaluar 9 Abr', 'T07', '9 Abr'),
  ('routable', 'Routable', 'Pagos Masivos', '~$500', null, 'OPCIONAL', 6, 'Evaluar 22 Abr', 'T17', '22 Abr'),
  ('phantombuster', 'PhantomBuster', 'Scraping LinkedIn', '$59', null, 'OPCIONAL', 6, 'Evaluar 10 Abr', 'T06', '8 Abr');
