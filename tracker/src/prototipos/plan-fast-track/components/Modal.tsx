import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  maxWidth?: string
}

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-4xl' }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-2xl ${maxWidth} w-full max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1120] text-white px-6 py-4 flex items-start justify-between border-b-2 border-[#0F52BA] shrink-0">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-slate-300 text-sm mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none shrink-0"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F52BA] text-white text-sm font-medium rounded-lg hover:bg-[#0A3D8F]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
