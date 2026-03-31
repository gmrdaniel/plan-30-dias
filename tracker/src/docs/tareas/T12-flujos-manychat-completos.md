# T12 — Flujos ManyChat WhatsApp + Instagram Completos

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T12 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Dayana Vizcaya |
| **Apoyo** | Lillian (UX review) |
| **Fecha Inicio** | Martes 14 Abril |
| **Fecha Entrega** | Miércoles 15 Abril |
| **Bloqueada por** | T08 (ManyChat configurado, templates aprobados por Meta) |
| **Bloquea a** | T14 (testing E2E), DTO-OUT-06 (→ Eq2 para aprobación) |

## Objetivo
Flujos completos de ManyChat para: (1) cualificación de creadores por WhatsApp, (2) reclutamiento por Instagram DM. Integrados con Branch.io deep links.

---

## Flujo 1: Cualificación Creadores por WhatsApp

### Estructura del flujo
```
TRIGGER: Creador llega vía Branch.io deep link (desde IG DM, SMS, o ad)
  │
  ├─ Mensaje 1: Bienvenida
  │  "¡Hola {{nombre}}! 👋 Somos La Neta. Vimos tu contenido y
  │   creemos que puedes ganar más. ¿Tienes 2 minutos?"
  │  [Botón: Sí, cuéntame] [Botón: No, gracias]
  │
  ├─ Si "Sí" → Pregunta 1: Plataforma
  │  "¿En qué plataforma creas contenido principalmente?"
  │  [YouTube] [TikTok] [Instagram] [Twitch]
  │
  ├─ Pregunta 2: Suscriptores
  │  "¿Cuántos suscriptores/seguidores tienes?"
  │  [<10K] [10K-50K] [50K-100K] [100K+]
  │
  ├─ Pregunta 3: Ingresos actuales
  │  "¿Cuánto generas mensualmente con tu contenido?"
  │  [<$500] [$500-$2K] [$2K-$5K] [$5K+]
  │
  ├─ Pregunta 4: Idioma
  │  "¿En qué idioma es tu contenido?"
  │  [Español] [Inglés] [Portugués] [Otro]
  │
  ├─ CALIFICACIÓN (automática):
  │  Si suscriptores >= 10K Y ingresos > $500:
  │    → "¡Genial! Según tus datos, podrías ganar {{proyección}}.
  │       Te voy a conectar con un Account Manager."
  │    → Tag: "Cualificado" en ManyChat
  │    → Push a HubSpot: pipeline Creadores, etapa "Cualificado"
  │    → Alerta Telegram #creadores-nuevos
  │
  │  Si no cumple:
  │    → "Gracias por tu interés. Por ahora trabajamos con creadores
  │       de 10K+ suscriptores. Te dejamos nuestra calculadora: {{link}}"
  │    → Tag: "No cualificado - nurture"
  │
  └─ Si "No, gracias" → Despedida amable + link a calculadora
```

### Configuración técnica
- Variables de ManyChat: nombre, plataforma, suscriptores, ingresos, idioma
- Integración HubSpot: Zapier/Relay webhook para crear contacto
- **Integración Supabase:** Webhook ManyChat → Supabase Edge Function para crear registro en `creator_inventory`
- Branch.io: Deep link en los botones que redirigen a contenido externo

### Conexión ManyChat → Supabase (creadores nuevos)

**Responsable conexión:** Gabriel o Daniel (implementan la Edge Function + configuran webhook)
**Responsable configuración ManyChat:** Dayana (conecta el webhook en la interfaz de ManyChat)

**Flujo técnico:**
1. Creador completa cualificación en ManyChat → tag "Cualificado"
2. ManyChat dispara webhook POST a Supabase Edge Function `sync-manychat-creator`
3. Edge Function crea registro nuevo en `creator_inventory`:

```
// ManyChat → creator_inventory
{
  nombre           → creator_inventory.first_name
  plataforma       → creator_social_profiles.platform
  suscriptores     → creator_social_profiles.followers
  idioma           → creator_inventory.language
  status           → 'pending_registration'
  lead_source      → 'manychat_whatsapp' (campo nuevo o usar notes)
}

// Agrupación
{
  lista            → creator_lists: "Sprint-Abr-Nuevos-Pipeline"
  item             → creator_list_items: vincular creador a lista
}
```

**Nota:** Los datos existentes en `creator_inventory` (50K+) son históricos. Este pipeline genera registros nuevos. No se hace dedup contra históricos.

---

## Flujo 2: Reclutamiento por Instagram DM

### Estructura del flujo
```
TRIGGER: Creador interactúa con hashtag/contenido específico
  (o responde a Story, o envía DM con keyword)
  │
  ├─ Mensaje automático:
  │  "¡Hola! 🎬 Vi tu contenido y me encantó.
  │   ¿Sabías que creadores como tú están ganando 3x más
  │   con servicios como doblaje y streaming 24/7?
  │
  │   Mira este video de 15 segundos: {{link_video_sendspark}}
  │
  │   ¿Te interesa saber más?"
  │  [Sí, quiero saber más] [No, gracias]
  │
  ├─ Si "Sí":
  │  "¡Genial! Te mando más info por WhatsApp que es más fácil 👇"
  │  [Botón: Ir a WhatsApp] → Branch.io deep link → Flujo 1
  │
  └─ Si "No":
     "¡Sin problema! Si cambias de opinión, aquí estaremos 🙌"
```

---

## Lillian: UX Review (Mié 15 Abr)

### Qué revisar
1. **Flujo conversacional:** ¿Se siente natural? ¿Las opciones son claras?
2. **Transición IG → WhatsApp:** ¿El deep link funciona en móvil?
3. **Errores de UX:** ¿Hay callejones sin salida? ¿Qué pasa si el usuario no responde?
4. **Tono:** ¿Es profesional pero amigable?
5. Documentar feedback en un doc compartido para que Dayana itere

---

## Entregables
- [ ] Flujo WhatsApp de cualificación completo y funcional
- [ ] Flujo Instagram DM de reclutamiento completo y funcional
- [ ] Branch.io deep links integrados en ambos flujos
- [ ] **Webhook ManyChat → Supabase configurado y funcionando** (creadores nuevos llegan a `creator_inventory`)
- [ ] Prueba end-to-end en dispositivo móvil (video de evidencia)
- [ ] UX review de Lillian completado
- [ ] Flujos enviados a Mery (Equipo 2) para aprobación (DTO-OUT-06)

## Criterios de Aceptación
- [ ] Un usuario de prueba puede completar el flujo WhatsApp de principio a fin
- [ ] El deep link de Instagram → WhatsApp funciona en iOS y Android
- [ ] Los datos de cualificación llegan a HubSpot correctamente
- [ ] **Los datos de cualificación llegan a Supabase (`creator_inventory` + `creator_lists`)**
- [ ] La alerta de Telegram se dispara para creadores cualificados
- [ ] Lillian da visto bueno de UX

## Costo
| Item | Costo adicional |
|------|----------------|
| — | $0 (ManyChat ya pagado en T08) |
