import calendario from './00-CALENDARIO-SEMANAL-POR-PERSONA.md?raw'
import datosPrueba from './00-DATOS-PRUEBA-TEMPLATES.md?raw'
import dtos from './00-DTOs-DEPENDENCIAS-ENTRE-EQUIPOS.md?raw'
import contratacion from './00-LISTA-CONTRATACION-HERRAMIENTAS.md?raw'
import riesgos from './00-MAPA-RIESGOS.md?raw'
import presupuesto from './00-PRESUPUESTO-HERRAMIENTAS.md?raw'
import seguimiento from './00-SEGUIMIENTO-MAESTRO.md?raw'

export interface DocEntry {
  slug: string
  title: string
  description: string
  content: string
}

export const DOCS: DocEntry[] = [
  {
    slug: 'seguimiento-maestro',
    title: 'Seguimiento Maestro',
    description: 'Tracker de tareas, hitos, calendario y standup diario',
    content: seguimiento,
  },
  {
    slug: 'calendario-semanal',
    title: 'Calendario Semanal por Persona',
    description: 'Tareas dia a dia para cada integrante del equipo',
    content: calendario,
  },
  {
    slug: 'lista-contratacion',
    title: 'Lista de Contratacion de Herramientas',
    description: 'Inventario actual, compras pendientes, prioridades y checklist',
    content: contratacion,
  },
  {
    slug: 'presupuesto',
    title: 'Presupuesto de Herramientas',
    description: 'Costos, desglose semanal y resumen financiero',
    content: presupuesto,
  },
  {
    slug: 'dtos-dependencias',
    title: 'DTOs — Contratos de Dependencia',
    description: 'Interfaces entre equipos: que se entrega, cuando y en que formato',
    content: dtos,
  },
  {
    slug: 'mapa-riesgos',
    title: 'Mapa de Riesgos',
    description: '14 riesgos identificados con mitigacion y owners',
    content: riesgos,
  },
  {
    slug: 'datos-prueba',
    title: 'Datos de Prueba — Templates',
    description: 'Plantillas A, B, C, D para validacion de flujos E2E',
    content: datosPrueba,
  },
]
