# DTOs — CONTRATOS DE DEPENDENCIA ENTRE EQUIPOS

**Analogía:** Cada DTO es como una interfaz/contrato en programación. Define exactamente QUÉ se entrega, en QUÉ formato, CUÁNDO, y QUIÉN es responsable de cada lado. Si el "tipo" no coincide, la integración falla.

---

## ENTRADAS: Lo que Equipo 3 RECIBE de otros equipos

### DTO-IN-01: ICP B2B (Equipo 1 Marketing → Equipo 3)

```
interface ICP_B2B {
  // Quién entrega: Pepe (Líder Equipo 1 - Marketing de Influencers)
  // Quién recibe: Eugenia (compila) → Gabriel (usa en Clay)
  // Deadline: Lunes 6 Abr (enviar datos) → Martes 7 Abr (doc finalizado)
  // Formato: Documento Google Docs o PDF

  industrias_objetivo: string[];        // Ej: "E-commerce Amazon", "DTC Shopify", "CPG"
  tamano_acuerdo_min_max: {min: number, max: number};  // Ej: {min: 2000, max: 12000} USD/mes
  titulos_tomadores_decision: string[]; // Ej: "VP Marketing", "Head of Content", "CMO"
  tamano_empresa: {min: number, max: number};  // # empleados o revenue
  objeciones_comunes: string[];         // Top 5 objeciones que escuchan en ventas
  geolocalizacion: string[];            // Ej: "US", "Mexico", "LATAM"
  keywords_exclusion: string[];         // Industrias o tipos que NO queremos
  caso_exito_referencia: string;        // 1 caso de éxito para usar en templates
}
```

**Acción si no llega a tiempo:** Gabriel no puede configurar los filtros de la cascada de Clay. Se usa un ICP genérico temporal (riesgo: prospectos de baja calidad). Eugenia escala a Daniel → Daniel contacta a Pepe.

---

### DTO-IN-02: ICP Creadores (Equipo 2 Creadores → Equipo 3)

```
interface ICP_Creadores {
  // Quién entrega: Mery (Líder Equipo 2 - Creadores)
  // Quién recibe: Eugenia (compila) → Gabriel (usa en Clay/Social Blade)
  // Deadline: Lunes 6 Abr (enviar datos) → Martes 7 Abr (doc finalizado)
  // Formato: Documento Google Docs o PDF

  plataformas_objetivo: string[];       // Ej: "YouTube", "TikTok", "Instagram"
  suscriptores_minimo: number;          // Ej: 10000
  idiomas_contenido: string[];          // Ej: "Español", "Inglés", "Portugués"
  categorias_contenido: string[];       // Ej: "Gaming", "Lifestyle", "Tech"
  ingreso_mensual_minimo: number;       // USD estimado
  razones_desercion_top: string[];      // Por qué se van los creadores
  tiempo_a_monetizacion_promedio: string; // Ej: "45 días"
  tasa_adopcion_servicios: {servicio: string, tasa: number}[]; // Qué servicios toman
  segmentos_retencion: {segmento: string, retencion_pct: number}[];
  pain_points_principales: string[];    // Para messaging
}
```

**Acción si no llega a tiempo:** No se pueden construir filtros de Social Blade ni criterios de calificación en Clay para creadores. Se escala igual que DTO-IN-01.

---

### DTO-IN-03: Audio para Clonación de Voz (Equipo 2 → Equipo 3)

```
interface Audio_Clonacion {
  // Quién entrega: Mery coordina con creador(es) del Equipo 2
  // Quién recibe: Dayana (sube a ElevenLabs)
  // Deadline: Viernes 10 Abr (Día 5) — entrenar clon inicia Día 6 (13 Abr)
  // Formato: Archivo de audio

  formato: "WAV" | "MP3";              // Preferido: WAV 44.1kHz
  duracion_minima: "5 minutos";
  condiciones: {
    habitacion_silenciosa: true,
    microfono_profesional: true,        // No mic de laptop
    un_solo_hablante: true,
    idioma: "Español";
    tono: "Conversacional, amigable";
  };
  contenido: string;                    // Lectura variada: preguntas, afirmaciones, emociones
}
```

