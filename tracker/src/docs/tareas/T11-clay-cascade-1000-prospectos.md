# T11 — Clay Cascade: 1,000 Prospectos Enriquecidos

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T11 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Gabriel Piñero |
| **Fecha Inicio** | Miércoles 8 Abril (continúa desde T06) |
| **Fecha Entrega** | Martes 14 Abril |
| **Bloqueada por** | T04 (ICP), T06 (Clay configurado) |
| **Bloquea a** | DTO-OUT-03 (prospectos → Eq4), T14 (testing E2E) |

## Objetivo
1,000 prospectos B2B completamente enriquecidos, calificados y listos para ser cargados en Smartlead y Expandi.

## Detalle de Implementación

### Día 3-4 (8-9 Abr): Alimentar Clay con datos fuente
1. SmartScout: Exportar 500+ vendedores Amazon matching ICP
2. Apify: Exportar 300+ marcas de Meta Ads Library + 200+ tiendas Shopify
3. Importar todo a Clay
4. Deduplicar por dominio/empresa

### Día 4-5 (9-10 Abr): Ejecutar cascada de enriquecimiento
1. Ejecutar cascada en batches de 200:
   - Batch 1: 200 prospectos → verificar calidad → ajustar si necesario
   - Batch 2: 200 prospectos
   - Batch 3: 200 prospectos
   - Batch 4: 200 prospectos
   - Batch 5: 200 prospectos
2. Monitorear créditos de Clay — si se agotan, notificar a Daniel

### Día 6 (13 Abr): Calificación y limpieza
1. Revisar resultados de enriquecimiento:
   - ¿Cuántos tienen email verificado? (target: >800)
   - ¿Cuántos tienen LinkedIn? (target: >700)
   - ¿Cuántos tienen score >= 6? (target: >500)
2. Limpiar registros incompletos
3. Validar emails con Bouncer/ZeroBounce si no lo hace Clay automáticamente

### Día 7 (14 Abr): DEADLINE — Entrega final
1. Export CSV final con 1,000 prospectos limpios
2. Push automático a Smartlead (prospectos con email)
3. Push automático a Expandi (prospectos con LinkedIn)
4. Verificar que los datos llegaron correctamente a ambas herramientas
5. Compartir CSV backup en Google Drive

## Campos Requeridos por Prospecto

| Campo | Fuente | Obligatorio |
|-------|--------|-------------|
| email_verificado | Prospeo → Findymail → Hunter (cascade) | SI |
| nombre_completo | Clay AI enrichment | SI |
| empresa | SmartScout / Apify | SI |
| titulo_cargo | LinkedIn Sales Nav | SI |
| linkedin_url | LinkedIn Sales Nav | SI |
| industria | Clay AI classification | SI |
| ingresos_estimados | SmartScout | SI |
| video_gap_score | SmartScout (tiene video? calidad?) | SI |
| icp_score | Clay AI scoring | SI |
| pais | Clay enrichment | SI |
| telefono | Apollo / Clay enrichment | NO (nice to have) |
| sitio_web | Apify / SmartScout | NO |

## Entregables
- [ ] 1,000 prospectos en Clay con todos los campos obligatorios
- [ ] Tasa de campos completos >80%
- [ ] Email bounce rate estimado <5%
- [ ] Prospectos pushed a Smartlead exitosamente
- [ ] Prospectos pushed a Expandi exitosamente
- [ ] CSV backup en Google Drive compartido
- [ ] Reporte de calidad: # total, # con email, # con LinkedIn, # con score >= 6

## Criterios de Aceptación
- [ ] Mínimo 800/1000 prospectos con email verificado
- [ ] Mínimo 700/1000 con LinkedIn URL
- [ ] Mínimo 500/1000 con icp_score >= 6
- [ ] 0 duplicados por empresa/email
- [ ] Push a Smartlead verificado (prospectos aparecen en la herramienta)
- [ ] Push a Expandi verificado

## Costo
| Item | Costo adicional |
|------|----------------|
| Créditos Clay | Incluido en plan (verificar) |
| Validación email (Bouncer) | ~$8-18 por batch si necesario |

---

## SUBTAREA T11-B: Sync Clay → Supabase

**Responsable:** Gabriel Piñero (implementa) + Daniel (apoyo Supabase si necesario)
**Fecha:** Viernes 17 Abril (Día 10) — después de completar cascada y antes de testing E2E
**Objetivo:** Persistir los 1,000 prospectos enriquecidos de Clay en Supabase (`client_inventory` + `client_contacts` + `client_contact_lists`) como respaldo y fuente de verdad paralela.

### Tres opciones de implementación

| | Opción A (Recomendada) | Opción B | Opción C |
|---|---|---|---|
| **Mecanismo** | Clay Webhook → Supabase Edge Function | Export CSV periódico → Script Python import | Clay API → Script Python (cron cada X horas) |
| **Tiempo implementación** | 2-3 días | 1 día | 2 días |
| **Complejidad** | Media-Alta | Baja | Media |
| **Mantenimiento** | Bajo (automático) | Alto (manual cada vez) | Medio (cron automático) |
| **Escalabilidad Mes 2** | Excelente (ya es real-time) | Pobre (manual no escala) | Buena (automatizado) |
| **Requiere** | Edge Function en Supabase (JS/TS) | Python + supabase-py | Python + Clay API + supabase-py + cron |

