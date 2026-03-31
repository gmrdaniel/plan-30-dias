# MAPA DE RIESGOS — Equipo 3: Infraestructura

---

## Riesgos Críticos (Impacto Alto + Probabilidad Alta)

### R01: Retraso en warmup de email (14 días mínimo)
- **Impacto:** Cada día de retraso = 1 día de retraso en lanzamiento de campañas email
- **Probabilidad:** MEDIA (depende de comprar Smartlead + configurar cuentas Día 1)
- **Mitigación:** Smartlead se compra Día 1 ANTES de configurar emails. Gabriel conecta cuentas el mismo día. Si hay problemas con Smartlead, activar Instantly.ai como backup ($37/mes).
- **Owner:** Gabriel + Daniel
- **Trigger de escalación:** Si al final del Día 1 no hay al menos 10 cuentas en warmup → alerta a Daniel

### R02: ICP no llega de equipos 1 y 2 a tiempo
- **Impacto:** Clay cascade se construye con criterios incorrectos → prospectos de baja calidad → desperdicio de warmup
- **Probabilidad:** ALTA (depende de coordinación con otros equipos)
- **Mitigación:**
  1. Eugenia envía template de ICP el viernes 4 Abr (pre-sprint) para que Pepe y Mery lo llenen durante el fin de semana
  2. Si no llega el 7 Abr: usar ICP genérico temporal basado en datos existentes del CRM
  3. Daniel escala directamente con dirección si hay bloqueo
- **Owner:** Eugenia + Daniel

### R03: Internet de Gabriel falla en día crítico
- **Impacto:** Tareas técnicas críticas (DNS, Clay, APIs) se detienen
- **Probabilidad:** MEDIA-ALTA (reportado como problema recurrente)
- **Mitigación:**
  1. Gabriel debe tener plan B de internet (hotspot móvil, coworking cercano)
  2. Para tareas de Día 1-2: tener a Daniel como backup técnico (sabe programar)
  3. Tareas de Gabriel siempre con deadline a las 3 PM para tener margen de backup
  4. Todas las credenciales en gestor compartido (no en la máquina de Gabriel)
- **Owner:** Daniel (escala) + Gabriel (ejecuta plan B)

### R04: Aprobación de plantillas WhatsApp por Meta tarda >48hrs
- **Impacto:** ManyChat WhatsApp Business no puede enviar mensajes
- **Probabilidad:** MEDIA (Meta puede rechazar templates)
- **Mitigación:**
  1. Enviar templates el Día 5 (Vie 10 Abr) para tener el fin de semana de buffer
  2. Preparar 3 variantes de cada template por si rechazan alguno
  3. Si rechazo: Dayana ajusta y reenvía inmediatamente
- **Owner:** Dayana

---

## Riesgos Altos (Impacto Alto + Probabilidad Media)

### R05: SPF/DKIM/DMARC mal configurados
- **Impacto:** Emails van a spam → warmup inútil → todo el timeline se corre
- **Probabilidad:** BAJA (Gabriel sabe de email config)
- **Mitigación:** Verificación obligatoria con MxToolbox + Mail-Tester antes de conectar a Smartlead. Score mínimo: 9/10 en Mail-Tester.
- **Owner:** Gabriel

### R06: Clay upgrade necesita coordinación presupuestaria
- **Impacto:** Sin upgrade ($149 → $495), la cascada de enriquecimiento no tiene suficientes créditos para 1,000 prospectos
- **Probabilidad:** BAJA (Daniel es DG y puede decidir, pero debe coordinar con otros equipos si impacta presupuesto global)
- **Mitigación:** Daniel comunica el costo del upgrade a los líderes de otros equipos el Día 1. Si hay restricción presupuestaria: ejecutar cascada con plan base limitado (300-400 prospectos) y solicitar upgrade cuando se vean resultados.
- **Owner:** Daniel

### R07: Sobrecarga de Dayana en Días 5-8
- **Impacto:** ManyChat, Expandi, Sendspark, ElevenLabs, flujos — todo asignado a ella en 4 días
- **Probabilidad:** ALTA
- **Mitigación:**
  1. Lillian apoya con Branch.io (Día 5) y UX review de flujos (Día 8)
  2. Tareas de Dayana están secuenciadas: primero setup (Días 5-6), luego flujos (Días 7-8)
  3. Daniel interviene si se acumula — él sabe operar y puede tomar una herramienta
- **Owner:** Daniel (monitorea carga)

### R08: Lillian necesita ramp-up en herramientas nuevas
- **Impacto:** Micrositios (Unbounce/Leadpages) tardan más de lo planeado
- **Probabilidad:** MEDIA (recién egresada, herramientas nuevas para ella)
- **Mitigación:**
  1. Días 1-4: Lillian investiga Unbounce + Leadpages + Outgrow (pre-trabajo)
  2. Preparar wireframes en Figma primero (su zona de comfort) antes de construir en plataforma
  3. Eugenia apoya con la lógica de las calculadoras Outgrow
