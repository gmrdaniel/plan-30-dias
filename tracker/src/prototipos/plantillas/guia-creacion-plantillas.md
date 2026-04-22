# Guía — Creación de plantillas para Smartlead cold outreach

**Propósito:** reglas operativas para crear plantillas que (1) resuelven variables correctamente, (2) se renderizan sin whitespace raro en Gmail, (3) pasan filtros de spam, (4) se ven como email personal, no marketing.

**Basada en:** 9 iteraciones de prueba en Gmail durante 2026-04-21, con data real de render.

---

## 1. Principios de diseño

### Cold outreach NO es marketing email

| | Cold (Smartlead) | Marketing (Brevo warm) |
|---|---|---|
| Audiencia | Desconocidos, primer contacto | Opt-in, ya te conocen |
| Look objetivo | Email personal | Newsletter/campaña |
| Formato | HTML minimal o plain text | HTML rico con branding |
| Elementos visuales | 0-1 imagen (QR o logo) | Múltiples images, botones, boxes |
| Bloques coloreados | NO | Sí (payout boxes, callouts) |
| Line-height objetivo | 1.5 | 1.5-1.7 |
| Footer | Minimal compliance | Branded |

**Regla general:** si el diseño se parece a un email de marca, bajará en deliverability.

---

## 2. Variables soportadas en Smartlead

### ✅ Funcionan en producción

| Variable | Source | Ejemplo resuelto |
|---|---|---|
| `{{first_name}}` | Campo nativo Smartlead | `Daniel` / `Leslie` |
| `{{last_name}}` | Campo nativo | `Ramirez` |
| `{{email}}` | Campo nativo | `daniel@laneta.com` |
| `{{company_name}}` | Campo nativo | — |
| `{{website}}` | Campo nativo | — |
| `{{<columna_csv>}}` | Custom field (del CSV al upload) | `{{tiktok}}`, `{{follower_count}}`, `{{region}}` |

### ❌ NO funcionan (no intentar)

| Variable | Por qué no |
|---|---|
| `{{first_name\|there}}` | **Pipe fallback NO es soportado.** Devuelve vacío incluso si first_name existe |
| `{{sender_name}}` | Smartlead **NO mapea** `from_name` del inbox a esta variable. Queda literal |
| `{{contact.*}}` | Sintaxis Brevo, no Smartlead |
| `{{unsubscribe}}` | Smartlead inyecta su propio link, no usa esta variable |
| Cualquier `{{var\|fallback}}` | Mismo issue que `first_name\|there` |

### Regla de variables

**Si usas `{{X}}`, garantiza que TODOS los leads tengan X poblado antes de upload.** Si 4 leads tienen `first_name` vacío → actualízalos a "friend" u otro valor antes del envío.

```python
# Patrón recomendado al upload de leads
lead = {
    "first_name": row.get('first_name','').strip() or "friend",
    "email": row['email'],
    "custom_fields": {
        "tiktok": row.get('tiktok','').strip(),
        "follower_count": str(row.get('follower_count','')),
    }
}
```

---

## 3. Reglas técnicas de HTML

### 3.1 Estructura base obligatoria

Siempre incluir envelope completo (aunque el body sea corto):

```html
<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:600px;margin:0;padding:0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#222;line-height:1.5;">
<p style="margin:0 0 14px 0;">...</p>
</div></body></html>
```

**Por qué:**
- Sin `<!DOCTYPE>` + `<html>` + `<head>` + `<body>`, Gmail/Outlook pueden renderizar blanco o fallar.
- `body margin:0;padding:0` + `div padding:0 16px` = top tight, laterales con respiro.
- `font-family` heredado desde el `<div>` evita repetirlo en cada `<p>`.

### 3.2 Regla anti-whitespace: NO uses `\n\n` entre tags HTML en el source

```html
<!-- MAL (Gmail renderiza espacio visible extra) -->
<div>

<p>...</p>

<p>...</p>
</div>

<!-- BIEN (tight en render) -->
<div>
<p>...</p>
<p>...</p>
</div>
```

**Mecanismo:** Gmail interpreta los `\n\n` (blank lines) entre tags HTML como líneas en blanco visibles. Un solo `\n` es seguro.

### 3.3 Párrafos: `<p>` con `margin:0 0 14px 0`

```html
<p style="margin:0 0 14px 0;">Texto del párrafo.</p>
```

**Por qué 14px bottom, 0 top:** los márgenes de `<p>` se colapsan en HTML estándar pero no en Gmail. 14px bottom da separación visible; 0 top evita doble espacio.

### 3.4 Líneas dentro del mismo párrafo: `<br>` en un solo `<p>`

```html
<!-- MAL (Gmail agrega margen entre cada <p>) -->
<p style="margin:0;">TIKTOK</p>
<p style="margin:0;">$500 to $1K per million views</p>
<p style="margin:0;">Descripción...</p>

<!-- BIEN (lineas juntas, un solo espacio after) -->
<p style="margin:0 0 14px 0;">TIKTOK<br>$500 to $1K per million views<br>Descripción...</p>
```

