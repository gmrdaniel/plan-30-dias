# T08 — ManyChat + WhatsApp Business + Branch.io + Twilio

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T08 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Dayana (ManyChat), Gabriel (Twilio), Lillian (Branch.io) |
| **Fecha Inicio** | Viernes 10 Abril |
| **Fecha Entrega** | Lunes 13 Abril |
| **Bloqueada por** | — |
| **Bloquea a** | T12 (flujos completos), DTO-07 |

## Objetivo
Infraestructura de mensajería configurada: chatbot WhatsApp/Instagram, deep links para transición entre canales, SMS vía Twilio.

---

## Dayana: ManyChat Pro + WhatsApp Business API (Vie 10 Abr)

### Pasos
1. Daniel compra ManyChat Pro ($65/mes)
2. Login ManyChat → Upgrade a Pro
3. **Conectar WhatsApp Business API:**
   - Necesitas una cuenta de Facebook Business verificada
   - Ir a ManyChat > Settings > Channels > WhatsApp
   - Seguir el wizard de conexión con Meta
   - Seleccionar número de teléfono (usar uno de Twilio o número dedicado)
4. **Enviar templates de mensajes a Meta para aprobación:**
   - Template 1: Bienvenida/Cualificación — "Hola {{nombre}}, vi tu contenido en {{plataforma}}..."
   - Template 2: Follow-up — "{{nombre}}, ¿te interesa saber cuánto podrías ganar...?"
   - Template 3: Enlace a calculadora — "Aquí tu proyección personalizada: {{link}}"
   - **IMPORTANTE:** Meta tarda 24-48h en aprobar. Enviar HOY.
5. **Conectar Instagram:**
   - Settings > Channels > Instagram
   - Conectar con la cuenta de Instagram de outreach (T05)

### Entregable: ManyChat Pro activo, WhatsApp Business API conectado, templates enviados a Meta, Instagram conectado

---

## Gabriel: Twilio (Vie 10 Abr)

### Pasos
1. Daniel compra cuenta Twilio
2. **Comprar números telefónicos:**
   - 1 número US (+1) para prospectos B2B norteamericanos
   - 1 número MX (+52) para prospectos LATAM
3. **Registrar A2P 10DLC** (obligatorio para SMS en US):
   - Twilio Console > Messaging > A2P Registration
   - Completar Brand Registration
   - Completar Campaign Registration
   - **NOTA:** Puede tardar 1-4 semanas. Iniciar HOY.
4. **Configurar webhooks:**
   - Incoming SMS → webhook a ManyChat o HubSpot
   - Delivery status → logging
5. **Probar envío SMS** a un número de prueba

### Entregable: 2 números comprados, A2P registro iniciado, webhook configurado, SMS de prueba enviado

---

## Lillian: Branch.io (Vie 10 Abr)

### Pasos
1. Crear cuenta Branch.io (free tier, <10k links)
2. **Configurar app:**
   - Dashboard > Link Settings
   - Configurar dominio personalizado si es posible (ej: link.lanetapro.com)
3. **Crear templates de deep link:**
   - Template 1: Instagram → WhatsApp (redirect mobile users al chat de WhatsApp)
   - Template 2: Email → Micrositio B2B
   - Template 3: Email → Micrositio Creadores
   - Template 4: SMS → Landing page
4. **Probar en móvil:**
   - Probar cada template en iOS (si tienes acceso)
   - Probar en Android
   - Verificar que el redirect funciona correctamente
   - Grabar video corto de la prueba como evidencia
5. **Documentar:** URL de cada template + cómo se genera dinámicamente

### Entregable: Branch.io configurado, 4 templates de deep link creados, probados en móvil (video de prueba)

---

## Criterios de Aceptación
- [ ] ManyChat Pro activo con WhatsApp Business API conectado
- [ ] Al menos 3 templates de WhatsApp enviados a Meta
- [ ] Instagram conectado a ManyChat
- [ ] Twilio: 2 números activos (US + MX)
- [ ] Twilio: A2P 10DLC registro iniciado
- [ ] Twilio: SMS de prueba enviado y recibido exitosamente
- [ ] Branch.io: 4 templates de deep link funcionando
- [ ] Branch.io: probado en al menos 1 dispositivo móvil (iOS o Android)

## Costo
| Item | Costo |
|------|-------|
| ManyChat Pro | $65/mes |
| Twilio | ~$30/mes (estimado) |
| Branch.io (Free) | $0 |

## Riesgos
- **Meta rechaza templates WhatsApp:** Tener 3 variantes de cada template listas. Ajustar lenguaje si rechazan.
- **A2P 10DLC tarda semanas:** Usar SimpleTexting como backup para SMS mientras tanto.
- **Branch.io deep links no redirigen bien en iOS:** Probar con Universal Links de Apple como alternativa.
