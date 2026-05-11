import { useMemo, useState } from 'react'
import { updateReplySentiment } from '../data/queries'
import type { MetaReply, ReplySentiment } from '../types'

interface Props {
  replies: MetaReply[]
  onUpdated?: () => void
}

const SENTIMENT_LABELS: Record<ReplySentiment, string> = {
  interested: 'Interesado',
  decline: 'Declina',
  out_of_office: 'OOO',
  unsubscribe_req: 'Unsub',
  other: 'Otro',
}

const SENTIMENT_BADGE: Record<ReplySentiment, string> = {
  interested: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  decline: 'bg-rose-100 text-rose-800 border-rose-300',
  out_of_office: 'bg-slate-100 text-slate-700 border-slate-300',
  unsubscribe_req: 'bg-amber-100 text-amber-800 border-amber-300',
  other: 'bg-slate-100 text-slate-600 border-slate-200',
}

const ALL_SENTIMENTS: ReplySentiment[] = ['interested', 'decline', 'out_of_office', 'unsubscribe_req', 'other']

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function truncate(s: string | null, n = 80): string {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

function SentimentBadge({ sentiment, source }: { sentiment: ReplySentiment | null; source: MetaReply['sentiment_source'] }) {
  if (!sentiment) {
    if (source === 'error') {
      return <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">err</span>
    }
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 border border-slate-200">pending</span>
  }
  const cls = SENTIMENT_BADGE[sentiment]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${cls}`} title={`source: ${source ?? 'n/a'}`}>
      {SENTIMENT_LABELS[sentiment]}
      {source === 'human_override' && <span aria-hidden>✎</span>}
    </span>
  )
}

export default function RepliesTable({ replies, onUpdated }: Props) {
  const [campaignFilter, setCampaignFilter] = useState<Set<number>>(new Set())
  const [stepFilter, setStepFilter] = useState<Set<number>>(new Set())
  const [sentimentFilter, setSentimentFilter] = useState<Set<ReplySentiment | 'pending'>>(new Set())
  const [openReply, setOpenReply] = useState<MetaReply | null>(null)

  const campaigns = useMemo(() => Array.from(new Set(replies.map((r) => r.campaign_id))).sort((a, b) => a - b), [replies])
  const steps = useMemo(() => Array.from(new Set(replies.map((r) => r.step).filter((s): s is number => s !== null))).sort((a, b) => a - b), [replies])

  const filtered = useMemo(() => {
    return replies.filter((r) => {
      if (campaignFilter.size > 0 && !campaignFilter.has(r.campaign_id)) return false
      if (stepFilter.size > 0 && (r.step === null || !stepFilter.has(r.step))) return false
      if (sentimentFilter.size > 0) {
        const key = r.sentiment ?? 'pending'
        if (!sentimentFilter.has(key)) return false
      }
      return true
    })
  }, [replies, campaignFilter, stepFilter, sentimentFilter])

  function toggle<T>(set: Set<T>, value: T, update: (next: Set<T>) => void) {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    update(next)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span aria-hidden>📬</span> Respuestas — quién, cuándo, qué step, sentiment
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {filtered.length === replies.length ? replies.length : `${filtered.length} de ${replies.length}`} respuesta{replies.length === 1 ? '' : 's'} ·
          sentiment auto-clasificado por Haiku 4.5 (✎ = overridden por humano)
        </p>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-start gap-4 pb-4 mb-3 border-b border-slate-200 text-xs">
        {campaigns.length > 1 && (
          <FilterChips
            label="Campaña"
            items={campaigns.map((c) => ({ value: c, label: String(c) }))}
            active={campaignFilter}
            onToggle={(v) => toggle(campaignFilter, v as number, setCampaignFilter)}
          />
        )}
        {steps.length > 0 && (
          <FilterChips
            label="Step"
            items={steps.map((s) => ({ value: s, label: `Step ${s}` }))}
            active={stepFilter}
            onToggle={(v) => toggle(stepFilter, v as number, setStepFilter)}
          />
        )}
        <FilterChips
          label="Sentiment"
          items={[
            ...ALL_SENTIMENTS.map((s) => ({ value: s as ReplySentiment | 'pending', label: SENTIMENT_LABELS[s] })),
            { value: 'pending' as const, label: 'Pending' },
          ]}
          active={sentimentFilter}
          onToggle={(v) => toggle(sentimentFilter, v as ReplySentiment | 'pending', setSentimentFilter)}
        />
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 italic py-6 text-center">
          {replies.length === 0
            ? 'Sin respuestas aún. La tabla se llena en cada snapshot (cada 15 min).'
            : 'Sin resultados con los filtros activos.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wide">
                <th className="text-left py-2 pr-2">Fecha (UTC)</th>
                <th className="text-left py-2 px-2">Lead</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-center py-2 px-2">Step</th>
                <th className="text-center py-2 px-2">Sentiment</th>
                <th className="text-left py-2 pl-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setOpenReply(r)}
                >
                  <td className="py-2 pr-2 tabular-nums text-slate-600 whitespace-nowrap">{fmtDate(r.replied_at)}</td>
                  <td className="py-2 px-2 text-slate-800">{r.lead_name || <span className="text-slate-400">—</span>}</td>
                  <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{r.lead_email}</td>
                  <td className="py-2 px-2 text-center">
                    {r.step !== null ? <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{r.step}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-2 px-2 text-center"><SentimentBadge sentiment={r.sentiment} source={r.sentiment_source} /></td>
                  <td className="py-2 pl-2 text-xs text-slate-500">{truncate(r.body_text, 80) || <span className="italic text-slate-400">sin body</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openReply && (
        <ReplyDetailModal
          reply={openReply}
          onClose={() => setOpenReply(null)}
          onSaved={() => {
            setOpenReply(null)
            onUpdated?.()
          }}
        />
      )}
    </section>
  )
}

function FilterChips<T>({
  label,
  items,
  active,
  onToggle,
}: {
  label: string
  items: { value: T; label: string }[]
  active: Set<T>
  onToggle: (v: T) => void
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((it) => {
          const isActive = active.has(it.value)
          return (
            <button
              key={String(it.value)}
              onClick={() => onToggle(it.value)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                isActive
                  ? 'bg-[#0F52BA] text-white border-[#0F52BA]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F52BA]'
              }`}
            >
              {it.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReplyDetailModal({
  reply,
  onClose,
  onSaved,
}: {
  reply: MetaReply
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState<ReplySentiment | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function setSentiment(s: ReplySentiment) {
    setSaving(s)
    setError(null)
    try {
      await updateReplySentiment(reply.id, s)
      onSaved()
    } catch (e) {
      setError(String((e as Error)?.message ?? e))
    } finally {
      setSaving(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {reply.lead_name || reply.lead_email}
            </h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {reply.lead_email} · Step {reply.step ?? '—'} · {fmtDate(reply.replied_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {reply.subject && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Subject</p>
              <p className="text-sm text-slate-800 mt-0.5">{reply.subject}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Body</p>
            {reply.body_text ? (
              <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded p-3 mt-1 font-sans leading-relaxed">
                {reply.body_text}
              </pre>
            ) : (
              <p className="text-xs italic text-slate-400 mt-1">
                Body no se pudo recuperar de message-history. El classifier marcó como error.
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">
              Sentiment · actual: <SentimentBadge sentiment={reply.sentiment} source={reply.sentiment_source} />
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SENTIMENTS.map((s) => {
                const isCurrent = reply.sentiment === s
                const cls = SENTIMENT_BADGE[s]
                return (
                  <button
                    key={s}
                    onClick={() => setSentiment(s)}
                    disabled={saving !== null || isCurrent}
                    className={`text-xs px-3 py-1.5 rounded border font-semibold transition-colors ${cls} ${
                      isCurrent ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    } disabled:cursor-wait`}
                  >
                    {saving === s ? 'Guardando…' : SENTIMENT_LABELS[s]}
                  </button>
                )
              })}
            </div>
            {error && <p className="text-xs text-rose-700 mt-2">{error}</p>}
            <p className="text-[10px] text-slate-400 mt-2">
              Override se guarda como <code className="bg-slate-100 px-1 rounded">sentiment_source=human_override</code> con timestamp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
