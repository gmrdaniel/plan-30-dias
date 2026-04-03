# T06 — Datos de prueba para validar el pipeline

> **Objetivo:** Que Gabriel pueda validar cada paso del flujo (import → enriquecer → Smartlead → tracking) con datos reales.
> **Fuente:** CSVs de Pepe (60 empresas, 867 empleados reales)
> **Selección:** 10 empresas representativas con empleados que tienen email + LinkedIn

---

## 1. CSV de entrada — Datos crudos (lo que se importa al CRM)

Estos son los datos **tal como salen de SmartScout/Apify**. No tienen email del decisor, no tienen LinkedIn del contacto clave, no tienen ICP score. Eso es lo que Clay debe enriquecer.

### Archivo: `test-import-b2b-10.csv`

```csv
company_name,industry,category,country,city,estimated_revenue,website,employees,classification,instagram,tiktok,linkedin,amazon_url
Good Molecules,Health & Wellness,acne consumer goods,US,Philadelphia,707321,goodmolecules.com,130,Lead B,instagram.com/goodmolecules,,,amazon.com/dp/B01MT6RJRU
Black Girl Sunscreen,Health & Wellness,personal care,US,Los Angeles,354995,blackgirlsunscreen.com,28,Lead B,instagram.com/blackgirlsunscreen,tiktok.com/@blackgirlsunscreen,linkedin.com/company/blackgirlsunscreen,amazon.com/dp/B0CV9R8DTK
ArtNaturals,Health & Wellness,hair care essential oils,US,Gardena CA,308943,artnaturals.com,36,Lead B,instagram.com/artnaturals,tiktok.com/@artnaturals,,amazon.com/dp/B012Q4M3DO
Wavytalk,Health & Wellness,hair styling tools,US,New York,0,wavytalk.com,47,Lead B,instagram.com/wavytalkofficial,tiktok.com/@wavytalk,,
SONGMICS HOME,Manufacturing,Furniture & Home,CA,Rancho Cucamonga CA,22500000,songmicshome.com,220,Lead A,instagram.com/songmicshome,tiktok.com/@songmicshome,linkedin.com/company/songmicshome,
MakarttPro,Industrial Engineering,nail art supplies,US,Dallas TX,157999,makarttpro.com,19,Lead B,instagram.com/makarttpro,tiktok.com/@makarttpro,,amazon.com/dp/B0BK7Z259G
Moérie Beauty,Health & Wellness,Cosmetics,US,Newark DE,98938,moerie.com,30,Lead B,instagram.com/moeriebeauty,tiktok.com/@moeriebeauty,,amazon.com/dp/B07WLKV8MJ
L'ange Hair,Health & Wellness,hair care styling,US,Chatsworth CA,0,langehair.com,33,Lead B,,,,
Three Ships,Consumer Goods,clean beauty,CA,Toronto ON,0,threeshipsbeauty.com,32,Lead A,,,,
Sorella Apothecary,Health & Wellness,skincare spa,US,Reno NV,0,sorellaapothecary.com,18,Lead A,,,,
```

**Instrucciones para Gabriel:**
1. Guardar como `test-import-b2b-10.csv`
2. Ir a `/admin/leads/import` en el CRM
3. Seleccionar pipeline: **B2B**
4. Seleccionar fuente: **SmartScout**
5. Subir CSV → mapear columnas → importar

---

## 2. Resultado esperado después de enriquecimiento (Clay)

Estos son los datos que Clay **debe devolver** después de la cascade. Tomados del CSV real de empleados de Pepe — son los contactos clave de cada empresa.

Gabriel usa esta tabla para comparar: "¿Clay encontró este contacto o uno similar?"

### Contacto principal esperado por empresa

**Good Molecules:**
- Contacto: Ava Infante
- Cargo: Digital Marketing Specialist
- Email: ava.infante@goodmolecules.com
- LinkedIn: linkedin.com/in/ava-infante-517456332
- Teléfono: +1 2134-444-663
- ICP Score esperado: 7-8 (buen revenue, health & wellness, sin video ads)

**Black Girl Sunscreen:**
- Contacto: Kimberly Nieves
- Cargo: Director of Marketing
- Email: kimberly@blackgirlsunscreen.com
- LinkedIn: linkedin.com/in/kimberlyjnieves
- Teléfono: +1 (833) 247-4968
- ICP Score esperado: 7-8 (revenue sólido, tiene TikTok activo)

