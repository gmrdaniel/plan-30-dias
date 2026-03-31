# T14 — Testing E2E + Verificación de Integraciones

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T14 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel (pipeline B2B), Daniel (HubSpot) |
| **Apoyo** | Dayana (alertas), Lillian (Branch.io móvil), Eugenia (datos CRM) |
| **Fecha Inicio** | Jueves 16 Abril |
| **Fecha Entrega** | Jueves 16 Abril |
| **Bloqueada por** | T07, T11, T12 |
| **Bloquea a** | T15, Lanzamiento de campañas (Sem 3) |

## Objetivo
Verificar que los 2 pipelines completos funcionan end-to-end sin errores. Todo el equipo participa.

## Pre-requisito: Datos de prueba
**Los datos de prueba deben estar listos para el Lun 13 Abr (Dia 6).** Daniel coordina.
- Ver **00-DATOS-PRUEBA-TEMPLATES.md** para las plantillas completas
- Minimo: 5 testers B2B (Plantilla A) + 5 testers Creadores (Plantilla B) + 10 prospectos Clay (Plantilla C)
- TODOS marcados con tag "TEST" en cada herramienta
- Testers avisados y con consentimiento de recibir mensajes de prueba

---

## Test 1: Pipeline B2B (Gabriel)

### Flujo a probar
```
SmartScout → Clay → Smartlead → Expandi → HubSpot → Supabase
```

### Pasos
1. Usar prospectos de **Plantilla C** (CL1-CL10), ya cargados en Clay con tag TEST
2. Ejecutar push manual Clay → Smartlead
3. Verificar que el prospecto aparece en Smartlead con datos correctos
4. Ejecutar push manual Clay → Expandi
5. Verificar que el prospecto aparece en Expandi con LinkedIn URL
6. Verificar que ambas herramientas reportan a HubSpot (webhook/integración)
7. En HubSpot: verificar que el contacto aparece en pipeline B2B con datos correctos

### Resultado esperado
- [ ] Prospecto fluye de Clay a Smartlead sin errores
- [ ] Prospecto fluye de Clay a Expandi sin errores
- [ ] Datos en HubSpot son correctos y completos
- [ ] ICP score y video gap score visibles en HubSpot
- [ ] **Sync Clay → Supabase: prospectos TEST aparecen en client_inventory + client_contacts + lista "TEST"**

---

## Test 2: Pipeline Creadores (Dayana + Lillian)

### Flujo a probar
```
Instagram DM → ManyChat → WhatsApp → Branch.io → HubSpot
```

### Pasos (usar testers de **Plantilla B**: C1-C6)
1. Tester C1 envia DM a la cuenta de Instagram (o interactua con keyword trigger)
2. Verificar que ManyChat responde con el flujo de reclutamiento
3. Hacer clic en el botón "Ir a WhatsApp"
4. Verificar que Branch.io redirige correctamente a WhatsApp
5. Completar el flujo de cualificación en WhatsApp
6. Verificar que los datos llegan a HubSpot (pipeline Creadores)
7. Verificar que la alerta se dispara en Slack #creadores-nuevos

### Resultado esperado
- [ ] DM de Instagram dispara flujo ManyChat
- [ ] Deep link Branch.io funciona en móvil (iOS o Android)
- [ ] Flujo WhatsApp se completa correctamente
- [ ] Datos de cualificación llegan a HubSpot
- [ ] **Datos de creador cualificado llegan a Supabase (creator_inventory + creator_lists)**
- [ ] Alerta Slack se dispara
- [ ] Tester C3 (abandono): SMS de recuperacion Klaviyo se envia despues de 24h

---

## Test 3: Integraciones HubSpot (Daniel)

### Verificar cada integración
| Integración | Fuente | Dato que debe llegar | Status |
|-------------|--------|---------------------|--------|
| Clay → HubSpot | Push/webhook | Contacto con todos los campos | ☐ |
| Smartlead → HubSpot | Webhook | Status de email (enviado, abierto, respondido) | ☐ |
| Expandi → HubSpot | Webhook | Status de LinkedIn (conectado, respondido) | ☐ |
| ManyChat → HubSpot | Zapier/Relay | Datos de cualificación de creador | ☐ |
| JustCall → HubSpot | Integración nativa | Registro de llamada | ☐ |
| Calendly → HubSpot | Webhook | Reunión agendada (si aplica) | ☐ |

---

## Test 4: Alertas Slack (Dayana)

### Verificar cada alerta
| Alerta | Canal | Trigger | Status |
|--------|-------|---------|--------|
| Lead B2B caliente | #leads-b2b-calientes | icp_score >= 7 en HubSpot | ☐ |
| Creador nuevo | #creadores-nuevos | Nuevo contacto pipeline Creadores | ☐ |
| Salud dominio | #salud-dominios | (manual por ahora, automático en Sem 3) | ☐ |

---

## Test 5: Branch.io Deep Links (Lillian)

### Probar cada template
| Link | Origen → Destino | iOS | Android |
|------|-------------------|-----|---------|
| IG → WhatsApp | Instagram DM → WhatsApp chat | ☐ | ☐ |
| Email → Micrositio B2B | Email → Unbounce (cuando esté live) | ☐ | ☐ |
| SMS → Landing | SMS → Leadpages (cuando esté live) | ☐ | ☐ |

---

## Test 6: Datos CRM (Eugenia)

### Verificar en HubSpot
1. Abrir los contactos de prueba
2. Verificar que TODAS las propiedades custom tienen valores
3. Verificar que están en el pipeline y etapa correctos
4. Verificar que el historial de actividad muestra las interacciones

---

## Entregables
- [ ] Checklist de tests completado (este documento con todos los ☐ marcados)
- [ ] Lista de bugs/issues encontrados con severidad (Crítico/Alto/Medio/Bajo)
- [ ] Bugs críticos resueltos el mismo día
- [ ] Bugs altos asignados con fecha de resolución

## Criterios de Aceptación
- [ ] Pipeline B2B fluye end-to-end sin errores
- [ ] Pipeline Creadores fluye end-to-end sin errores
- [ ] Todas las integraciones HubSpot verificadas
- [ ] Alertas Slack funcionan
- [ ] Deep links funcionan en móvil
- [ ] CERO bugs críticos abiertos al final del día

## Protocolo si hay bugs críticos
1. Documentar: qué falló, dónde, screenshot
2. Asignar al responsable de la herramienta
3. Fix inmediato (mismo día)
4. Re-test después del fix
5. Si no se puede resolver hoy: escalar a Daniel para re-priorizar
