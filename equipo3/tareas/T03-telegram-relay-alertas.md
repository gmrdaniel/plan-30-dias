# T03 — Telegram + Relay.app Alertas

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T03 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Eugenia García |
| **Fecha Inicio** | Martes 7 Abril |
| **Fecha Entrega** | Martes 7 Abril (config básica). Día 9+ (alertas Tipo B cuando herramientas conectadas) |
| **Bloqueada por** | — (config básica). T07/T08/T12 (alertas Tipo B) |
| **Bloquea a** | T14, T18, DTO-OUT-02 |

## Objetivo
Telegram operativo con canales por función. Relay.app configurado para notificar a ventas SOLO cuando deben actuar. El logging de eventos es responsabilidad de cada herramienta (T07/T08/T12), no de T03.

## Alcance de T03 (solo notificaciones, NO logging)

| Responsabilidad | Tarea |
|---|---|
| **T03 (esta tarea)** | Canales Telegram + Relay.app → notificaciones cuando ventas debe actuar |
| **T07 (Smartlead/Expandi)** | Conectar Smartlead → HubSpot y Expandi → HubSpot para logging de eventos |
| **T08 (ManyChat/Twilio)** | Conectar ManyChat → HubSpot y Twilio → HubSpot para logging de eventos |
| **T09 (Sendspark)** | Conectar Sendspark → HubSpot para logging de video views |
| **T16 (Unbounce)** | Conectar Unbounce → HubSpot para logging de visitas micrositio |
| **T03-V (nueva)** | Validar que TODOS los logs llegan a HubSpot correctamente |

---

## Detalle de Implementación

### Día 2: Configuración básica

#### Paso 1: Crear canales Telegram
| Canal | Propósito | Quién debe estar |
|-------|-----------|-----------------|
| #leads-b2b-calientes | Alertas cuando ventas debe actuar (respuestas, reuniones) | Equipo 1, Daniel |
| #creadores-nuevos | Creadores cualificados del pipeline ManyChat | Equipo 2, Daniel |
| #salud-dominios | Reportes diarios de reputación email (Gabriel) | Equipo 3 |
| #standup-diario | Standup async 9 AM | Todos los líderes |
| #general-sprint | Comunicación general | Todos |

#### Paso 2: Configurar Relay.app ($9/mes)
1. Ir a relay.app → Sign up
2. Conectar HubSpot como fuente
3. Conectar Telegram como destino
4. Crear relay de prueba:
   - Trigger: nuevo contacto en HubSpot con tag "TEST"
   - Acción: enviar mensaje a #leads-b2b-calientes
   - Verificar que llega

#### Paso 3: Alerta de prueba
- Daniel crea contacto de prueba en HubSpot con tag "TEST"
- Verificar que la alerta llega a Telegram en <5 min
- Todos los equipos confirman recepción

### Día 9+: Configurar notificaciones de acción (después de T07/T08)

---

## Lista de notificaciones — Daniel/Pepe validan cuáles activar

> Solo notificar cuando ventas debe ACTUAR. Los demás eventos se logean silenciosamente en HubSpot.

