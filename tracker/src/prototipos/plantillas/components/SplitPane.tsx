import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  initial?: number // porcentaje 0-100
  min?: number
  max?: number
}

// Split pane horizontal con divider draggable. Guarda la posición en
// localStorage para persistir entre sesiones.

const STORAGE_KEY = 'plantillas:splitpane:percent'

export default function SplitPane({
  left,
  right,
  initial = 50,
  min = 30,
  max = 70,
}: Props) {
  const [pct, setPct] = useState<number>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    const n = stored ? parseFloat(stored) : NaN
    return Number.isFinite(n) && n >= min && n <= max ? n : initial
  })
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, String(pct))
  }, [pct])

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const next = ((e.clientX - rect.left) / rect.width) * 100
      setPct(Math.max(min, Math.min(max, next)))
    },
    [min, max],
  )

  useEffect(() => {
    if (!dragging) return
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging, onMouseMove])

  return (
    <div ref={containerRef} className="flex w-full h-full min-h-0 relative">
      <div className="overflow-auto" style={{ width: `${pct}%` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => setDragging(true)}
        className={`w-1 bg-slate-200 hover:bg-indigo-400 cursor-col-resize transition-colors ${dragging ? 'bg-indigo-500' : ''}`}
      />
      <div className="overflow-auto flex-1">{right}</div>
    </div>
  )
}