### 3.5 Bullets: usar `<ul><li>`

```html
<ul style="margin:0 0 14px 20px;padding:0;font-family:Arial;font-size:15px;color:#222;line-height:1.5;">
<li style="margin:0 0 4px 0;">No new filming</li>
<li style="margin:0 0 4px 0;">No new editing workflow</li>
</ul>
```

**No uses `- texto`** en plain text dentro de `<p>` — Gmail no convierte a lista, queda texto plano.

### 3.6 Imágenes: QR o similar

```html
<div style="text-align:center;margin:10px 0 14px 0;">
<a href="https://3c7t6.app.link/xxx" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:inline-block;line-height:0;font-size:0;">
<img src="https://.../qr.png" alt="Scan to apply" width="140" style="display:block;border:0;width:140px;height:auto;margin:0 auto;">
</a>
<p style="margin:6px 0 0 0;font-size:12px;color:#64748b;">Scan from your phone</p>
</div>
```

**Rules:**
- Envolver `<img>` en `<a>` para que desktop también haga click
- `display:block` + `margin:0 auto` para centrar
- `line-height:0;font-size:0` en el `<a>` para evitar espacio fantasma
- `width` atributo HTML + `style width` — doble garantía
- `alt` text corto + descriptivo (fallback si imagen no carga)

### 3.7 Botones (opcional, para Step 1 con CTA fuerte)

```html
<div style="text-align:center;margin:6px 0 10px 0;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto;">
<tr><td align="center" bgcolor="#4F46E5" style="background-color:#4F46E5;border-radius:6px;">
<a href="https://..." target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;font-family:Arial;font-size:14px;font-weight:700;color:#ffffff !important;text-decoration:none;line-height:1;"><font color="#ffffff">Apply to Fast Track Now &rarr;</font></a>
</td></tr>
</table>
</div>
```

**Triple fallback de color blanco:** `color:#ffffff !important` + `<font color="#ffffff">`. Gmail a veces strippea `color:#ffffff` en el `<a>`.

### 3.8 Footer compliance mínimo

```html
<p style="margin:18px 0 4px 0;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;line-height:1.5;">
<strong style="color:#64748b;">ELEVN | Powered by La Neta | Meta Official Partner</strong><br>
174 Nassau St. Ste 341 Princeton NJ 08542 United States<br>
You received this email because your public creator profile meets the eligibility criteria for the Meta Creator Fast Track program.
</p>
<p style="margin:0;font-size:11px;"><a href="https://.../terms" style="color:#4F46E5;text-decoration:underline;">Terms and Conditions</a></p>
```

**Requerido por CAN-SPAM:** dirección física real + clear identification + no afirmaciones engañosas.

**NO incluir unsubscribe manual:** Smartlead lo inyecta automáticamente al final. Si lo agregas tú, aparece doble.

---

## 4. Anti-patterns (qué NO hacer)

### 4.1 Marketing email HTML

| Anti-pattern | Por qué evitar |
|---|---|
| Tablas multi-column con bordes redondeados | Señal Gmail Tabbed Inbox → Promotions |
| Colores brand distintos (3+) | Marketing signal |
| Letter-spacing uppercase headers | Marketing signal |
| Imágenes > 200×200 | Marketing signal |
| Botones con gradientes o shadows | Marketing signal |
| Ratio texto/HTML < 40% | Spam signal |

### 4.2 Variables y merge

| Anti-pattern | Por qué |
|---|---|
| `{{first_name\|fallback}}` | No funciona, queda vacío |
| `{{contact.NOMBRE}}` | Sintaxis Brevo, no Smartlead |
| Usar variables que no están en el CSV | Queda literal `{{var}}` en el email |
| `{{sender_name}}` esperando que resuelva | Smartlead no lo mapea |

### 4.3 Deliverability

| Anti-pattern | Por qué |
|---|---|
| "Meta Official Partner" repetido 2+ veces | Trigger phrase |
| "100%", "$3K-$9K" mencionado 5+ veces | Trigger phrase |
| `display:none` para keyword stuffing | Flag directo |
| `data-gr-*` de Grammarly en el source | Flag de editor no-profesional |
| Subject en ALL CAPS | Spam signal |
| Subject con muchos `!` o `$$$` | Spam signal |

### 4.4 Estructura

| Anti-pattern | Por qué |
|---|---|
| Múltiples `<p>` para líneas consecutivas del mismo bloque | Gmail agrega márgenes |
| `\n\n` entre tags en el source HTML | Whitespace visible |
| Wrapping en `<div>` sin envelope `<html><body>` | Puede renderizar blanco |
| QR sin `<a href>` alrededor | Desktop no puede clickear |

---

## 5. Workflow de creación

### Paso 1 — Plain text authorized

Guardar en `templates/AUTHORIZED_<nombre>.txt` el copy tal cual lo aprobó el equipo de contenido. **No editar este archivo — es la source of truth.**

### Paso 2 — Fixes para Smartlead