| # | Evento | Herramienta origen | Relay escucha a | Flujo técnico | Notificar? | Canal | Tiempo respuesta |
|---|---|---|---|---|---|---|---|
| N1 | Prospecto respondió email | Smartlead | **Smartlead (directo)** | Smartlead → Relay → Telegram | ☐ **SI (recomendado)** | #leads-b2b-calientes | <1 hora |
| N2 | Prospecto respondió LinkedIn DM | Expandi | **HubSpot** (Expandi no está en Relay) | Expandi → HubSpot webhook → Relay → Telegram | ☐ **SI (recomendado)** | #leads-b2b-calientes | <1 hora |
| N3 | Prospecto respondió WhatsApp | ManyChat | **ManyChat (directo)** | ManyChat → Relay → Telegram | ☐ **SI (recomendado)** | #leads-b2b-calientes | <30 min |
| N4 | Prospecto agendó reunión | Calendly | **Calendly (directo)** | Calendly → Relay → Telegram | ☐ **SI (recomendado)** | #leads-b2b-calientes | Preparar antes de reunión |
| N5 | Prospecto respondió SMS | Twilio | **Twilio (directo)** | Twilio → Relay → Telegram | ☐ **PREGUNTAR** | #leads-b2b-calientes | Evaluar contenido |
| N6 | Score alto nuevo prospecto | Clay/HubSpot | **HubSpot** | Clay → HubSpot → Relay → Telegram | ☐ **SI (recomendado)** | #leads-b2b-calientes | Informativo |
| N7 | Creador cualificado | ManyChat | **ManyChat o HubSpot** | ManyChat → HubSpot → Relay → Telegram | ☐ **SI (recomendado)** | #creadores-nuevos | Asignar account manager |
| N8 | Prospecto abrió email | Smartlead | HubSpot (log) | Solo log en HubSpot, NO notificar | ☐ NO | — | — |
| N9 | Prospecto clickeó link | Smartlead | HubSpot (log) | Solo log en HubSpot, NO notificar | ☐ NO | — | — |
| N10 | Prospecto visitó micrositio | Unbounce | HubSpot (log) | Solo log en HubSpot (Unbounce no está en Relay) | ☐ NO | — | — |
| N11 | Prospecto vió video Sendspark | Sendspark | HubSpot (log) | Solo log en HubSpot (Sendspark no está en Relay) | ☐ NO | — | — |
| N12 | Dominio degradado | MxToolbox/Gabriel | Manual | Gabriel reporta en Telegram | ☐ SI | #salud-dominios | Pausar envíos |

### Integraciones disponibles en Relay.app (verificado)

| Herramienta | ¿Está en Relay.app? | Puede ser trigger directo? |
|---|---|---|
| HubSpot | **SI** | SI — trigger por cambio en contacto/deal |
| Telegram | **SI** | SI como destino |
| Smartlead | **SI** | SI — trigger por reply/bounce |
| ManyChat | **SI** | SI — trigger por evento |
| Twilio | **SI** | SI — trigger por SMS recibido |
| Calendly | **SI** | SI — trigger por reunión agendada |
| Expandi | **NO** | Solo via HubSpot (Expandi → HubSpot webhook → Relay) |
| Sendspark | **NO** | Solo via HubSpot |
| Unbounce | **NO** | Solo via HubSpot |

### Formato de notificaciones

**#leads-b2b-calientes:**
```
🔥 [ACCIÓN REQUERIDA] {tipo_evento}
Prospecto: {nombre} | {empresa}
Score: {icp_score} | Canal: {canal_respuesta}
→ Ver en HubSpot: {link}
Responder antes de: {tiempo_limite}
```

**#creadores-nuevos:**
```
🎬 Nuevo creador cualificado
{nombre} | {plataforma} | {suscriptores} subs
Idioma: {idioma} | Ingresos: ${ingresos}
→ Ver en HubSpot: {link}
```

---

## Entregables
- [ ] 5 canales Telegram creados con miembros correctos
- [ ] Relay.app conectado a HubSpot + Telegram
- [ ] Alerta de prueba recibida exitosamente
- [ ] Lista de notificaciones N1-N12 validada por Daniel/Pepe (checks definidos)
- [ ] Notificaciones N1-N7 configuradas en Relay.app (las aprobadas)
- [ ] Formato de mensaje definido y configurado

## Criterios de Aceptación
- [ ] Alerta de prueba llega a Telegram en <5 min
- [ ] Todos los líderes confirman acceso a canales
- [ ] Cada notificación aprobada tiene su relay configurado y probado
- [ ] Notificaciones NO aprobadas no generan mensajes (solo log en HubSpot)

## Costo
| Item | Costo |
|------|-------|
| Telegram | $0 |
| Relay.app | $9/mes |

## Notas para Eugenia
- **Día 2:** Solo config básica (canales + 1 relay de prueba). NO necesitas que Smartlead/Expandi estén listos.
- **Día 9+:** Cuando T07/T08 estén listos, agregar los relays de Tipo B (N1-N5).
- Relay.app tiene interfaz visual — no necesitas código.
- Para Expandi (N2): como Expandi no está en Relay, el trigger es via HubSpot. Configura: "Cuando contacto en HubSpot cambia a status = replied Y source = LinkedIn".
- Los checks de N1-N12 los define Daniel/Pepe. Pregúntales el Día 2.
- Documenta cada relay con capturas de pantalla.
