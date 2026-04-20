import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PLANS } from '../data/plan'
import Collapse from './Collapse'
import TemplatesModal from './TemplatesModal'
import BranchLinksModal from './BranchLinksModal'

type Plan = (typeof PLANS)[number]

const TAB_BADGE: Record<string, string> = {
  A: 'bg-[#0F52BA]',
  B: 'bg-[#F59E0B]',
  C: 'bg-emerald-600',
}

export default function PlanTabs() {
  const [active, setActive] = useState<string>('A')
  const plan = PLANS.find((p) => p.id === active)!

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg border text-left transition-all ${
              active === p.id
                ? 'border-[#0F52BA] bg-white shadow-md'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-white font-bold ${TAB_BADGE[p.id]}`}>
              {p.id}
            </span>
            <div>
              <p className={`text-sm font-bold ${active === p.id ? 'text-slate-900' : 'text-slate-700'}`}>{p.name}</p>
              <p className="text-xs text-slate-500">{p.tag}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Plan detail */}
      <PlanCard plan={plan} />
    </div>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [branchOpen, setBranchOpen] = useState(false)
  // Plan A tiene Smartlead + Brevo. Plan B solo Smartlead. Plan C no muestra los botones.
  const showModalButtons = plan.id === 'A' || plan.id === 'B'
  const channelFilter = plan.id === 'B' ? 'Smartlead' : undefined

  return (
    <div className="space-y-5">
      {/* Recommendation + objective */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#0F52BA]">
          <p className="text-xs uppercase text-[#0F52BA] font-semibold">Recomendación</p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{plan.recommendation}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
          <p className="text-xs uppercase text-[#F59E0B] font-semibold">Objetivo</p>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{plan.objective}</p>
        </div>
      </div>

      {/* Start date + volume total KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Fecha inicio</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{plan.startDate}</p>
          <p className="text-xs text-slate-500">{plan.startNote}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Volumen total</p>
          <p className="text-xl font-bold text-[#0F52BA] mt-1">
            {plan.volume[plan.volume.length - 1].accum.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">envíos acumulados</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Senders activos</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {plan.senders.filter((s) => s.channel === 'Smartlead' || s.channel === 'Brevo').length}
          </p>
          <p className="text-xs text-slate-500">inboxes en rotación</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Duración</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{plan.volume.length} días</p>
          <p className="text-xs text-slate-500">cronograma completo</p>
        </div>
      </div>

      {/* Volume chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-bold text-slate-900">Volumen acumulado día a día</h3>
        <div style={{ width: '100%', height: 260 }} className="mt-4">
          <ResponsiveContainer>
            <AreaChart data={plan.volume} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F52BA" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0F52BA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-lg bg-white border border-slate-200 shadow-lg p-3 text-xs">
                      <p className="font-bold text-slate-900">{d.day} {d.date}</p>
                      <p className="text-slate-600">{d.inboxes}</p>
                      <p className="mt-1">Envíos: <span className="font-semibold">{d.sends.toLocaleString()}</span></p>
                      <p>Acumulado: <span className="font-semibold text-[#0F52BA]">{d.accum.toLocaleString()}</span></p>
                    </div>
                  )
                }}
              />
              <Area type="monotone" dataKey="accum" stroke="#0F52BA" strokeWidth={2} fill={`url(#gradient-${plan.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success metrics + pros/cons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs uppercase text-emerald-700 font-semibold">Métricas de éxito</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {plan.successMetrics.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600 shrink-0">✓</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 border-l-4 border-l-[#0F52BA]">
          <p className="text-xs uppercase text-[#0F52BA] font-semibold">Ventajas</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {(plan.pros as readonly string[]).map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#0F52BA] shrink-0">+</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 border-l-4 border-l-rose-500">
          <p className="text-xs uppercase text-rose-700 font-semibold">Trade-offs</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {(plan.cons as readonly string[]).map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-600 shrink-0">−</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Templates */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h4 className="text-sm font-bold text-slate-900">Plantillas · Branch.io · Subjects · Workflow</h4>
          {showModalButtons && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setTemplatesOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
                Ver plantillas
              </button>
              <button
                onClick={() => setBranchOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#0F52BA] text-[#0F52BA] hover:bg-[#0F52BA] hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Ver Branch links
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <TemplateRow label="Plantilla Smartlead" value={plan.templates.smartlead} />
          <TemplateRow label="Plantilla Brevo" value={plan.templates.brevo} />
          <TemplateRow label="Branch links" value={plan.templates.branchLinks} mono />
          <TemplateRow label="Subject primario" value={plan.templates.subjectPrimary} />
          {plan.templates.subjectSecondary && (
            <TemplateRow label="Subjects secundarios" value={plan.templates.subjectSecondary} />
          )}
          <TemplateRow label="Workflow" value={plan.templates.workflow} />
        </div>
      </div>

      {/* Workflow ASCII */}
      <Collapse label="Ver workflow detallado (diagrama ASCII)">
        <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">
{plan.workflowAscii}
        </pre>
      </Collapse>

      {/* Senders table — detalle */}
      <Collapse label={`Ver tabla de senders (${plan.senders.length} inboxes)`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Sender</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Dominio</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Canal</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Uso</th>
              </tr>
            </thead>
            <tbody>
              {plan.senders.map((s, i) => (
                <tr key={i} className={`border-b border-slate-100 ${s.channel === '—' ? 'bg-slate-50 text-slate-500' : ''}`}>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">{s.email}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{s.domain}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-md ${
                        s.channel === 'Smartlead'
                          ? 'bg-[#0F52BA]/10 text-[#0F52BA]'
                          : s.channel === 'Brevo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.channel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{s.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapse>

      {/* Volume daily table — detalle */}
      <Collapse label="Ver cronograma día a día completo">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Día</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Fecha</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-slate-600 font-semibold">Inboxes</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Envíos</th>
                <th className="px-3 py-2 text-right text-xs uppercase text-slate-600 font-semibold">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {plan.volume.map((v, i) => (
                <tr key={i} className={`border-b border-slate-100 ${v.sends === 0 ? 'bg-slate-50 text-slate-400' : ''}`}>
                  <td className="px-3 py-2 font-semibold text-slate-700">{v.day}</td>
                  <td className="px-3 py-2">{v.date}</td>
                  <td className="px-3 py-2 text-slate-700">{v.inboxes}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{v.sends.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold text-[#0F52BA]">{v.accum.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Collapse>

      {/* Decision matrix (solo Plan C) */}
      {'decisionMatrix' in plan && plan.decisionMatrix ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 border-l-4 border-l-[#F59E0B]">
          <h4 className="text-sm font-bold text-slate-900 mb-3">Matriz de decisión Día 4</h4>
          <div className="space-y-2">
            {(plan.decisionMatrix as ReadonlyArray<{ observed: string; decision: string }>).map((d, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 p-3 bg-slate-50 rounded-md">
                <p className="text-sm text-slate-700">{d.observed}</p>
                <p className="text-sm font-semibold text-[#0F52BA]">{d.decision}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Advantages + sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Ventajas respecto a clicks/escaneos</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {plan.advantages.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600 shrink-0">→</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-500 font-semibold">Fuentes / best practices</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {plan.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0F52BA] hover:underline"
                >
                  {s.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modales */}
      {showModalButtons && (
        <>
          <TemplatesModal open={templatesOpen} onClose={() => setTemplatesOpen(false)} channelFilter={channelFilter} />
          <BranchLinksModal open={branchOpen} onClose={() => setBranchOpen(false)} />
        </>
      )}
    </div>
  )
}

function TemplateRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-slate-200 bg-slate-50 rounded-md p-3">
      <p className="text-xs uppercase text-slate-500 font-semibold">{label}</p>
      <p className={`mt-1 text-sm text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}