**Acción si no llega a tiempo:** El entrenamiento del clon se retrasa. Cada día de retraso = 1 día menos de margen para producción de notas de voz. Si retraso > 3 días, evaluar usar solo voz humana manual.

---

### DTO-IN-04: Aprobación de Flujos ManyChat (Equipo 2 → Equipo 3)

```
interface Aprobacion_Flujos {
  // Quién entrega: Mery (Equipo 2) revisa y aprueba
  // Quién envía para revisión: Dayana (Equipo 3)
  // Deadline envío: Miércoles 15 Abr (Día 8)
  // Deadline aprobación: Jueves 16 Abr (Día 9)
  // Formato: Review en ManyChat + email de confirmación

  flujos_a_revisar: [
    "Flujo cualificación WhatsApp",
    "Flujo reclutamiento Instagram DM"
  ];
  criterios_revision: {
    tono_adecuado: boolean;
    preguntas_correctas: boolean;
    umbrales_calificacion: boolean;
    links_funcionan: boolean;
  };
  respuesta: "APROBADO" | "CAMBIOS_REQUERIDOS";
  cambios_si_aplica: string[];
}
```

---

### DTO-IN-05: Aprobación Plantillas Email B2B (Equipo 1 → Equipo 4 → Equipo 3 carga)

```
interface Aprobacion_Emails {
  // Flujo: Equipo 4 escribe → Equipo 1 (Pepe) aprueba → Equipo 3 carga en Smartlead
  // Deadline de templates listos: Día 11 (Mon 20 Abr)
  // Deadline carga en Smartlead: Día 12 (Tue 21 Abr)
  // Equipo 3 solo carga — no escribe ni aprueba contenido

  templates: {
    email_1_auditoria: string;
    email_2_seguimiento: string;
    email_3_caso_estudio: string;
    email_4_breakup: string;
  };
  formato: "texto plano, <100 palabras cada uno";
  variables_dinamicas: ["{{nombre}}", "{{empresa}}", "{{dato_competidor}}"];
}
```

---

## SALIDAS: Lo que Equipo 3 ENTREGA a otros equipos

### DTO-OUT-01: HubSpot CRM Configurado (Equipo 3 → Todos)

```
interface HubSpot_Entregable {
  // Quién entrega: Daniel (Equipo 3)
  // Quién recibe: Todos los equipos
  // Deadline: Martes 7 Abr (Día 2)

  pipelines: {
    b2b_ventas: {
      etapas: ["Prospecto", "Contactado", "Cualificado", "Reunión", "Propuesta", "Cerrado Ganado", "Cerrado Perdido"];
    };
    creadores_onboarding: {
      etapas: ["Lead", "Contactado", "Cualificado", "Demo/Pitch", "Contrato Enviado", "Firmado", "Onboarding", "Activo"];
    };
  };
  propiedades_custom: string[];          // source, icp_score, video_gap_score, etc.
  accesos: {equipo: string, nivel: string}[];
  verificacion: "Todos los equipos confirman acceso por Telegram";
}
```

---

### DTO-OUT-02: Telegram + Alertas (Equipo 3 → Todos)

```
interface Telegram_Entregable {
  // Deadline: Martes 7 Abr (Día 2)

  canales: [
    "#leads-b2b-calientes",
    "#creadores-nuevos",
    "#salud-dominios",
    "#standup-diario",
    "#general-infra"
  ];
  alertas_relay: {
    trigger: "Nuevo lead caliente en HubSpot";
    destino: "#leads-b2b-calientes";
    formato: "Nombre + Empresa + Score + Link HubSpot";
  };
  verificacion: "Alerta de prueba recibida por todos los equipos";
}
```

---

### DTO-OUT-03: Cascada Clay 1,000 Prospectos (Equipo 3 → Equipo 4)

