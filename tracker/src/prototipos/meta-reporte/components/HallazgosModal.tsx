interface Props {
  onClose: () => void
}

export default function HallazgosModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hallazgos clave — 2026-04-27</h2>
            <p className="text-sm text-slate-500">Análisis del reporte horario de Smartlead</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm text-slate-700">

          {/* Hallazgo 1 */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              1. La campaña dejó de enviar a la 1:30 PM (no por bug, por cap)
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
              <li><span className="font-mono">7 AM → 1 PM</span>: 163 sends sostenidos a ~27/hora (cerca del max de los 9 inboxes)</li>
              <li><span className="font-mono">1-2 PM</span>: solo 10 sends → ya tocando el techo</li>
              <li><span className="font-mono">2 PM →</span>: 0 nuevos sends → cap diario alcanzado</li>
            </ul>
          </section>

          {/* Hallazgo 2 */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              2. La predicción de Smartlead estaba muy desactualizada
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
              <li><strong>Predicted</strong>: 7/hora × 24h = <span className="font-mono">168/día</span> (probablemente recordaba el cap=15 anterior)</li>
              <li><strong>Actual</strong>: <span className="font-mono">163/día</span> con todos los sends en <strong>6 horas</strong> (7 AM – 1 PM)</li>
              <li>Smartlead aprende del histórico — va a ajustarse con más data</li>
            </ul>
          </section>

          {/* Hallazgo 3 */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              3. Open rate 71.2% es real, no bots
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
              <li>En Plan B veíamos clicks ≈ opens (1:1 = sospecha Gmail Link Scanner)</li>
              <li>Aquí: 116 opens / 6 clicks = ratio <span className="font-mono">19:1</span> → ratio humano normal</li>
              <li>Replies = 1 (CTR de respuesta 0.6%, normal en cold outreach)</li>
            </ul>
          </section>

          {/* Hallazgo 4 */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2">
              4. Cap real aprovechado: 90.5% (163/180)
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
              <li>Banda <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">VERDE</span> según nuestra regla (≥90%)</li>
              <li>Lo no enviado: 17 sends (probablemente porque algunos inboxes pegaron individual cap antes que otros)</li>
            </ul>
          </section>

          {/* Pregunta de fondo */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              ¿Por qué se detuvo a la 1 PM?
            </h3>
            <p className="text-slate-700 mb-2">
              Smartlead respeta caps por inbox. Con <span className="font-mono">9 × 20 = 180</span> teórico, pero:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
              <li>En la práctica algunos inboxes llegan a su 20 antes que otros (depende de qué leads se asignaron a cada uno)</li>
              <li>Cuando &gt;50% de inboxes tope su cap, el throughput cae</li>
              <li>Después de la 1 PM los 17 sends faltantes están "esperando" inboxes con cupo, pero Smartlead prefiere espaciar antes que apretar al final del día</li>
            </ul>
          </section>

          {/* Recomendación */}
          <section className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <h3 className="font-bold text-emerald-900 text-base mb-2">Recomendación: dejar como está (Opción C)</h3>
            <p className="text-emerald-800 leading-relaxed">
              163 sends/día en ventana laboral con OR 71% es <strong>excelente performance</strong>.
              Si querés más volumen, mejor crear un 2do batch de leads (de los 3,333 limpios del 500k-1M)
              que Ana procese 800 → 1,500 leads, en lugar de empujar el cap.
            </p>
          </section>

        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
