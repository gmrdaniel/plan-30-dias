export default function EmptySignupsBanner() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📥</span>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800">Pendiente: cargar el Excel de aceptados Meta</h4>
          <p className="text-sm text-slate-600 mt-1">
            La métrica L4 (Registros) está en cero porque la tabla <code className="bg-white px-1 rounded">meta_signups</code> está vacía. El funnel se completa cuando cargues el primer Excel.
          </p>
          <div className="mt-3 bg-white rounded-lg p-3 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
            <p># 1. Drop el .xlsx (o .csv) en:</p>
            <p className="text-slate-500">D:\CRM\brevo\plan-implementacion-abril-2026\meta-signups\inbox\</p>
            <p className="mt-2"># 2. Corre:</p>
            <p className="text-slate-900">python scripts/_import_meta_signups.py</p>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            El parser auto-detecta columnas comunes (email, fecha, nombre, handle, plataforma). Si tu Excel tiene headers raros, edita <code className="bg-white px-1 rounded">COLUMN_ALIASES</code> arriba del script.
            Re-ejecutar con el mismo archivo es idempotente (upsert por email).
          </p>
        </div>
      </div>
    </div>
  )
}