```
interface Clay_Prospectos {
  // Quién entrega: Gabriel (Equipo 3)
  // Quién recibe: Equipo 4 (Contenido + Campañas)
  // Deadline: Martes 14 Abr (Día 7)

  cantidad: 1000;
  campos_requeridos: {
    email_verificado: string;           // Validado con cascade (Prospeo, Findymail, Hunter)
    linkedin_url: string;
    nombre_completo: string;
    empresa: string;
    titulo_cargo: string;
    industria: string;
    ingresos_estimados: number;         // USD
    video_gap_score: number;            // 1-10 de SmartScout
    pais: string;
    telefono?: string;                  // Opcional
  };
  formato_entrega: "Push automático Clay → Smartlead + export CSV backup";
  calidad_minima: {
    email_bounce_rate: "<5%";
    campos_completos: ">80% de registros con todos los campos";
  };
}
```

---

#### ANEXO: Mapping Supabase para DTO-OUT-03

Los prospectos de Clay se persisten en Supabase como respaldo y fuente de verdad paralela. Ver detalle completo de implementación en **T11-B**.

```
// Tablas destino en Supabase
tablas: {
  empresa:  "client_inventory",      // 1 registro por empresa
  contacto: "client_contacts",       // 1 contacto principal por empresa
  lista:    "client_contact_lists",   // Lista: "Sprint-Abr-B2B-1000"
  items:    "client_contact_list_items" // Vinculación contacto ↔ lista
}

// Mapping campos Clay → client_inventory
{
  empresa                → name
  sitio_web              → website_url
  industria              → industry
  ingresos_estimados     → estimated_marketplace_revenue
  icp_score              → qualification_score
  video_gap_score        → qualification_criteria (JSONB: {"video_gap": X})
  pais                   → country
  classification         → classification
  lead_source            → 'cold_email'
  status                 → 'lead'
  priority               → derivar de icp_score (>=8→high, 6-7→medium, <6→low)
}

// Mapping campos Clay → client_contacts
{
  nombre_completo        → first_name + last_name
  email_verificado       → email + email_valid=true
  titulo_cargo           → job_title
  linkedin_url           → linkedin_url
  telefono               → phone
  is_primary_contact     → true
  is_decision_maker      → derivar de titulo (VP/CMO/Head/Director → true)
}

// Dedup: upsert por website_url (empresa) y email (contacto)
```

---

### DTO-OUT-04: Smartlead Configurado (Equipo 3 → Equipo 4)

```
interface Smartlead_Entregable {
  // Deadline: Jueves 9 Abr (Día 4)

  cuentas_conectadas: 15;
  rotacion: true;
  warmup_activo: true;
  warmup_dias_al_entrega: number;       // Mínimo 3 días de warmup al entregar
  template_secuencia: "cargado (placeholder para que Eq4 reemplace con copy final)";
  conexion_clay: "Push activo Clay → Smartlead";
}
```

---

### DTO-OUT-05: Expandi Configurado (Equipo 3 → Equipo 4)

```
interface Expandi_Entregable {
  // Deadline: Viernes 10 Abr (Día 5)

  cuentas_linkedin: 2-3;               // Las que Dayana creó en T05
  limites_diarios: {conexiones: 25, mensajes: 50};
  ip_residencial: true;
  delays_aleatorios: true;
  conexion_clay: "Push activo Clay → Expandi";
}
```

---

### DTO-OUT-06: ManyChat Flujos (Equipo 3 → Equipo 2 review, Equipo 4 usa)

```
interface ManyChat_Entregable {
  // Deadline build: Miércoles 15 Abr (Día 8)
  // Deadline con aprobación Eq2: Jueves 16 Abr (Día 9)

  flujos: {
    whatsapp_cualificacion: {
      pasos: ["Bienvenida", "Pregunta suscriptores", "Pregunta ingresos", "Pregunta idioma", "Resultado"];
      branch_io_integrado: true;
    };
    instagram_dm_reclutamiento: {
      trigger: "Hashtag o interacción con contenido";
      video_personalizado_15s: true;
      redirect_whatsapp: true;
    };
  };
  verificacion: "Probado end-to-end en dispositivo móvil (iOS + Android)";
}
```

---

#### ANEXO: Mapping Supabase para DTO-OUT-06

Los creadores cualificados por ManyChat se persisten en Supabase. Ver detalle en **T12**.

