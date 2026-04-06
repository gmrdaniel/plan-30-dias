# T10 — Slybroadcast + Social Blade + Outgrow Adquisición

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T10 |
| **Prioridad** | 🟠 ALTA |
| **Responsable** | Eugenia (Social Blade + Outgrow), Daniel (Slybroadcast) |
| **Apoyo** | Lillian (Outgrow UX) |
| **Fecha Inicio** | Martes 14 Abril |
| **Fecha Entrega** | Martes 14 Abril |
| **Bloqueada por** | — |
| **Bloquea a** | T16 (Outgrow embebido en micrositios) |

## Objetivo
Adquirir y configurar las herramientas de apoyo: voicemail masivo, analytics de creadores y contenido interactivo.

---

## Daniel: VoiceDrop.ai ($95/mes)

> Reemplaza Slybroadcast. Ventaja principal: HubSpot nativo (resuelve gap G1) + voz IA clonada.

### Pasos
1. Activar trial en voicedrop.ai ($20 de crédito gratis, 5 días)
2. **Clonar voz IA:**
   - Grabar 60 segundos de audio de muestra (voz natural, sin ruido)
   - VoiceDrop genera clon de voz para personalización automática
3. **Configurar integración HubSpot:**
   - Ir a HubSpot Marketplace → buscar "VoiceDrop"
   - Instalar la app y autenticar
   - Crear workflow: cuando contacto llega a etapa "Contactado" en pipeline B2B → disparar voicemail automático
4. **Configurar mensaje:**
   - Template con variables: "Hola {{firstname}}, vi que {{company}}..."
   - VoiceDrop genera el audio personalizado con la voz clonada
5. Configurar horario de envío: 9 AM - 5 PM zona del prospecto
6. Si el trial funciona, contratar plan $95/mes (1,000 voicemails)

### Entregable: VoiceDrop activo, voz IA clonada, workflow HubSpot configurado, voicemail de prueba enviado

---

## Eugenia: Social Blade API ($4/mes)

### Pasos
1. Ir a socialblade.com → API plans
2. Comprar plan básico ($3.99/mes)
3. Obtener API key
4. **Verificar acceso a datos:**
   - Buscar 5 creadores de YouTube de ejemplo
   - Verificar que obtienes: suscriptores, vistas, estimado de ingresos, idioma
5. Documentar estructura de datos disponible para Gabriel (él la usará en Clay)

### Entregable: Social Blade API activa, 5 búsquedas de prueba exitosas, estructura de datos documentada

**Dónde buscar:** socialblade.com/api-guide

---

## Eugenia: Outgrow ($22/mes)

### Pasos
1. Ir a outgrow.co → Sign up → Plan Freelancer ($22/mes)
2. Explorar templates disponibles:
   - Buscar template tipo "Calculator" o "Assessment"
   - Estos se usarán en T16 para construir las herramientas
3. **Crear un calculator de prueba** (puede ser simple):
   - Input: "¿Cuántos suscriptores tienes?"
   - Output: "Tu potencial de ingresos es $X"
   - Esto es para familiarizarse con la plataforma
4. **Verificar embed:** Generar código embed y probar que funciona en una página HTML simple

### Entregable: Outgrow activo, calculator de prueba creado, embed verificado

**Dónde buscar:** outgrow.co/blog/category/tutorials, YouTube "Outgrow calculator tutorial"

---

## Criterios de Aceptación
- [ ] VoiceDrop.ai: cuenta activa, voz IA clonada, workflow HubSpot configurado
- [ ] Social Blade: API key obtenida, 5 búsquedas exitosas
- [ ] Outgrow: cuenta activa, calculator de prueba creado, embed funciona
- [ ] Credenciales documentadas en gestor compartido

## Costo
| Item | Costo |
|------|-------|
| VoiceDrop.ai | $95/mes (trial $20 gratis) |
| Social Blade API | $4/mes |
| Outgrow | $22/mes |
