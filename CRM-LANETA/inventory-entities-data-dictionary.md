# Diccionario de Datos: Entidades de Inventario

> **Objetivo:** Tener visibilidad completa de todos los atributos que persisten para las entidades
> Creator, Client y Contact, junto con sus tablas satelite. Sirve como referencia para detectar
> campos faltantes, redundancias o mejoras necesarias.
>
> **Fecha:** 2026-03-30 (actualizado)
> **Estado:** Actualizado con campos de enrichment IG/TT y Brevo sync

---

## Tabla de contenidos

1. [Creator Inventory (Creador)](#1-creator_inventory)
2. [Creator Social Profiles](#2-creator_social_profiles)
3. [Client Inventory (Marca/Empresa)](#3-client_inventory)
4. [Client Contacts (Personas de la marca)](#4-client_contacts)
5. [Client Outreach Log](#5-client_outreach_log)
6. [Client Competitors](#6-client_competitors)
7. [Client Products](#7-client_products)
8. [Marketplaces](#8-marketplaces)
9. [Company Marketplaces](#9-company_marketplaces)
10. [Product Marketplace Listings](#10-product_marketplace_listings)
11. [Tablas de agrupacion (Listas)](#11-tablas-de-agrupacion)
12. [Tablas Brevo Email Tracking](#12-tablas-brevo)
13. [Tablas de Enrichment](#13-tablas-de-enrichment)
14. [Datos descubiertos por Enrichment](#14-datos-descubiertos-por-enrichment)
15. [Relaciones entre entidades](#relaciones-entre-entidades)
16. [Campos candidatos a revisar](#campos-candidatos-a-revisar)

---

## 1. `creator_inventory`

> Perfil maestro del creador. Existe antes de que el creador se registre como usuario.

### Identificacion personal

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | Identificador unico | Sistema |
| `first_name` | TEXT | SI | — | Nombre | CSV / Manual / Enrichment |
| `last_name` | TEXT | — | — | Apellido | CSV / Manual / Enrichment |
| `email` | TEXT | SI | — | Correo electronico principal (indexado) | CSV / Manual |
| `secondary_email` | TEXT | — | — | Email descubierto por enrichment (IG/TT) | Enrichment IG |
| `phone_country_code` | TEXT | — | — | Codigo de pais (+52, +1, etc.) | CSV / Manual |
| `phone` | TEXT | — | — | Numero de telefono | CSV / Manual |
| `gender` | TEXT | — | — | Genero | CSV / Manual |
| `birthdate` | DATE | — | — | Fecha de nacimiento | CSV / Manual |
| `language` | TEXT | — | `'en'` | Idioma preferido | CSV / Auto-detectado por pais |

### Ubicacion

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `country` | TEXT | — | — | Pais (indexado) | CSV / Enrichment IG |
| `city` | TEXT | — | — | Ciudad | CSV / Manual |
| `timezone` | TEXT | — | — | Zona horaria | CSV / Manual |

### Perfil profesional

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `bio` | TEXT | — | — | Biografia / descripcion | CSV / Enrichment IG/TT |
| `website_url` | TEXT | — | — | Sitio web personal | CSV / Enrichment TT |
| `categories` | TEXT[] | — | — | Categorias/nichos del creador | CSV / Enrichment IG |
| `notes` | TEXT | — | — | Notas internas | Manual |

### Estado y ciclo de vida

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `status` | TEXT | SI | `'inventory'` | `inventory` / `user` / `pending_registration` | Sistema |
| `is_profile_complete` | BOOLEAN | SI | `true` | Perfil tiene datos minimos completos | Sistema |
| `user_id` | UUID UNIQUE | — | — | FK → `users(id)` — cuando se registra | Sistema |
| `created_by` | UUID | — | — | FK → `users(id)` — quien lo creo | Sistema |
| `is_blocked` | BOOLEAN | SI | `false` | Bloqueado del sistema | Manual / Brevo auto-block |
| `blocked_at` | TIMESTAMPTZ | — | — | Fecha de bloqueo | Sistema |
| `blocked_reason` | TEXT | — | — | Motivo del bloqueo (brevo_spam, brevo_unsubscribed, manual) | Sistema |

### Enrichment / Validacion

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `email_validated` | BOOLEAN | — | — | Se ejecuto validacion de email | Enrichment |
| `email_valid` | BOOLEAN | — | — | Resultado: email valido o no | Enrichment |
| `hunter_status` | TEXT | — | — | Estado devuelto por Hunter.io | Enrichment |
| `name_validated` | BOOLEAN | — | — | Nombre normalizado a proper case | Enrichment |
| `email_engage_score` | NUMERIC | — | — | Score de engagement de email | Enrichment |
| `has_facebook` | BOOLEAN | — | — | Tiene perfil de Facebook | Enrichment |
| `fb_page_url` | TEXT | — | — | URL de pagina de Facebook | Enrichment |

### Brevo Integration

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `brevo_contact_id` | BIGINT | — | — | ID del contacto en Brevo | Brevo sync |
| `brevo_synced_at` | TIMESTAMPTZ | — | — | Ultima sincronizacion con Brevo | Brevo sync |

### Timestamps

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | Fecha de creacion |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-actualizado por trigger |

---

## 2. `creator_social_profiles`

> Perfiles de redes sociales del creador. Uno por plataforma (UNIQUE creator_id + platform). Solo uno puede ser `main_social_media`.

### Identificacion del perfil

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | | Sistema |
| `creator_id` | UUID FK | SI | — | → `creator_inventory(id)` CASCADE | Sistema |
| `platform` | ENUM | SI | — | `instagram`, `tiktok`, `youtube`, `x`, `twitch`, `pinterest`, `blog`, `facebook`, `snapchat`, `threads` | CSV / Manual |
| `platform_id` | UUID FK | — | — | → `platforms(id)` — referencia al catalogo | Sistema |
| `username` | TEXT | SI | — | Handle sin `@` | CSV / Manual |
| `main_social_media` | BOOLEAN | — | `false` | UNIQUE constraint: solo 1 por creador | Manual |

### Identificadores externos

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `external_account_id` | TEXT | — | — | ID numerico en la plataforma (ej: IG user ID "1473769979") | Enrichment IG/TT |
| `platform_user_id` | TEXT | — | — | ID alternativo de la plataforma | Enrichment |
| `account_url` | TEXT | — | — | URL completa del perfil (ej: `https://instagram.com/lecpkim/`) | Enrichment IG/TT |
| `account_status` | TEXT | — | `'active'` | `active` / `suspended` / `deleted` / `unknown` | Enrichment |
| `is_verified` | BOOLEAN | — | `false` | Verificado en la plataforma (check azul) | Enrichment IG/TT |

### Metricas de audiencia

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `followers` | INTEGER | — | `0` | Seguidores | CSV / Enrichment IG/TT |
| `following_count` | INTEGER | — | `0` | Cuantas cuentas sigue | Enrichment IG/TT |
| `media_count` | INTEGER | — | `0` | Posts/videos publicados | Enrichment IG/TT |
| `engagement_rate` | NUMERIC | — | — | Tasa de engagement (0-100) | CSV / Upfluence |
| `growth_rate` | NUMERIC | — | — | Tasa de crecimiento | CSV / Upfluence |
| `average_likes` | INTEGER | — | `0` | Promedio de likes (TT: total heartCount) | CSV / Enrichment TT |
| `average_comments` | INTEGER | — | `0` | Promedio de comentarios | CSV / Upfluence |
| `average_views` | INTEGER | — | `0` | Promedio de vistas | CSV / Upfluence |

### Perfil de la plataforma

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `bio` | TEXT | — | — | Bio/descripcion en la plataforma | Enrichment IG/TT |
| `profile_pic_url` | TEXT | — | — | URL de foto de perfil HD | Enrichment IG/TT |
| `is_business` | BOOLEAN | — | — | Cuenta business/creator (vs personal) | Enrichment IG |
| `is_private` | BOOLEAN | — | — | Cuenta privada | Enrichment IG/TT |

### Pricing

| Columna | Tipo | Req | Default | Descripcion | Fuente |
|---|---|---|---|---|---|
| `recommended_price` | NUMERIC(10,2) | — | — | Precio recomendado | CSV / Upfluence |
| `price_min` | NUMERIC(10,2) | — | — | Precio minimo | CSV / Upfluence |
| `price_max` | NUMERIC(10,2) | — | — | Precio maximo | CSV / Upfluence |

### Timestamps

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

---

## 3. `client_inventory`

> Marca o empresa prospecto en el pipeline de ventas.

### Identificacion de la empresa

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `name` | TEXT | SI | — | Nombre comercial (full-text search espanol) |
| `legal_name` | TEXT | — | — | Razon social |
| `tax_id` | TEXT | — | — | RFC / Tax ID |
| `industry` | TEXT | — | — | Industria / giro |
| `website_url` | TEXT | — | — | Sitio web corporativo |
| `logo_url` | TEXT | — | — | URL del logo |

### Contacto corporativo

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `corporate_email` | TEXT | — | — | Email corporativo general |
| `phone_country_code` | TEXT | — | `'+52'` | Codigo de pais |
| `phone` | TEXT | — | — | Telefono corporativo |

### Presencia digital / Redes sociales

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `linkedin_url` | TEXT | — | — | LinkedIn de la empresa |
| `instagram_handle` | TEXT | — | — | Handle de Instagram |
| `facebook_url` | TEXT | — | — | URL de Facebook |
| `tiktok_handle` | TEXT | — | — | Handle de TikTok |
| `twitter_handle` | TEXT | — | — | Handle de Twitter/X |
| `pinterest_url` | TEXT | — | — | URL de Pinterest |
| `youtube_url` | TEXT | — | — | URL de YouTube |
| `online_store_url` | TEXT | — | — | Tienda online (D2C) |

### Ubicacion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `country` | TEXT | — | `'Mexico'` | Pais |
| `city` | TEXT | — | — | Ciudad |
| `address` | TEXT | — | — | Direccion completa |

### Pipeline CRM

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `status` | TEXT | SI | `'lead'` | `lead` / `contacted` / `interested` / `proposal_sent` / `negotiation` / `converted` / `lost` / `disqualified` |
| `lead_source` | TEXT | — | — | `outbound_research` / `inbound_web` / `referral` / `event` / `linkedin` / `cold_email` / `other` |
| `priority` | TEXT | — | `'medium'` | `low` / `medium` / `high` / `vip` |

### Contexto comercial

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `estimated_budget_usd` | NUMERIC(12,2) | — | — | Presupuesto estimado en USD |
| `notes` | TEXT | — | — | Notas internas |
| `tags` | TEXT[] | — | `'{}'` | Etiquetas libres |

### Scoring y clasificacion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `qualification_score` | INTEGER | — | `0` | Score 0-100 auto-calculado |
| `qualification_criteria` | JSONB | — | — | Desglose: `{revenue: 20, reviews: 15, ...}` |
| `classification` | TEXT | — | — | `private_label` / `manufacturer` / `distributor` / `reseller` / `brand` / `agency` / `other` |
| `is_private_label` | BOOLEAN | — | — | Es marca propia / private label |
| `primary_marketplace` | TEXT | — | — | Marketplace principal |
| `primary_category` | TEXT | — | — | Categoria principal de producto |
| `estimated_marketplace_revenue` | NUMERIC(12,2) | — | — | Ingreso estimado en marketplace |

### Conversion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `converted_to_company_id` | UUID | — | — | FK → `companies(id)` cuando se convierte |
| `converted_at` | TIMESTAMPTZ | — | — | Fecha de conversion |

### Asignacion interna

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `assigned_to` | UUID | — | — | FK → `users(id)` — ejecutivo asignado |
| `created_by` | UUID | SI | — | FK → `users(id)` — quien lo creo |

### Seguimiento

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `last_contacted_at` | TIMESTAMPTZ | — | — | Ultimo contacto |
| `next_followup_at` | TIMESTAMPTZ | — | — | Proximo seguimiento programado |

### Brevo Integration

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `brevo_contact_id` | BIGINT | — | — | ID del contacto en Brevo |

### Timestamps

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

---

## 4. `client_contacts`

> Personas de contacto dentro de una marca/empresa prospecto.

### Relacion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `client_inventory_id` | UUID FK | SI | — | → `client_inventory(id)` CASCADE |

### Datos personales

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `first_name` | TEXT | SI | — | Nombre |
| `last_name` | TEXT | — | — | Apellido |
| `email` | TEXT | — | — | Correo electronico |
| `phone_country_code` | TEXT | — | `'+52'` | Codigo de pais |
| `phone` | TEXT | — | — | Telefono |
| `country` | TEXT | — | — | Pais |
| `city` | TEXT | — | — | Ciudad |

### Perfil profesional

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `linkedin_url` | TEXT | — | — | LinkedIn personal |
| `twitter_handle` | TEXT | — | — | Twitter/X |
| `job_title` | TEXT | — | — | Cargo/titulo |
| `role_type` | TEXT | — | — | `cmo` / `marketing_director` / `ceo` / `head_of_ecommerce` / `brand_manager` / `director_comercial` / `marketing_manager` / `social_media_manager` / `pr_manager` / `founder` / `other` |

### Jerarquia y decision

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `is_primary_contact` | BOOLEAN | — | `false` | Contacto principal (UNIQUE por empresa) |
| `is_decision_maker` | BOOLEAN | — | `false` | Tomador de decision |
| `es_representante_legal` | BOOLEAN | — | `false` | Puede firmar contratos |
| `identidad_verificada` | BOOLEAN | — | `false` | Verificado via LinkedIn + email |

### Estado

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `status` | TEXT | SI | `'active'` | `active` / `unresponsive` / `bounced` / `left_company` / `do_not_contact` |
| `is_blocked` | BOOLEAN | SI | `false` | Bloqueado |
| `blocked_reason` | TEXT | — | — | Motivo del bloqueo |
| `blocked_at` | TIMESTAMPTZ | — | — | Fecha de bloqueo |
| `preferred_contact_channel` | TEXT | — | `'email'` | `email` / `whatsapp` / `linkedin` / `phone` / `other` |

### Enrichment / Validacion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `email_validated` | BOOLEAN | — | — | Se ejecuto validacion |
| `email_valid` | BOOLEAN | — | — | Email valido |
| `hunter_status` | TEXT | — | — | Estado de Hunter.io |
| `phone_valid` | BOOLEAN | — | — | Telefono valido |

### Conversion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `converted_to_user_id` | UUID | — | — | FK → `users(id)` cuando se convierte en usuario |
| `converted_at` | TIMESTAMPTZ | — | — | Fecha de conversion |

### Seguimiento

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `last_contacted_at` | TIMESTAMPTZ | — | — | Ultimo contacto |
| `notes` | TEXT | — | — | Notas internas |

### Integraciones

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `brevo_contact_id` | BIGINT | — | — | ID en Brevo |
| `respondio_contact_id` | BIGINT | — | — | ID en Respond.io (WhatsApp) |

### Metadata

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `created_by` | UUID | — | — | FK → `users(id)` |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

---

## 5. `client_outreach_log`

> Historial de todas las comunicaciones con prospectos (email, llamadas, WhatsApp, reuniones).

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `client_inventory_id` | UUID FK | SI | — | → `client_inventory(id)` CASCADE |
| `client_contact_id` | UUID FK | — | — | → `client_contacts(id)` SET NULL |

### Tipo de interaccion

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `outreach_type` | TEXT | SI | — | `email` / `cold_email` / `follow_up_email` / `phone_call` / `linkedin_message` / `linkedin_connection` / `whatsapp` / `meeting_virtual` / `meeting_in_person` / `proposal_sent` / `contract_sent` / `other` |

### Contenido

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `subject` | TEXT | — | — | Asunto |
| `body` | TEXT | — | — | Cuerpo del mensaje |
| `attachment_urls` | TEXT[] | — | `'{}'` | Archivos adjuntos |

### Estado y tracking

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `status` | TEXT | SI | `'sent'` | `draft` / `sent` / `delivered` / `opened` / `clicked` / `replied` / `bounced` / `no_answer` / `call_back_later` / `not_interested` |
| `sent_at` | TIMESTAMPTZ | — | `NOW()` | Fecha de envio |
| `opened_at` | TIMESTAMPTZ | — | — | Fecha de apertura |
| `replied_at` | TIMESTAMPTZ | — | — | Fecha de respuesta |

### Resultado y siguiente paso

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `outcome` | TEXT | — | — | Resultado de la interaccion |
| `next_action` | TEXT | — | — | Siguiente accion a tomar |
| `next_action_at` | TIMESTAMPTZ | — | — | Fecha de la siguiente accion |

### Integraciones

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `brevo_message_id` | TEXT | — | — | ID del mensaje en Brevo |
| `respondio_message_id` | BIGINT | — | — | ID en Respond.io (WhatsApp) |
| `whatsapp_template_name` | TEXT | — | — | Template de WhatsApp usado |

### Metadata

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `sent_by` | UUID | — | — | FK → `users(id)` — quien envio |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |

---

## 6. `client_competitors`

> Competidores identificados para cada marca prospecto.

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `client_inventory_id` | UUID FK | SI | — | → `client_inventory(id)` CASCADE |
| `competitor_name` | TEXT | SI | — | Nombre del competidor |
| `competitor_website` | TEXT | — | — | Sitio web |
| `competitor_linkedin` | TEXT | — | — | LinkedIn |
| `competitor_instagram` | TEXT | — | — | Instagram |
| `competitor_tiktok` | TEXT | — | — | TikTok |
| `instagram_followers` | INTEGER | — | — | Seguidores Instagram |
| `tiktok_followers` | INTEGER | — | — | Seguidores TikTok |
| `linkedin_followers` | INTEGER | — | — | Seguidores LinkedIn |
| `estimated_monthly_spend_usd` | NUMERIC(12,2) | — | — | Gasto mensual estimado en marketing |
| `notes` | TEXT | — | — | Notas |
| `created_by` | UUID | — | — | FK → `users(id)` |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

---

## 7. `client_products`

> Productos vendidos por la marca prospecto (D2C o en marketplaces).

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `client_inventory_id` | UUID FK | SI | — | → `client_inventory(id)` CASCADE |
| `name` | TEXT | SI | — | Nombre del producto |
| `sku` | TEXT | — | — | SKU interno |
| `asin` | TEXT | — | — | ASIN de Amazon |
| `category` | TEXT | — | — | Categoria |
| `subcategory` | TEXT | — | — | Subcategoria |
| `brand` | TEXT | — | — | Marca del producto |
| `price` | NUMERIC(10,2) | — | — | Precio |
| `currency` | TEXT | — | `'USD'` | Moneda |
| `image_url` | TEXT | — | — | Imagen del producto |
| `product_url` | TEXT | — | — | URL directa |
| `status` | TEXT | SI | `'active'` | `active` / `discontinued` / `out_of_stock` |
| `notes` | TEXT | — | — | Notas |
| `created_by` | UUID | — | — | FK → `users(id)` |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

---

## 8. `marketplaces`

> Catalogo de plataformas marketplace soportadas.

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `name` | TEXT | SI | — | Nombre interno (UNIQUE) |
| `display_name` | TEXT | SI | — | Nombre visible en UI |
| `region` | TEXT | — | — | Region geografica |
| `base_url` | TEXT | — | — | URL base del marketplace |
| `icon` | TEXT | — | — | Icono/logo |
| `active` | BOOLEAN | SI | `true` | Activo en el sistema |
| `sort_order` | INTEGER | SI | `0` | Orden de visualizacion |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |

---

## 9. `company_marketplaces`

> Presencia de una marca en un marketplace especifico.

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `client_inventory_id` | UUID FK | SI | — | → `client_inventory(id)` CASCADE |
| `marketplace_id` | UUID FK | SI | — | → `marketplaces(id)` CASCADE |
| `store_url` | TEXT | — | — | URL de la tienda |
| `store_name` | TEXT | — | — | Nombre de la tienda |
| `seller_id` | TEXT | — | — | ID del seller en el marketplace |
| `rating` | NUMERIC(3,2) | — | — | Rating del seller |
| `review_count` | INTEGER | — | `0` | Numero de resenas |
| `product_count` | INTEGER | — | `0` | Numero de productos |
| `estimated_monthly_revenue` | NUMERIC(12,2) | — | — | Ingreso mensual estimado |
| `last_scraped_at` | TIMESTAMPTZ | — | — | Ultimo scraping |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

> **UNIQUE:** `(client_inventory_id, marketplace_id)`

---

## 10. `product_marketplace_listings`

> Listing individual de un producto en un marketplace.

| Columna | Tipo | Req | Default | Descripcion |
|---|---|---|---|---|
| `id` | UUID PK | SI | `gen_random_uuid()` | |
| `product_id` | UUID FK | SI | — | → `client_products(id)` CASCADE |
| `marketplace_id` | UUID FK | SI | — | → `marketplaces(id)` CASCADE |
| `listing_url` | TEXT | — | — | URL del listing |
| `listing_asin` | TEXT | — | — | ASIN especifico del listing |
| `listing_title` | TEXT | — | — | Titulo del listing |
| `price` | NUMERIC(10,2) | — | — | Precio publicado |
| `currency` | TEXT | — | `'USD'` | Moneda |
| `rating` | NUMERIC(3,2) | — | — | Rating del producto |
| `review_count` | INTEGER | — | `0` | Resenas |
| `seller_count` | INTEGER | — | `1` | Sellers ofreciendo el producto |
| `is_fba` | BOOLEAN | — | — | Fulfilled by Amazon |
| `is_prime` | BOOLEAN | — | — | Disponible en Prime |
| `has_video` | BOOLEAN | — | `false` | Tiene video |
| `has_a_plus_content` | BOOLEAN | — | `false` | Tiene A+ Content |
| `bsr_rank` | INTEGER | — | — | Best Seller Rank |
| `bsr_category` | TEXT | — | — | Categoria del BSR |
| `monthly_revenue_estimate` | NUMERIC(12,2) | — | — | Ingreso mensual estimado |
| `last_scraped_at` | TIMESTAMPTZ | — | — | Ultimo scraping |
| `created_at` | TIMESTAMPTZ | SI | `NOW()` | |
| `updated_at` | TIMESTAMPTZ | SI | `NOW()` | Auto-trigger |

> **UNIQUE:** `(product_id, marketplace_id)`

---

## 11. Tablas de agrupacion

### `creator_lists` + `creator_list_items`

> Listas segmentadas de creadores. Se usan para enrichment pipelines y campanas Brevo.

| Campo clave | Descripcion |
|---|---|
| `program_id` | Lista asociada a un programa especifico |
| `source` | `manual` / `csv_import` / `upfluence` / `search_filter` / `program_import` / `sub_list` |
| `parent_list_id` | Sub-lista generada desde pipeline o reporte |
| `creator_count` | Auto-actualizado por trigger |

### `client_contact_lists` + `client_contact_list_items`

> Listas segmentadas de contactos B2B. Misma estructura que creator_lists.

| Campo clave | Descripcion |
|---|---|
| `source` | `manual` / `csv_import` |
| `contact_count` | Auto-actualizado por trigger |

---

## 12. Tablas Brevo

### `brevo_campaigns`

> Campanas de email sincronizadas desde Brevo. 293+ campanas.

| Campo clave | Descripcion |
|---|---|
| `brevo_campaign_id` | ID en Brevo (UNIQUE) |
| `list_id` | FK → creator_lists (a que lista se envio) |
| `program_id` | FK → programs (a que programa pertenece) |
| `total_sent/delivered/opened/clicked/bounced/spam/unsubscribed` | Stats globales |
| `open_rate/click_rate/bounce_rate` | Calculados automaticamente (GENERATED STORED) |
| `sync_status` | `idle` / `exporting` / `fetching_events` / `finalizing` / `completed` / `failed` |
| `sync_progress` | 0-100 progreso del sync de eventos |
| `events_synced_at` | Cuando se sincronizaron los eventos individuales |

### `brevo_campaign_senders`

> Variantes de sender por campana (multiples dominios/senders).

### `brevo_email_events`

> Eventos individuales: opens, clicks, bounces. Dedup por `brevo_event_key`.

| Campo clave | Descripcion |
|---|---|
| `creator_inventory_id` | FK → creator_inventory (match por email) |
| `event_type` | `sent` / `delivered` / `opened` / `clicked` / `hard_bounce` / `soft_bounce` / `spam` / `unsubscribed` |
| `event_date` | Timestamp exacto del evento |
| `link_url` | URL clickeada (solo para clicks) |
| `source` | `sync` / `webhook` |

### `brevo_creator_stats`

> Stats pre-agregados por creator + campana + sender.

| Campo clave | Descripcion |
|---|---|
| `total_sent/delivered/opened/clicked/bounced/spam/unsubscribed` | Conteos |
| `first_open_at / last_open_at` | Timestamps de apertura |
| `first_click_at / last_click_at` | Timestamps de clicks |
| `ctr / ctor` | Click-through rate y click-to-open rate (GENERATED) |

---

## 13. Tablas de Enrichment

### `enrichment_services`

> Catalogo de servicios disponibles. 9+ servicios activos.

| Service | Descripcion | Aplica a |
|---|---|---|
| `validate_email` | Valida email via Hunter.io | creator, client_contact |
| `validate_name` | Normaliza nombre a proper case | creator, client_contact |
| `update_followers_ig` | Actualiza followers IG via RapidAPI | creator |
| `update_followers_tt` | Actualiza followers TikTok via RapidAPI | creator |
| `update_followers_yt` | Actualiza followers YouTube (pendiente) | creator |
| `score_qualification` | Calcula score 0-100 de prospeccion | client_inventory |

### `enrichment_pipelines` + `enrichment_pipeline_steps`

> Pipelines configurables con N pasos sobre una lista.

### `enrichment_step_results`

> Resultado individual por entidad × paso: success/error/skipped con old_value/new_value.

### `enrichment_flags`

> Cache de smart skip: evita re-procesar entidades dentro del TTL.

---

## 14. Datos descubiertos por Enrichment

> Que campos se llenan automaticamente por cada worker. Importante para marketing: estos datos se obtienen sin que el creador los proporcione.

### Worker: `validate_name`

| Campo | Tabla | Accion |
|---|---|---|
| `first_name` | creator_inventory | Normaliza a Proper Case (particulas, guiones, apostrofes) |
| `last_name` | creator_inventory | Normaliza a Proper Case |
| `name_validated` | creator_inventory | Marca como `true` |

### Worker: `update_followers_ig` (Instagram)

| Campo | Tabla | Accion |
|---|---|---|
| `followers` | creator_social_profiles | Actualiza siempre |
| `following_count` | creator_social_profiles | Actualiza siempre |
| `media_count` | creator_social_profiles | Actualiza siempre |
| `is_verified` | creator_social_profiles | Actualiza siempre |
| `is_business` | creator_social_profiles | Actualiza siempre |
| `is_private` | creator_social_profiles | Actualiza siempre |
| `bio` | creator_social_profiles | Actualiza siempre |
| `profile_pic_url` | creator_social_profiles | Actualiza siempre |
| `external_account_id` | creator_social_profiles | ID numerico de IG |
| `account_url` | creator_social_profiles | `https://instagram.com/{username}/` |
| `country` | creator_inventory | Solo si vacio |
| `bio` | creator_inventory | Solo si vacio |
| `secondary_email` | creator_inventory | Solo si vacio (de public_email o biography_email) |
| `categories` | creator_inventory | Append si no existe (de category de IG: "Gamer", etc.) |

### Worker: `update_followers_tt` (TikTok)

| Campo | Tabla | Accion |
|---|---|---|
| `followers` | creator_social_profiles | Actualiza siempre |
| `following_count` | creator_social_profiles | Actualiza siempre |
| `media_count` | creator_social_profiles | Videos publicados |
| `average_likes` | creator_social_profiles | Total heartCount |
| `is_verified` | creator_social_profiles | Actualiza siempre |
| `is_private` | creator_social_profiles | Actualiza siempre |
| `bio` | creator_social_profiles | De `user.signature` |
| `profile_pic_url` | creator_social_profiles | De `user.avatarLarger` |
| `external_account_id` | creator_social_profiles | ID numerico de TikTok |
| `account_url` | creator_social_profiles | `https://tiktok.com/@{username}` |
| `bio` | creator_inventory | Solo si vacio |
| `website_url` | creator_inventory | Solo si vacio (de bioLink) |

### Worker: `validate_email`

| Campo | Tabla | Accion |
|---|---|---|
| `email_valid` | creator_inventory | true/false |
| `email_validated` | creator_inventory | true |
| `hunter_status` | creator_inventory | valid/invalid/accept_all/format_valid_only |

### Worker: `score_qualification`

| Campo | Tabla | Accion |
|---|---|---|
| `qualification_score` | client_inventory | 0-100 basado en revenue, reviews, products, etc. |

---

## Relaciones entre entidades

```
creator_inventory
 ├── creator_social_profiles      (1:N) — perfiles de redes sociales
 ├── creator_audience              (1:N) — demografia de audiencia
 ├── creator_list_items            (N:M) — listas de creadores
 ├── creator_program_enrollments   (1:N) — inscripciones a programas
 ├── creator_blocklist             (1:N) — historial de bloqueos
 ├── campaign_briefs               (1:N) — briefs asignados
 ├── campaign_creator_drafts       (1:N) — borradores de contenido
 ├── campaign_creator_publications (1:N) — publicaciones
 ├── publication_dates             (1:N) — fechas de publicacion
 ├── brevo_email_events            (1:N) — eventos de email
 ├── brevo_creator_stats           (1:N) — stats de email
 ├── workflow_instances            (1:N) — workflows en ejecucion
 └── enrichment_flags/results      (1:N) — resultados de enriquecimiento

client_inventory
 ├── client_contacts               (1:N) — personas de contacto
 │    ├── client_outreach_log      (1:N) — comunicaciones por contacto
 │    ├── client_contact_list_items(N:M) — listas de contactos
 │    └── brevo_contact_stats      (1:N) — stats de email por contacto
 ├── client_outreach_log           (1:N) — comunicaciones a nivel empresa
 ├── client_competitors            (1:N) — competidores
 ├── client_products               (1:N) — productos
 │    └── product_marketplace_listings (1:N) — listings por marketplace
 ├── company_marketplaces          (1:N) — presencia en marketplaces
 └── enrichment_flags/results      (1:N) — resultados de enriquecimiento

marketplaces (catalogo)
 ├── company_marketplaces          (1:N) — empresas en este marketplace
 └── product_marketplace_listings  (1:N) — productos en este marketplace

brevo_campaigns
 ├── brevo_campaign_senders        (1:N) — variantes de sender
 ├── brevo_email_events            (1:N) — eventos individuales
 └── brevo_creator_stats           (1:N) — stats por creator
```

---

## Campos candidatos a revisar

> Marca con `[x]` los que ya se evaluaron/implementaron.

### Creator Inventory — posibles campos faltantes

- [x] `secondary_email` — ✅ implementado (descubierto por IG enrichment)
- [x] `is_profile_complete` — ✅ ya existe en BD
- [ ] `nationality` — nacionalidad (distinto a country de residencia)
- [ ] `spoken_languages` — idiomas que habla (TEXT[] o tabla aparte)
- [ ] `content_style` / `tone` — estilo de contenido (informativo, humor, lifestyle)
- [ ] `agent_name` / `agent_email` — datos del representante/manager
- [ ] `payment_method` / `payment_info` — metodo de pago preferido
- [ ] `bank_account` / `clabe` — datos bancarios para pago
- [ ] `tax_id` / `rfc` — datos fiscales del creador
- [ ] `contract_status` — estado contractual
- [ ] `rating` / `internal_score` — calificacion interna del creador
- [ ] `availability` — disponibilidad para campanas
- [ ] `preferred_brands` / `excluded_brands` — marcas preferidas/excluidas
- [ ] `portfolio_url` — portafolio de trabajos anteriores
- [ ] `referral_source` — como llego al sistema (referido, busqueda, etc.)

### Client Inventory — posibles campos faltantes

- [ ] `employee_count` / `company_size` — tamano de la empresa
- [ ] `annual_revenue` — facturacion anual (distinto a marketplace revenue)
- [ ] `founded_year` — ano de fundacion
- [ ] `number_of_locations` — numero de ubicaciones/tiendas
- [ ] `preferred_language` — idioma preferido de comunicacion
- [ ] `contract_value` / `deal_size` — valor del deal en pipeline
- [ ] `lost_reason` — motivo de perdida (cuando status = lost)
- [ ] `disqualified_reason` — motivo de descalificacion
- [ ] `nda_signed` — tiene NDA firmado
- [ ] `previous_influencer_campaigns` — experiencia previa con influencers
- [ ] `target_audience_description` — descripcion del publico objetivo
- [ ] `campaign_goals` — objetivos tipicos de campana

### Client Contacts — posibles campos faltantes

- [ ] `personal_email` — email personal (distinto al corporativo)
- [ ] `birthday` — fecha de cumpleanos (para personalizacion)
- [ ] `gender` — genero
- [ ] `assistant_name` / `assistant_email` — datos del asistente
- [ ] `meeting_availability` — disponibilidad para reuniones
- [ ] `language_preference` — idioma preferido
- [ ] `last_interaction_summary` — resumen de ultima interaccion
