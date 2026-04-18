import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Mail, MessageCircle, Briefcase, Phone, Smartphone, Mic } from 'lucide-react'
import { B2B_TEMPLATES } from '../templates'
import type { Channel, SequenceTemplate, TemplateStep } from '../types'

export interface TreeSelection {
  sequence_name: string
  step_number: number
}

interface Props {
  selection: TreeSelection | null
  onSelect: (s: TreeSelection) => void
  highlightedSteps?: Set<string>
}

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Briefcase,
  voice: Phone,
  sms: Smartphone,
}

const CHANNEL_COLOR: Record<Channel, string> = {
  email: 'text-sky-600',
  whatsapp: 'text-emerald-600',
  linkedin: 'text-indigo-600',
  voice: 'text-amber-600',
  sms: 'text-rose-600',
}

export default function TreeView({ selection, onSelect, highlightedSteps }: Props) {
  const [openPrograms, setOpenPrograms] = useState<Record<string, boolean>>({ b2b: true })
  const [openTemplates, setOpenTemplates] = useState<Record<string, boolean>>(() => {
    return Object.fromEntries(B2B_TEMPLATES.map((t) => [t.sequence_name, true]))
  })

  const byProgram = useMemo(() => {
    const map = new Map<string, SequenceTemplate[]>()
    for (const tpl of B2B_TEMPLATES) {
      const arr = map.get(tpl.program) ?? []
      arr.push(tpl)
      map.set(tpl.program, arr)
    }
    return map
  }, [])

  function toggleProgram(p: string) {
    setOpenPrograms((s) => ({ ...s, [p]: !s[p] }))
  }
  function toggleTemplate(n: string) {
    setOpenTemplates((s) => ({ ...s, [n]: !s[n] }))
  }

  return (
    <div className="text-sm">
      {Array.from(byProgram.entries()).map(([program, templates]) => {
        const open = openPrograms[program] ?? false
        return (
          <div key={program} className="mb-3">
            <button
              className="flex items-center gap-1 w-full text-left font-semibold text-gray-900 py-1 hover:bg-gray-50 rounded px-2"
              onClick={() => toggleProgram(program)}
            >
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="uppercase tracking-wide text-xs text-indigo-700">
                {program === 'b2b' ? 'B2B · Fábrica de Anuncios' : program}
              </span>
            </button>

            {open &&
              templates.map((tpl) => {
                const openT = openTemplates[tpl.sequence_name] ?? false
                return (
                  <div key={tpl.sequence_name} className="ml-4 mt-2 border-l border-gray-200 pl-3">
                    <button
                      className="flex items-start gap-1 w-full text-left py-1 hover:bg-gray-50 rounded px-2"
                      onClick={() => toggleTemplate(tpl.sequence_name)}
                    >
                      {openT ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded ${
                              tpl.tier === 'A'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tpl.tier === 'B'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {tpl.tier}
                          </span>
                          <span className="font-medium text-gray-900">{tpl.label}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {tpl.sequence_name} · {tpl.touches} touches · {tpl.duration_days}d
                        </div>
                      </div>
                    </button>

                    {openT && (
                      <div className="ml-6 mt-1 space-y-0.5">
                        {tpl.steps.map((step) => (
                          <StepRow
                            key={step.step_number}
                            step={step}
                            selected={
                              selection?.sequence_name === tpl.sequence_name &&
                              selection?.step_number === step.step_number
                            }
                            highlighted={highlightedSteps?.has(
                              `${tpl.sequence_name}:${step.step_number}`,
                            )}
                            onClick={() =>
                              onSelect({
                                sequence_name: tpl.sequence_name,
                                step_number: step.step_number,
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}

function StepRow({
  step,
  selected,
  highlighted,
  onClick,
}: {
  step: TemplateStep
  selected: boolean
  highlighted?: boolean
  onClick: () => void
}) {
  const Icon = CHANNEL_ICON[step.channel] ?? Mic
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 py-1 px-2 rounded text-left transition-colors ${
        selected
          ? 'bg-indigo-50 border border-indigo-200'
          : highlighted
          ? 'bg-emerald-50'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <span className={`inline-flex w-10 justify-end text-xs font-mono text-gray-500`}>
        D{step.offset_days}
      </span>
      <Icon size={14} className={CHANNEL_COLOR[step.channel]} />
      <span className="text-xs text-gray-700 flex-1 truncate">
        {step.action_type}
      </span>
      <span className="text-[10px] uppercase text-gray-400 tracking-wider">
        {step.provider}
      </span>
      {step.signal_depends_on && (
        <span className="text-[10px] text-amber-600 font-mono">
          ↳{typeof step.signal_depends_on === 'number' ? `S${step.signal_depends_on}` : 'acc'}
        </span>
      )}
    </button>
  )
}