**ArtNaturals:**
- Contacto: (Clay debe encontrar — no hay empleado con email en datos de Pepe)
- Email empresa: info@artnaturals.com
- LinkedIn empresa: —
- ICP Score esperado: 7 (revenue bueno, TikTok fuerte con 446K followers)

**Wavytalk:**
- Contacto: Hayes Nabozny
- Cargo: Head of Sales / Growth Strategy Executive
- Email: hayesn@wavytalk.com
- LinkedIn: linkedin.com/in/hayes-nabozny-6534488
- Alternativo: Jeremy Huang (Brand Marketing Manager) — jeremy.huang@wavytalk.com
- ICP Score esperado: 6-7

**SONGMICS HOME:**
- Contacto: Becky Xiong
- Cargo: Sales Manager
- Email: becky.xiong@songmicshome.com
- LinkedIn: linkedin.com/in/becky-xiong-95780195
- Alternativo: Chantal Li (Head of Social Media and Influencer Relations) — sin email pero LinkedIn activo
- ICP Score esperado: 8-9 (revenue alto $20-25M, 220 empleados)

**MakarttPro:**
- Contacto: Pamela Pan
- Cargo: Owner
- Email: pamela.pan@makartt.com
- LinkedIn: linkedin.com/in/pamela-pan-0aba6a368
- Alternativo: Kathleen Macadat (Digital Marketing Specialist) — kathleen.macadat@makarttpro.com
- ICP Score esperado: 6 (revenue modesto, nicho específico)

**Moérie Beauty:**
- Contacto: Kristupas Sakalius
- Cargo: Marketing Project Manager
- Email: kristupas@moerie.com
- LinkedIn: linkedin.com/in/kristupassakalius
- Alternativo: Emilis Monstavicius (Co-Owner) — emilis@moerie.com
- ICP Score esperado: 5-6 (revenue bajo, pero health & wellness)

**L'ange Hair:**
- Contacto: Dalia Lange Hadari
- Cargo: Co-Founder / Vice President
- Email: dalia.hadari@langehair.com
- LinkedIn: linkedin.com/in/dalia-lange-hadari-b1680896
- ICP Score esperado: 6-7

**Three Ships:**
- Contacto: Tierney Sterling
- Cargo: Ecommerce Marketing Manager
- Email: tierney@threeshipsbeauty.com
- LinkedIn: linkedin.com/in/tierney-sterling-6230b4160
- ICP Score esperado: 6 (Canadá, clean beauty)

**Sorella Apothecary:**
- Contacto: Monica George
- Cargo: Creative Storyteller / Brand Architect / Growth Catalyst
- Email: monica.george@sorellaapothecary.com
- LinkedIn: linkedin.com/in/monicajcgeorge
- ICP Score esperado: 5 (empresa pequeña, nicho spa)

---

## 3. Datos de redes sociales (para validación cruzada)

Datos del CSV de estadísticas de Pepe. Gabriel puede usar esto para verificar que los datos del CRM coinciden.

| Empresa | Plataforma | Followers | Posts | Engagement Rate |
|---|---|---|---|---|
| Good Molecules | Instagram | 774,848 | 2,207 | 0.06% |
| Black Girl Sunscreen | Instagram | 203,491 | 82 | 0.62% |
| Black Girl Sunscreen | TikTok | 29,700 | 87 | 55.15% |
| ArtNaturals | Instagram | 59,726 | 1,502 | 0.12% |
| ArtNaturals | TikTok | 446,500 | 653 | 5153.80% |
| Moérie Beauty | Instagram | 2,729 | 367 | 1.69% |
| MakarttPro | Instagram | 56,662 | 783 | 0.08% |
| MakarttPro | TikTok | 77,100 | 1,156 | 0.52% |

---

## 4. Datos de competidores (para validación cruzada)

| Empresa | Competidor | Razón | Plataforma fuerte competidor |
|---|---|---|---|
| Good Molecules | CeraVe | Skincare accesible | Instagram / YouTube |
| Good Molecules | The Inkey List | Transparencia | TikTok |
| Black Girl Sunscreen | Supergoop! | Protección solar moderna | Instagram |
| Black Girl Sunscreen | Sun Bum | SPF lifestyle joven | TikTok |
| ArtNaturals | The Ordinary | Ingredientes activos | Instagram |
| Moérie Beauty | Vegamour | Hair growth + wellness | Instagram / TikTok |