- **Owner:** Daniel + Lillian

---

## Riesgos Medios (Impacto Medio + Probabilidad Media)

### R09: Cuentas LinkedIn restringidas durante warmup
- **Impacto:** Expandi no puede enviar mensajes → canal LinkedIn se pierde
- **Probabilidad:** MEDIA (LinkedIn es agresivo con cuentas nuevas)
- **Mitigación:** Dayana usa actividad orgánica real los primeros 7 días (posts, comentarios, conexiones manuales). Expandi se configura con límites conservadores (15 conexiones/día, no 25). IP residencial obligatoria.
- **Owner:** Dayana

### R10: Twilio A2P 10DLC registro tarda semanas
- **Impacto:** SMS no disponible para la secuencia de prospección
- **Probabilidad:** MEDIA (el registro A2P puede tardar 1-4 semanas)
- **Mitigación:** Iniciar registro el Día 5 (Vie 10 Abr). Si no está listo para Sem 3, usar SimpleTexting como canal SMS temporal.
- **Owner:** Gabriel

### R11: Integración ElevenLabs → ManyChat falla
- **Impacto:** Notas de voz automáticas no funcionan → se hacen manuales
- **Probabilidad:** MEDIA (integración API custom)
- **Mitigación:** Gabriel hace la integración (sabe Python/APIs). Si falla: generar notas de voz en batch (ElevenLabs) y subirlas manualmente a ManyChat. Más lento pero funcional.
- **Owner:** Gabriel

### R12: Sync Clay → Supabase falla o se retrasa
- **Impacto:** Datos de prospectos no se respaldan en Supabase → se pierde la fuente de verdad paralela y las listas no se populan
- **Probabilidad:** MEDIA (integración nueva, Edge Function o script Python)
- **Mitigación:**
  1. Opción A (webhook) falla → cambiar a Opción C (script Python cron) — Gabriel domina Python
  2. Ambas fallan → Opción B (export CSV manual) como fallback inmediato
  3. En el peor caso, los datos están en Clay + Smartlead y se sincronizan manualmente después del sprint
- **Owner:** Gabriel + Daniel

### R12b: HubSpot Free tiene limitaciones inesperadas
- **Impacto:** Pipelines o automatizaciones limitadas
- **Probabilidad:** BAJA
- **Mitigación:** Si Free no alcanza, upgrade a Starter ($20/mes). Daniel evalúa Día 2.
- **Owner:** Daniel

---

## Riesgos de Dependencia (Controlados por otros equipos)

### R13: Equipo 4 (Contenido) no está listo para recibir entregables
- **Impacto:** Infraestructura lista pero sin contenido para cargar → herramientas ociosas
- **Probabilidad:** MEDIA
- **Mitigación:** Loom de arquitectura (DTO-OUT-09) entregado Día 9 para que Eq4 tenga contexto. Daniel verifica con líder de Eq4 semanalmente.

### R14: Equipo 2 no aprueba flujos ManyChat a tiempo
- **Impacto:** Lanzamiento de pipeline creadores se retrasa
- **Probabilidad:** BAJA-MEDIA
- **Mitigación:** Dayana envía flujos a Mery con 24h de anticipación. Si no hay respuesta en 24h, se lanza con los flujos como están + iteración posterior.

---

## Matriz Resumen

| ID | Riesgo | Probabilidad | Impacto | Prioridad | Owner |
|----|--------|-------------|---------|-----------|-------|
| R01 | Retraso warmup | Media | Crítico | 🔴 P1 | Gabriel + Daniel |
| R02 | ICP no llega | Alta | Crítico | 🔴 P1 | Eugenia + Daniel |
| R03 | Internet Gabriel | Media-Alta | Alto | 🔴 P1 | Daniel + Gabriel |
| R04 | Meta rechaza templates | Media | Alto | 🟠 P2 | Dayana |
| R05 | DNS mal config | Baja | Crítico | 🟠 P2 | Gabriel |
| R06 | Clay upgrade coordinación presupuesto | Baja | Alto | 🟡 P3 | Daniel |
| R07 | Sobrecarga Dayana | Alta | Alto | 🟠 P2 | Daniel |
| R08 | Ramp-up Lillian | Media | Medio | 🟡 P3 | Daniel + Lillian |
| R09 | LinkedIn restringido | Media | Medio | 🟡 P3 | Dayana |
| R10 | Twilio A2P lento | Media | Medio | 🟡 P3 | Gabriel |
| R11 | API ElevenLabs-ManyChat | Media | Medio | 🟡 P3 | Gabriel |
| R12 | Sync Clay → Supabase falla | Media | Alto | 🟠 P2 | Gabriel + Daniel |
| R12b | HubSpot Free limitado | Baja | Bajo | 🟢 P4 | Daniel |
| R13 | Eq4 no listo | Media | Medio | 🟡 P3 | Daniel |
| R14 | Eq2 no aprueba flujos | Baja-Media | Medio | 🟢 P4 | Dayana |