Aplicar al copy authorized:
```python
text = text.replace("{{max_followers}}", "{{follower_count}}")  # match CSV column
text = text.replace("{{username}}", "{{tiktok}}")               # match CSV column
text = text.replace("{{main_platforme}}", "TikTok")             # hardcode (not a field)
text = text.replace("{{vertical}} ", "")                        # remove (not a field)
text = text.replace("https://www.facebook.com/...", branch_link) # Branch tracking
text = text.replace("Unsubscribe: {{unsubscribe}}\n", "")       # Smartlead auto-inject
```

### Paso 3 — Conversión a HTML minimal

Usar el patrón:
1. Envelope completo (doctype + html + head + body)
2. `<div>` wrapper con font-family, font-size, color, line-height
3. Cada párrafo en su propio `<p>` con `margin:0 0 14px 0`
4. Líneas dentro de párrafo con `<br>`
5. Bullets con `<ul><li>`
6. QR al final o cerca de CTA
7. Footer compliance

### Paso 4 — Validación sin enviar

Antes de subir a Smartlead:

- [ ] Abrir `.html` en navegador y verificar look
- [ ] Buscar `\n\n` en el source → colapsar a `\n` si existe
- [ ] Buscar `{{` restantes → listar variables y verificar que el CSV las tenga
- [ ] Medir ratio texto/HTML → idealmente > 40%
- [ ] Verificar links: Branch real (no viejos Brevo)
- [ ] Subject: < 60 chars, sin triggers de spam

### Paso 5 — Upload + test

```python
# Upload
POST /api/v1/campaigns/{id}/sequences
  body: {"sequences": [{"seq_number":N, "subject":"...", "email_body": html}]}

# Verify hash matches disk
GET /api/v1/campaigns/{id}/sequences
```

Send Test a cuenta propia (Gmail + Outlook ideal) y validar:
- Variables resuelven (no literal `{{X}}`)
- Placement (Primary / Promotions / Spam)
- Render sin whitespace raro
- QR escanea correctamente
- Links Branch registran clicks en dashboard

### Paso 6 — Backup defensivo

Si sequences desaparecen de Smartlead (ha pasado 3+ veces), tienes el source en disco. Re-upload toma 10 segundos.

```python
# Backup pre-change
current = GET /campaigns/{id}/sequences
json.dump(current, open(f"plan-b/_backup_{date}.json", 'w'))
```

---

## 6. Checklist pre-activation

Antes de activar la campaña en Smartlead UI:

- [ ] Sequences (N) cargadas y verificadas via API
- [ ] Email accounts (M) asignados
- [ ] Leads subidos, count correcto
- [ ] Track settings: open=OFF, click=ON
- [ ] Schedule configurado (timezone + horario + días)
- [ ] Stop on reply activado
- [ ] Test send a inbox propia → render OK en Gmail + Outlook
- [ ] Variables resuelven (Send Test, no Preview)
- [ ] Branch links registran clicks en dashboard (test clic propio)
- [ ] QR escanea al link correcto (test con tu teléfono)
- [ ] Placement check: Primary / Promotions / Spam
- [ ] Si HTML cae en Promotions consistentemente → considerar switch a plain text o v9 pure-text+QR

---

## 7. Referencias a archivos de ejemplo (producción 2026-04-21)

| Archivo | Descripción | Uso |
|---|---|---|
| `AUTHORIZED_intro_fast_track.txt` | Source of truth Step 1 (Ana) | Reference |
| `AUTHORIZED_friction_removal.txt` | Source of truth Step 2 (Ana) | Reference |
| `AUTHORIZED_social_proof.txt` | Source of truth Step 3 (Ana) | Reference |
| `smartlead_step1_minimal-html_v6-tight.html` | Step 1 producción | Template activo Smartlead 3212141 |
| `smartlead_step2_minimal-html_v6-tight.html` | Step 2 producción | Template activo Smartlead 3212141 |
| `smartlead_step3_pure-text-qr_v9.html` | Step 3 producción (pure text + QR) | Template activo Smartlead 3212141 |
| `razones-html-vs-plain-cold.md` | Análisis técnico formato | Iteración con equipo contenido |

---

## 8. Checklist rápido para plantillas futuras

Para acelerar la creación de una plantilla nueva:

1. **Copy authorized** en `AUTHORIZED_<name>.txt` (cero edición técnica)
2. **Fixes automáticos** (`main_platforme` → "TikTok", etc.)
3. **HTML minimal** con el patrón del §3
4. **NO `\n\n`** entre tags
5. **Variables solo las que existen** en CSV
6. **QR como único visual** (si aplica)
7. **Subject < 60 chars** sin triggers
8. **Upload via API** + backup pre-change
9. **Send Test** para validar merge + placement
10. **Activate** solo si test 100% OK

---

*Documento generado 2026-04-21 tras 9 iteraciones de plantillas en Gmail real. Actualizar si Smartlead lanza variables nativas nuevas o si Gmail cambia reglas de rendering.*