### Opción A — Recomendada: Clay Webhook → Edge Function

**Cómo funciona:**
1. Clay tiene webhooks nativos. Se configura un webhook que dispara cada vez que un prospecto se enriquece o actualiza.
2. El webhook envía un POST a una Supabase Edge Function (JavaScript/TypeScript).
3. La Edge Function:
   - Parsea el payload JSON de Clay
   - Hace upsert en `client_inventory` (match por `website_url` o `name` para evitar duplicados)
   - Crea/actualiza registro en `client_contacts` (vinculado a la empresa)
   - Agrega a `client_contact_lists` → lista "Sprint-Abr-B2B-1000"
4. **Ventaja:** Una vez configurado, cada nuevo prospecto fluye automáticamente. Ideal para Mes 2 (2,500+).

**Pasos de implementación:**
1. Crear Edge Function en Supabase: `sync-clay-prospects`
2. Configurar autenticación (API key en header)
3. Implementar lógica de upsert con mapping (ver abajo)
4. Configurar webhook en Clay apuntando a la Edge Function
5. Probar con 10 prospectos
6. Ejecutar para los 1,000

### Opción C — Alternativa viable: Clay API → Script Python (cron)

**Cómo funciona:**
1. Script Python que usa Clay API para extraer prospectos enriquecidos
2. Usa `supabase-py` para insertar/actualizar registros
3. Se ejecuta como cron job cada 4-6 horas (o manualmente cuando se necesite)
4. **Ventaja:** Más control sobre el mapping, más fácil de debuggear, Gabriel domina Python.

**Pasos de implementación:**
1. Crear script `sync_clay_to_supabase.py`
2. Usar Clay API key existente: `00a5bb13f996417927a0`
3. Conectar con Supabase client library
4. Implementar mapping + dedup por website_url
5. Configurar cron (cada 4h) o ejecutar manualmente tras cada batch

### Mapping Clay → Supabase

```
// Clay → client_inventory
{
  empresa                → client_inventory.name
  sitio_web              → client_inventory.website_url
  industria              → client_inventory.industry
  ingresos_estimados     → client_inventory.estimated_marketplace_revenue
  icp_score              → client_inventory.qualification_score
  video_gap_score        → client_inventory.qualification_criteria (JSONB: {"video_gap": X, "source": "smartscout"})
  pais                   → client_inventory.country
  classification         → client_inventory.classification
  lead_source            → client_inventory.lead_source = 'cold_email'
  status                 → client_inventory.status = 'lead'
  priority               → client_inventory.priority (derivar: score>=8 → 'high', 6-7 → 'medium', <6 → 'low')
  created_by             → UUID del usuario de sistema/import
}

// Clay → client_contacts (1 contacto principal por empresa)
{
  nombre                 → client_contacts.first_name
  apellido               → client_contacts.last_name
  email_verificado       → client_contacts.email + email_valid = true
  titulo_cargo           → client_contacts.job_title
  role_type              → client_contacts.role_type (derivar de titulo: "CMO" → 'cmo', "VP Marketing" → 'marketing_director')
  linkedin_url           → client_contacts.linkedin_url
  telefono               → client_contacts.phone
  is_primary_contact     → true
  is_decision_maker      → true (si título = VP/CMO/Head/Director)
  status                 → 'active'
  preferred_contact_channel → 'email'
}

// Agrupación
{
  lista                  → client_contact_lists: crear "Sprint-Abr-B2B-1000"
  item                   → client_contact_list_items: vincular contacto a lista
}
```

### Lógica de dedup
- Match por `website_url` en `client_inventory` (upsert: si existe, actualiza; si no, crea)
- Match por `email` en `client_contacts` (upsert)
- Si hay conflicto de datos, Clay (más reciente) gana sobre datos existentes

### Entregables T11-B
- [ ] Sync implementado (Opción A o C)
- [ ] 1,000 prospectos visibles en `client_inventory` en Supabase
- [ ] Contactos vinculados en `client_contacts`
- [ ] Lista "Sprint-Abr-B2B-1000" creada con los 1,000 contactos
- [ ] Documentación del mapping y proceso de sync

### Criterios de Aceptación T11-B
- [ ] Datos en Supabase coinciden con datos en Clay (spot check 20 registros)
- [ ] 0 duplicados en `client_inventory` por website_url
- [ ] `qualification_score` y `qualification_criteria` correctamente populados
- [ ] Lista creada y accesible desde el CRM Laneta

---

## Notas para Gabriel
- Corre la cascada en batches de 200 para detectar problemas temprano. No lances los 1,000 de golpe.
- Si un proveedor de email de la cascada falla mucho, agrega otro (ej: Apollo.io contacts).
- Guarda el template de la cascada — se reutiliza en Mes 2 para 2,500+.
- Si los créditos de Clay se agotan antes de terminar: notifica a Daniel INMEDIATAMENTE para upgrade.
- Los prospectos con score < 6 no se descartan — van a lista "Nurture" en HubSpot.
- **Para el sync a Supabase:** si usas Opción A, la Edge Function es TypeScript — Daniel puede apoyar con la parte de Supabase. Si prefieres Opción C (Python), tienes control total. Decide con Daniel cuál se siente más cómodo.
