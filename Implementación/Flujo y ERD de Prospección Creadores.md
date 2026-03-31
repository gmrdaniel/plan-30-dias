Aquí tienes la descripción detallada del flujo paso a paso en formato de texto, seguida del código completo del **Diagrama de Entidad-Relación (ERD)** actualizado.

En el ERD he incluido toda la estructura de tu base de datos original (creadores-db.txt) y le he añadido las nuevas tablas (creator\_lists y creator\_list\_members) que diseñamos para que puedas agrupar a los creadores y saber de qué base de datos provienen.

## ---

**📝 Descripción del Flujo de Prospección (Para Creadores)**

Este es un embudo de conversión altamente automatizado y diseñado para la velocidad, utilizando canales nativos móviles:

1. **Día 1 \- El Gancho (Instagram DM):** Todo comienza cuando un creador que cumple con el Perfil de Cliente Ideal (ICP) interactúa con un hashtag o contenido específico. Esto dispara una automatización en ManyChat que le envía un Mensaje Directo (DM) en Instagram. El mensaje contiene un video personalizado de 15 segundos diseñado para captar su atención, mostrándole el dinero que está perdiendo por no optimizar su contenido (ej. no doblarlo o no hacer streams 24/7).  
2. **Día 2 \- La Calificación (WhatsApp AI):** Si el creador se interesa y hace clic en el enlace del DM de Instagram (usando *deep links* de Branch.io para que la transición sea perfecta), es redirigido automáticamente a WhatsApp. Allí, un bot impulsado por IA se encarga de calificar al prospecto haciéndole preguntas clave: número de suscriptores, ingresos mensuales actuales y el idioma de su contenido. Si el creador cumple los requisitos, avanza a la etapa de cierre; si no responde, el sistema espera al día siguiente.  
3. **Día 3 \- Prueba Social (SMS):** Si el creador ignoró el bot de WhatsApp, el sistema hace un cambio de canal y le envía un mensaje de texto (SMS). Este mensaje es muy directo e incluye un enlace a un video testimonial de 60 segundos de un creador similar o reconocido (como Javier y Exi), demostrando resultados reales y generando confianza (FOMO).  
4. **Día 5 \- El Toque Humano (Nota de Voz en WhatsApp):** Dos días después, se envía una nota de voz de 30 segundos por WhatsApp. Parece completamente orgánica, enviada por un Account Manager de La Neta (o generada con IA mediante ElevenLabs), explicándole exactamente qué servicio específico le conviene más según su perfil. Las notas de voz generan una altísima tasa de respuesta en el mercado hispano.  
5. **Día 7 \- El Cierre Legal y Financiero (Correo Electrónico):** Finalmente, una vez que el creador está "caliente" y entiende el valor, se le envía un correo electrónico. Este correo formaliza la relación: incluye un diseño en HTML con sus proyecciones de ganancias personalizadas y un botón mágico para firmar el contrato con un solo clic.

## ---

**🗄️ Diagrama ERD Actualizado (Base de Datos)**

Aquí tienes el código de tu base de datos combinando tu archivo original con las mejores prácticas que discutimos para manejar **Listas** y el **Origen** de los creadores.

*(Agregué acquisition\_source en creator\_inventory y las tablas de creator\_lists al final).*

Fragmento de código

```
      users {
          uuid id PK
          uuid auth_user_id FK
          text email UK
          text first_name
          text last_name
          boolean is_active
          timestamp last_login_at
          text bio
          text avatar_url
          date birthdate
          text website_url
          text secondary_email
          text preferred_language
          timestamp created_at
          timestamp updated_at
      }

      roles {
          uuid id PK
          text name UK
          text display_name
          text description
          text role_type
          timestamp created_at
      }

      user_roles {
          uuid id PK
          uuid user_id FK
          uuid role_id FK
          uuid assigned_by FK
          timestamp assigned_at
      }

      creator_inventory {
          uuid id PK
          uuid user_id FK,UK
          text first_name
          text last_name
          text email
          text status
          text language
          uuid created_by FK
          text country
          text city
          text gender
          text bio
          text website_url
          text notes
          text[] categories
          date birthdate
          text phone_country_code
          text phone
          text acquisition_source "Origen de la BD comprada/adquirida"
          timestamp created_at
          timestamp updated_at
      }

      creator_social_profiles {
          uuid id PK
          uuid creator_id FK
          text platform
          text profile_url
          text handle
          int followers
          timestamp created_at
      }

      creator_audience {
          uuid id PK
          uuid creator_id FK
          jsonb audience_data
          timestamp updated_at
      }

      companies {
          uuid id PK
          text name
          text website_url
          timestamp created_at
      }

      user_companies {
          uuid id PK
          uuid user_id FK
          uuid company_id FK
      }

      agencies {
          uuid id PK
          text name
          timestamp created_at
      }

      agency_users {
          uuid id PK
          uuid user_id FK
          uuid agency_id FK
      }

      agency_companies {
          uuid id PK
          uuid agency_id FK
          uuid company_id FK
      }

      campaigns {
          uuid id PK
          uuid company_id FK
          uuid assigned_executive FK
          text title
          text description
          timestamp created_at
      }

      packages {
          uuid id PK
          text name
          numeric price
          timestamp created_at
      }

      company_packages {
          uuid id PK
          uuid company_id FK
          uuid package_id FK
          text status
      }

      agency_campaigns {
          uuid id PK
          uuid agency_id FK
          uuid campaign_id FK
          timestamp created_at
      }

      %% ==========================================
      %% NUEVAS TABLAS PARA LISTAS Y AGRUPACIONES
      %% ==========================================

      creator_lists {
          uuid id PK
          text name "Ej. Prospectos Campaña X"
          text list_type "Ej. operational, exclusion"
          text description
          uuid created_by FK
          timestamp created_at
      }

      creator_list_members {
          uuid list_id PK,FK
          uuid creator_id PK,FK
          timestamp added_at
      }

      %% ==========================================
      %% RELACIONES
      %% ==========================================

      users ||--o{ user_roles : "has"
      roles ||--o{ user_roles : "assigned to"

      users ||--o| creator_inventory : "user_id"
      users ||--o{ user_companies : "belongs to"
      companies ||--o{ user_companies : "has"

      users ||--o{ agency_users : "belongs to"
      agencies ||--o{ agency_users : "has"

      agencies ||--o{ agency_companies : "manages"
      companies ||--o{ agency_companies : "managed by"

      creator_inventory ||--o{ creator_social_profiles : "has"
      creator_inventory ||--o{ creator_audience : "has"

      companies ||--o{ campaigns : "owns"
      users ||--o{ campaigns : "assigned_executive"

      companies ||--o{ company_packages : "has"
      packages ||--o{ company_packages : "assigned to"

      agencies ||--o{ agency_campaigns : "has"
      campaigns ||--o{ agency_campaigns : "managed by"

      %% Relaciones de las nuevas tablas de listas
      users ||--o{ creator_lists : "creates"
      creator_lists ||--o{ creator_list_members : "contains"
      creator_inventory ||--o{ creator_list_members : "is member of"
```