---

## 5. Checklist de validación (asserts)

Gabriel ejecuta estos 15 checks en orden. Si uno falla, resolver antes de continuar.

### Paso ① Import

| # | Assert | Qué verificar | Pass si |
|---|---|---|---|
| CP01 | Import funciona | 10 empresas en client_inventory | count = 10 |
| CP02 | Contactos creados | client_contacts tiene registros vinculados | count >= 10 |
| CP03 | Pipeline type | Todas marcadas como pipeline_type = 'b2b' | 10/10 |
| CP04 | Lead source | Todas con lead_source = 'outbound_research' | 10/10 |
| CP05 | Dedup funciona | Re-importar mismo CSV, count sigue = 10 | no duplicados |

### Paso ② Enriquecimiento

| # | Assert | Qué verificar | Pass si |
|---|---|---|---|
| CP06 | Clay recibió filas | Tabla Clay tiene 10 rows nuevas | count = 10 |
| CP07 | Email encontrado | client_contacts.email tiene valor | >= 8/10 (80%) |
| CP08 | Email válido | email_valid = true de los encontrados | >= 75% |
| CP09 | LinkedIn encontrado | client_contacts.linkedin_url tiene valor | >= 7/10 (70%) |
| CP10 | ICP Score generado | client_inventory.icp_score tiene valor | 10/10 (100%) |
| CP11 | Créditos medidos | Anotar en spreadsheet: créditos antes y después | registrado |

### Paso ③ Smartlead

| # | Assert | Qué verificar | Pass si |
|---|---|---|---|
| CP12 | Push a Smartlead | Contactos con email válido en campaña Smartlead | count > 0 |
| CP13 | Outreach log | client_outreach_log tiene registros type='cold_email' | count = pushed |
| CP14 | Status actualizado | client_inventory.status = 'contacted' para los enviados | correcto |

### Paso ④ Tracking (simular webhook)

| # | Assert | Qué verificar | Pass si |
|---|---|---|---|
| CP15 | Webhook funciona | Enviar POST manual a smartlead-webhook con evento EMAIL_OPENED, verificar que client_outreach_log se actualiza | status = 'opened' |

---

## 6. Cómo simular el webhook de Smartlead (CP15)

Gabriel puede probar el webhook sin esperar a que Smartlead envíe eventos reales:

```bash
curl -X POST https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/smartlead-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "EMAIL_OPENED",
    "lead_email": "ava.infante@goodmolecules.com",
    "campaign_id": "test_campaign",
    "campaign_name": "Test Sprint B2B",
    "timestamp": "2026-04-10T10:30:00Z",
    "sequence_number": 1,
    "custom_fields": {
      "crm_inventory_id": "UUID_DE_GOOD_MOLECULES",
      "crm_contact_id": "UUID_DE_AVA_INFANTE"
    }
  }'
```

Reemplazar los UUIDs con los reales del CRM después del import.

Luego simular un reply:

```bash
curl -X POST https://nvbanvwibmghxroybjxp.supabase.co/functions/v1/smartlead-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "EMAIL_REPLIED",
    "lead_email": "ava.infante@goodmolecules.com",
    "campaign_id": "test_campaign",
    "campaign_name": "Test Sprint B2B",
    "timestamp": "2026-04-10T14:00:00Z",
    "sequence_number": 1
  }'
```

**Verificar en el CRM:**
- client_outreach_log: status = 'replied', replied_at tiene valor
- client_inventory: status = 'interested'
- Si sync-to-hubspot está activo: contacto debe aparecer en HubSpot

---

## 7. Spreadsheet de tracking de créditos Clay

Gabriel debe mantener este registro para cada batch:

| Batch | Fecha | Prospectos | Créditos inicio | Créditos fin | Créditos/prospecto | Email fill | LinkedIn fill | Smartlead pushed |
|---|---|---|---|---|---|---|---|---|
| Test 10 | 8 Abr | 10 | — | — | — | /10 | /10 | /10 |
| Batch 200 | 9 Abr | 200 | — | — | — | /200 | /200 | /200 |
| Batch 500 | 11 Abr | 500 | — | — | — | /500 | /500 | /500 |

**Alerta:** Si créditos/prospecto > 4, notificar a Daniel inmediatamente para evaluar upgrade de Clay.