```
// Tablas destino en Supabase
tablas: {
  creador:  "creator_inventory",        // 1 registro por creador nuevo
  social:   "creator_social_profiles",  // Perfil de plataforma principal
  lista:    "creator_lists",            // Lista: "Sprint-Abr-Nuevos-Pipeline"
  items:    "creator_list_items"        // Vinculación creador ↔ lista
}

// Mapping ManyChat → creator_inventory
{
  nombre               → first_name
  idioma               → language
  status               → 'pending_registration'
  // lead_source no existe como columna directa — usar notes o acquisition_source
}

// Mapping ManyChat → creator_social_profiles
{
  plataforma           → platform ('youtube' | 'tiktok' | 'instagram' | 'twitch')
  suscriptores         → followers
  handle               → username (si disponible del DM de IG)
}

// Nota: datos existentes (50K+) son históricos.
// Pipeline nuevo genera registros nuevos. No se hace dedup contra históricos.
```

---

### DTO-OUT-07: Sendspark Configurado (Equipo 3 → Equipo 4, Equipo 1)

```
interface Sendspark_Entregable {
  // Deadline: Lunes 13 Abr (Día 6)

  variables_dinamicas: ["{{nombre}}", "{{empresa}}", "{{dato_custom}}"];
  listo_para_video: true;               // Eq1 graba video maestro, Eq4 sube
  integracion_hubspot: true;
}
```

---

### DTO-OUT-08: ElevenLabs Clon de Voz (Equipo 3 → Equipo 2 aprueba, Equipo 4 usa)

```
interface ElevenLabs_Entregable {
  // Deadline muestras: Jueves 16 Abr (Día 9)
  // Depende de: DTO-IN-03 (audio del Equipo 2)

  muestras_generadas: 10;
  api_manychat_conectada: true;
  calidad: "Aprobada por Equipo 2 (naturalidad + acento)";
}
```

---

### DTO-OUT-09: Loom Arquitectura (Equipo 3 → Equipo 4)

```
interface Loom_Arquitectura {
  // Quién graba: Daniel (Equipo 3)
  // Quién recibe: Equipo 4 (Contenido + Campañas)
  // Deadline: Jueves 16 Abr (Día 9)

  duracion: "15 minutos";
  contenido: [
    "Pipeline B2B completo: SmartScout → Clay → Smartlead → Expandi",
    "Pipeline Creadores: IG DM → ManyChat → WhatsApp → Branch.io",
    "Integraciones HubSpot",
    "Dónde cargar activos (templates email, videos, etc.)",
    "Alertas de Telegram",
    "Monitoreo de dominios"
  ];
  formato: "Loom link compartido por Telegram #general-infra";
}
```

---

### DTO-OUT-10: Micrositios + Lead Magnets (Equipo 3 → Equipo 4, Equipos 1+2 aprueban)

```
interface Micrositios_Entregable {
  // Quién construye: Lillian (Equipo 3)
  // Deadline: Martes 21 Abr (Día 12)
  // Aprobación: Equipo 1 (B2B) + Equipo 2 (Creadores) revisan

  micrositio_b2b: {
    plataforma: "Unbounce";
    dynamic_text_replacement: true;
    responsive_mobile: true;
    tracking_hubspot: true;
  };
  micrositio_creadores: {
    plataforma: "Leadpages";
    campos_dinamicos: true;
    calculadora_outgrow_embebida: true;
    responsive_mobile: true;
  };
  lead_magnets: {
    auditoria_video_b2b: "Outgrow (ASIN/URL → análisis → captura)";
    calculadora_ingresos_creadores: "Outgrow (suscriptores + vistas → proyección)";
  };
}
```

---

## PROTOCOLO DE ESCALACIÓN

```
Si un DTO no llega a tiempo:
1. Responsable de Equipo 3 notifica a Daniel (Telegram DM)
2. Daniel contacta al líder del otro equipo (Pepe o Mery) — mismo día
3. Si no hay respuesta en 4 horas hábiles → Daniel escala a dirección
4. Mientras tanto: equipo avanza con placeholder/datos genéricos marcados como "TEMPORAL"
5. Cuando el DTO real llega, se reemplaza el placeholder y se re-valida
```
