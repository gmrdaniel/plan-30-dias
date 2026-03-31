# T18 — Monitoreo Diario + Resolución de Integraciones

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T18 |
| **Prioridad** | 🟠 ALTA |
| **Responsable** | Gabriel (dominios), Dayana (redes) |
| **Apoyo** | Todo el equipo (resolución) |
| **Fecha Inicio** | Miércoles 22 Abril |
| **Fecha Entrega** | Viernes 8 Mayo (continuo) |
| **Bloqueada por** | T14 (testing E2E completado) |
| **Bloquea a** | T19 (evaluación necesita datos de monitoreo) |

## Objetivo
Mantener todos los sistemas operativos, detectar problemas temprano y resolverlos antes de que impacten las campañas.

---

## Gabriel: Monitoreo Diario de Dominios de Email (9 AM)

### Rutina diaria (10-15 minutos)
1. **Google Postmaster Tools** — Revisar para cada dominio:
   - Tasa de spam reportado (debe ser <0.1%)
   - Reputación del dominio (debe ser "High")
   - Tasa de autenticación (SPF/DKIM pass rate)
2. **MxToolbox** — Revisar blacklists:
   - Ir a mxtoolbox.com/blacklists.aspx
   - Verificar cada dominio
   - Si aparece en alguna blacklist: ALERTAR INMEDIATAMENTE
3. **Mail-Tester** — Enviar email de prueba semanal (cada lunes):
   - Score debe mantenerse >= 9/10
4. **Smartlead Dashboard:**
   - Bounce rate por cuenta (debe ser <5%)
   - Open rate (benchmark: >40% durante warmup)
   - Si alguna cuenta tiene bounce rate >5%: pausar 48h

### Reporte diario en Telegram #salud-dominios
Formato:
```
📊 Reporte Dominios — [Fecha]
✅ laneta-media.com — OK (spam: 0.02%, reputación: High)
✅ globalreview-content.com — OK
⚠️ lanetastudio.com — Bounce rate 6% en cuenta taylor@ → PAUSADA 48h
❌ [dominio] — En blacklist XYZ → Investigando
```

### Acciones correctivas
| Problema | Acción | Tiempo máximo |
|----------|--------|---------------|
| Bounce rate >5% | Pausar cuenta 48h, limpiar lista | Mismo día |
| Blacklisted | Solicitar delisting + pausar dominio | Mismo día |
| Spam rate >0.1% | Reducir volumen 50%, revisar contenido | Mismo día |
| Reputación baja | Reducir volumen, solo warmup por 5 días | Mismo día |

---

## Dayana: Monitoreo de Redes Sociales (10 AM)

### LinkedIn (diario)
1. Revisar cada cuenta de outreach en Expandi:
   - ¿Hay advertencias de restricción?
   - ¿La tasa de aceptación de conexiones es normal (>20%)?
   - Si hay restricción: PAUSAR Expandi para esa cuenta por 48h
2. Verificar que los mensajes automatizados se están enviando
3. Revisar respuestas y marcar en HubSpot

### Instagram (diario)
1. Revisar cuenta de outreach:
   - ¿Instagram limitó los DMs? (rate limiting)
   - ¿ManyChat está enviando mensajes correctamente?
2. Si hay rate limiting: reducir volumen de ManyChat en 50%
3. Revisar engagement orgánico (likes, comentarios, follows)

### Reporte en Telegram #standup-diario
```
📱 Redes — [Fecha]
LinkedIn: 2 cuentas activas, 0 restricciones, 15 conexiones enviadas
Instagram: OK, 20 DMs enviados, 5 respuestas
ManyChat WhatsApp: 10 conversaciones activas, 3 cualificados
```

---

## Todo el Equipo: Resolución de Integraciones (según ocurra)

### Issues comunes y responsable

| Issue | Responsable | Primer paso |
|-------|-------------|-------------|
| Clay → Smartlead no sincroniza | Gabriel | Verificar API key, revisar logs de Clay |
| ManyChat → WhatsApp template rechazado | Dayana | Ajustar texto, reenviar a Meta |
| Branch.io deep link no redirige | Lillian | Verificar URL scheme, probar en otro device |
| HubSpot no recibe datos | Daniel | Verificar webhooks, revisar logs Relay.app |
| Klaviyo SMS no se envía | Eugenia | Verificar trigger, revisar logs Klaviyo |
| Expandi restringido por LinkedIn | Dayana | Pausar 48h, reducir límites |
| ElevenLabs API falla | Gabriel | Verificar API key, revisar rate limits |

### Protocolo de resolución
1. Detectar issue (monitoreo diario o reporte de otro equipo)
2. Documentar: qué falla, desde cuándo, screenshot
3. Investigar root cause (15 min máx)
4. Si sabes cómo resolver: fix + re-test
5. Si no: escalar a Daniel → Gabriel (si es técnico) → vendor support
6. Documentar solución en doc compartido "Issues Resueltos"

---

## Entregables
- [ ] Reporte diario de dominios en Telegram (Gabriel) — mínimo 15 reportes en el sprint
- [ ] Reporte diario de redes en standup (Dayana) — mínimo 15 reportes
- [ ] Doc "Issues Resueltos" actualizado con cada incidente
- [ ] Cero issues críticos abiertos por más de 24h

## Criterios de Aceptación
- [ ] Ningún dominio en blacklist al final del sprint
- [ ] Ninguna cuenta LinkedIn permanentemente restringida
- [ ] Todos los pipelines operativos al cierre del sprint
- [ ] Issues resueltos documentados para referencia futura
