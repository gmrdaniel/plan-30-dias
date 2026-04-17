## **ESTRUCTURA DEL CLAY CASCADE**

El objetivo de este documento es definir la arquitectura de un sistema de prospección automatizada. Este sistema busca transformar el proceso de adquisición de *leads* de un modelo manual y reactivo a uno escalable y basado en datos, lo que permitirá una priorización inteligente de prospectos.

Al establecer y aplicar Criterios de Perfil de Cliente Ideal (ICP) e integrarlos con herramientas como Clay, se reemplazará un alto volumen de contactos incontrolados por una selección precisa de prospectos con alta probabilidad de conversión. Esta optimización focalizará los esfuerzos del equipo en oportunidades genuinas, habilitando un *outreach* más pertinente, alineado con el contexto y el momento de cada *lead*.

En última instancia, esta estrategia mejorará significativamente la eficiencia operativa y el impacto comercial del equipo de ventas.

## **ETAPA 1 — DISCOVERY (Búsqueda inicial)**

**Objetivo:** generar base de prospectos

### **Inputs:**

* industrias\_objetivo (B2B)  
* plataformas\_objetivo (creadores)  
* geolocalizacion  
* categorias\_contenido

### **Fuentes:**

* SmartScout  
* Apify  
* Social Blade

## **ETAPA 2 — FILTRADO ICP**

**Objetivo:** eliminar leads fuera de perfil

### **Filtros:**

* tamaño empresa / seguidores  
* idioma  
* categoría  
* exclusiones

👉 Resultado: base limpia de prospectos relevantes

## **ETAPA 3 — ENRICHMENT**

**Objetivo:** completar información clave

### **Datos a enriquecer:**

* email  
* cargo / decision maker  
* revenue estimado  
* engagement / views

👉 Herramientas:

* Clay enrichment  
* APIs externas

## **ETAPA 4 — DETECCIÓN DE INTENCIÓN**

**Objetivo:** identificar leads activos

### **Señales:**

* hiring marketing  
* uso de ads  
* crecimiento de contenido  
* monetización activa

👉 Resultado: leads con mayor probabilidad de conversión

## **ETAPA 5 — SCORING**

**Objetivo:** priorizar automáticamente

### **Ejemplo de lógica:**

* match industria → \+20  
* tamaño adecuado → \+15  
* señales de intención → \+30  
* decision maker → \+25

👉 Output:

* qualification\_score (0–100)

## **ETAPA 6 — SEGMENTACIÓN**

**Objetivo:** clasificar leads

* A → alta prioridad (contacto inmediato)  
* B → media prioridad  
* C → baja prioridad / nurturing

## **ETAPA 7 — EXPORTACIÓN**

**Objetivo:** activar el sistema comercial

### **Destinos:**

* Supabase (base central)  
* HubSpot (CRM)  
* ManyChat (creadores)

## **ESTRUCTURA DE DATOS**

Los ICP definen:

* campos de filtrado  
* estructura de scoring  
* lógica de segmentación

👉 Todos los campos están estandarizados para:

* parsing automático  
* integración con Clay  
* consistencia en datos

## **RESULTADO ESPERADO**

Con esta estructura se espera:

* mayor calidad de leads  
* reducción de tiempo en prospección  
* priorización automática  
* mejora en tasas de respuesta

## **RIESGOS SI NO SE RESPETA LA ESTRUCTURA**

* leads fuera de ICP  
* baja conversión  
* pérdida de tiempo en outreach  
* errores en automatización

## **SIGUIENTE PASO**

* validación de ICPs (B2B y Creadores)  
* configuración de Clay (T06)  
* implementación de scoring  
* conexión con Supabase

