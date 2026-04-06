import { ArrowRight } from 'lucide-react'

function Badge({ color, children }: { color: 'blue' | 'green' | 'amber' | 'purple' | 'pink'; children: React.ReactNode }) {
  const cls: Record<string, string> = {
    blue: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
  }
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cls[color]}`}>{children}</span>
}

function StepFlow() {
  const steps = [
    { label: '1. Cargar\ndatos', active: true },
    { label: '2. Enriquecer\ndatos', active: true },
    { label: '3. Revisar\ny clasificar', active: true },
    { label: '4. Generar listas\n+ HubSpot', active: true },
    { label: '5. Push\nSmartlead', active: false },
    { label: '6. Tracking\nwebhooks', active: false },
  ]
  return (
    <div className="flex items-center gap-1.5 flex-wrap my-4">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`border rounded-lg px-3 py-2 text-xs font-semibold text-center whitespace-pre-line min-w-[100px] ${
            s.active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-500'
          }`}>
            {s.label}
          </div>
          {i < steps.length - 1 && <ArrowRight size={14} className="text-gray-300 shrink-0" />}
        </div>
      ))}
    </div>
  )
}

function ToolCard({ title, desc, step, badge }: { title: string; desc: string; step: string; badge: 'blue' | 'green' | 'amber' | 'purple' }) {
  return (
    <div className="bg-white border rounded-xl p-4 hover:border-indigo-300 transition-colors">
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
      <div className="mt-2"><Badge color={badge}>{step}</Badge></div>
    </div>
  )
}

function FlowDiagram({ title, color, steps }: { title: string; color: string; steps: { from: string; arrow: string; to: string }[] }) {
  return (
    <div className={`border-2 rounded-xl p-4 ${color}`}>
      <h3 className="text-sm font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="bg-white border rounded px-2 py-1 font-medium min-w-[110px] text-center">{s.from}</span>
            <span className="text-gray-400 shrink-0">{s.arrow}</span>
            <span className="bg-white border rounded px-2 py-1 font-medium min-w-[110px] text-center">{s.to}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TierTable({ title, rows }: { title: string; rows: { tier: string; badge: 'green' | 'amber' | 'pink'; data: string; sequence: string; channels: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border-b font-semibold">Tier</th>
              <th className="text-left p-2 border-b font-semibold">Datos requeridos</th>
              <th className="text-left p-2 border-b font-semibold">Secuencia</th>
              <th className="text-left p-2 border-b font-semibold">Canales</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 border-b"><Badge color={r.badge}>{r.tier}</Badge></td>
                <td className="p-2 border-b text-gray-600">{r.data}</td>
                <td className="p-2 border-b text-gray-600">{r.sequence}</td>
                <td className="p-2 border-b text-gray-600">{r.channels}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SequenceTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => <th key={i} className="text-left p-2 border-b font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => <td key={j} className="p-2 border-b text-gray-600">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PipelineDiagram() {
  return (
    <div className="space-y-8">
      {/* 1. Vision General */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">1. Vision General — Flujo en 6 Pasos</h2>
        <StepFlow />
        <p className="text-sm text-gray-500">
          El CRM Laneta funciona como orquestador central, coordinando multiples herramientas externas para automatizar la captacion de clientes B2B y creadores de contenido.
        </p>
      </div>

      {/* 2. Ecosistema */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">2. Ecosistema de Herramientas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ToolCard title="SmartScout / Apify / Social Blade" desc="Fuente de datos crudos — CSVs con empresas o creadores" step="Paso 1 Importacion" badge="blue" />
          <ToolCard title="Clay" desc="Enriquecimiento masivo — email cascade, LinkedIn, ICP score" step="Paso 2 Enriquecimiento" badge="amber" />
          <ToolCard title="Hunter.io" desc="Validacion de emails — verifica si es entregable" step="Paso 2 Enriquecimiento" badge="green" />
          <ToolCard title="RapidAPI (IG/TT)" desc="Followers de Instagram y TikTok actualizados" step="Paso 2 Solo creadores" badge="green" />
          <ToolCard title="HubSpot" desc="CRM de ventas — companies, contacts, deals, listas" step="Paso 4 Sincronizacion" badge="green" />
          <ToolCard title="Smartlead" desc="Outreach automatizado — secuencias cold email multicanal" step="Paso 5 Outreach" badge="amber" />
          <ToolCard title="Railway (Python/FastAPI)" desc="Workers de enriquecimiento en background — chunks de 50" step="Paso 2 Backend" badge="green" />
          <ToolCard title="Supabase" desc="Base de datos, autenticacion, Edge Functions" step="Todo el flujo" badge="green" />
        </div>
      </div>

      {/* 3. Flujo B2B */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">3. Flujo B2B — Marcas y Empresas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FlowDiagram
            title="Fuentes → CRM → Destinos"
            color="bg-indigo-50 border-indigo-200"
            steps={[
              { from: 'SmartScout / Apify', arrow: '→', to: '1. IMPORTAR' },
              { from: '1. IMPORTAR', arrow: '→', to: '2. ENRIQUECER (Clay)' },
              { from: '2. ENRIQUECER', arrow: '→', to: '3. CLASIFICAR (A/B/C)' },
              { from: '3. CLASIFICAR', arrow: '→', to: '4. LISTAS + HubSpot' },
              { from: '4. LISTAS', arrow: '→', to: '5. PUSH Smartlead' },
              { from: 'Smartlead', arrow: '→', to: '6. TRACKING webhooks' },
            ]}
          />
          <FlowDiagram
            title="Datos entre sistemas"
            color="bg-green-50 border-green-200"
            steps={[
              { from: 'Clay', arrow: '→ email, LI, score →', to: 'CRM Laneta' },
              { from: 'CRM Laneta', arrow: '→ sync auto →', to: 'HubSpot' },
              { from: 'CRM Laneta', arrow: '→ API POST →', to: 'Smartlead' },
              { from: 'Smartlead', arrow: '→ webhook →', to: 'CRM Laneta' },
              { from: 'Smartlead', arrow: '→ actualiza →', to: 'HubSpot' },
            ]}
          />
        </div>
      </div>

      {/* 4. Flujo Creadores */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">4. Flujo Creadores — Redes Sociales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FlowDiagram
            title="Fuentes → CRM → Destinos"
            color="bg-purple-50 border-purple-200"
            steps={[
              { from: 'Social Blade / Upfluence', arrow: '→', to: '1. IMPORTAR' },
              { from: '1. IMPORTAR', arrow: '→', to: '2. ENRIQUECER (IG/TT)' },
              { from: '2. ENRIQUECER', arrow: '→', to: '3. CLASIFICAR (A/B/C)' },
              { from: '3. CLASIFICAR', arrow: '→', to: '4. LISTAS + HubSpot' },
              { from: '4. LISTAS', arrow: '→', to: '5. PUSH Smartlead' },
              { from: 'Smartlead', arrow: '→', to: '6. TRACKING webhooks' },
            ]}
          />
          <FlowDiagram
            title="Datos entre sistemas"
            color="bg-pink-50 border-pink-200"
            steps={[
              { from: 'RapidAPI', arrow: '→ followers →', to: 'CRM Laneta' },
              { from: 'Hunter.io', arrow: '→ email valid →', to: 'CRM Laneta' },
              { from: 'CRM Laneta', arrow: '→ sync auto →', to: 'HubSpot' },
              { from: 'CRM Laneta', arrow: '→ API POST →', to: 'Smartlead' },
              { from: 'Smartlead', arrow: '→ webhook →', to: 'CRM Laneta' },
            ]}
          />
        </div>
      </div>

      {/* 5. Clasificacion por Tier */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">5. Clasificacion por Tier</h2>
        <div className="space-y-6">
          <TierTable
            title="B2B — Tiers segun datos disponibles"
            rows={[
              { tier: 'Tier A', badge: 'green', data: 'Email valido + LinkedIn + Telefono', sequence: '21 dias multicanal', channels: 'Email, LinkedIn, Telefono, SMS, WhatsApp' },
              { tier: 'Tier B', badge: 'amber', data: 'Email valido + LinkedIn', sequence: '21 dias bicanal', channels: 'Email, LinkedIn' },
              { tier: 'Tier C', badge: 'pink', data: 'Solo email valido', sequence: '14 dias solo email', channels: 'Email' },
            ]}
          />
          <TierTable
            title="Creadores — Tiers segun redes sociales"
            rows={[
              { tier: 'Tier A', badge: 'green', data: 'Email + Instagram + TikTok', sequence: '7 dias mobile-first', channels: 'DM IG, WhatsApp AI, SMS, Nota de voz, Email' },
              { tier: 'Tier B', badge: 'amber', data: 'Email + Instagram o TikTok', sequence: '7 dias parcial', channels: 'DM IG o TT, WhatsApp, Email' },
              { tier: 'Tier C', badge: 'pink', data: 'Solo email', sequence: '7 dias basico', channels: 'Email' },
            ]}
          />
        </div>
      </div>

      {/* 6. Secuencias de Outreach */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">6. Secuencias de Outreach</h2>
        <div className="space-y-6">
          <SequenceTable
            title="B2B — 21 dias"
            headers={['Dia', 'Canal', 'Tier A', 'Tier B', 'Tier C']}
            rows={[
              ['1', 'Email', 'Auditoria de video', 'Auditoria de video', 'Auditoria de video'],
              ['4', 'LinkedIn', 'Solicitud conexion', 'Solicitud conexion', '—'],
              ['5', 'Email', 'Follow-up', 'Follow-up', 'Follow-up'],
              ['7', 'Telefono', 'Voicemail + SMS', '—', '—'],
              ['10', 'LinkedIn', 'Engagement', 'Engagement', '—'],
              ['12', 'Email', 'Caso de estudio', 'Caso de estudio', 'Caso de estudio'],
              ['15', 'WhatsApp', 'Nota de voz', '—', '—'],
              ['18', 'Telefono', 'Llamada directa', '—', '—'],
              ['21', 'Email', 'Breakup', 'Breakup', 'Breakup (dia 14)'],
            ]}
          />
          <SequenceTable
            title="Creadores — 7 dias (mobile-first)"
            headers={['Dia', 'Canal', 'Tier A', 'Tier B', 'Tier C']}
            rows={[
              ['1', 'Instagram', 'DM video 15s', 'DM video 15s', '—'],
              ['2', 'WhatsApp', 'Bot AI calificacion', 'Bot AI calificacion', '—'],
              ['3', 'SMS', 'Testimonial 60s', '—', '—'],
              ['5', 'WhatsApp', 'Nota de voz 30s', 'Nota de voz 30s', '—'],
              ['7', 'Email', 'Contrato + proyecciones', 'Contrato + proyecciones', 'Email completo'],
            ]}
          />
        </div>
      </div>

      {/* 7. Reglas de salida */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">7. Reglas de Salida</h2>
        <div className="bg-white border rounded-xl p-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2"><Badge color="green">interested</Badge> <span>Respuesta positiva en cualquier canal → cancelar secuencia</span></div>
          <div className="flex items-start gap-2"><Badge color="amber">unresponsive</Badge> <span>Sin respuesta despues de 21/7 dias → lista nurturing</span></div>
          <div className="flex items-start gap-2"><Badge color="pink">disqualified</Badge> <span>Bounce → email invalido</span></div>
          <div className="flex items-start gap-2"><Badge color="pink">lost</Badge> <span>Unsubscribe → do_not_contact</span></div>
        </div>
      </div>

      {/* 8. Dos perspectivas */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">8. Dos Perspectivas del Sistema</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border-2 border-indigo-200 bg-indigo-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-indigo-700 mb-2">Equipo de Ventas — Trabaja en HubSpot</h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
              <li>Ve contactos y empresas sincronizados automaticamente</li>
              <li>Leads clasificados por tier (A/B/C) via custom properties</li>
              <li>Smartlead actualiza HubSpot directo (opens, replies)</li>
              <li>Gestiona deals y pipeline de ventas</li>
              <li>Hace seguimiento a leads "interested"</li>
              <li><strong>No necesita entrar al CRM Laneta</strong></li>
            </ul>
          </div>
          <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-4">
            <h3 className="text-sm font-bold text-purple-700 mb-2">Equipo Infraestructura — Trabaja en CRM Laneta</h3>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
              <li>Importa datos crudos (SmartScout, Apify, Social Blade)</li>
              <li>Configura y ejecuta workers de enriquecimiento</li>
              <li>Clasifica leads y genera listas por tier</li>
              <li>Alimenta HubSpot con datos limpios y enriquecidos</li>
              <li>Recibe webhooks de Smartlead</li>
              <li><strong>Orquesta todo el flujo de principio a fin</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 9. Stack */}
      <div>
        <h2 className="text-lg font-bold text-indigo-700 border-b pb-2 mb-3">9. Stack Tecnologico</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border-b font-semibold">Componente</th>
                <th className="text-left p-2 border-b font-semibold">Tecnologia</th>
                <th className="text-left p-2 border-b font-semibold">Proposito</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Frontend', 'React 18 + TypeScript + Tailwind + shadcn/ui', 'Wizard UI, dashboard'],
                ['Base de datos', 'Supabase (PostgreSQL)', 'Almacenamiento, RLS, real-time'],
                ['Backend async', 'Railway (Python/FastAPI)', 'Workers de enriquecimiento'],
                ['Edge Functions', 'Supabase Deno', 'sync-to-hubspot, push-to-smartlead'],
                ['CI/CD', 'GitHub Actions + Vercel', 'Deploy automatico'],
                ['Enriquecimiento', 'Clay, Hunter.io, RapidAPI, Apify', 'APIs de datos'],
                ['Outreach', 'Smartlead', 'Secuencias cold email multicanal'],
                ['CRM ventas', 'HubSpot', 'Pipeline ventas, seguimiento'],
              ].map(([comp, tech, purpose], i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border-b font-medium text-gray-900">{comp}</td>
                  <td className="p-2 border-b text-gray-600">{tech}</td>
                  <td className="p-2 border-b text-gray-500">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
