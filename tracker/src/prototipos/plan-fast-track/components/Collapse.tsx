import { useState, type ReactNode } from 'react'

type Props = {
  label?: string
  labelOpen?: string
  defaultOpen?: boolean
  children: ReactNode
}

export default function Collapse({ label = 'Ver detalle', labelOpen = 'Ocultar detalle', defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#0F52BA] hover:bg-slate-50 transition-colors rounded-lg"
      >
        <span>{open ? labelOpen : label}</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="border-t border-slate-200 p-4">{children}</div>}
    </div>
  )
}
