export interface DtoInfo {
  id: string
  title: string
  direction: 'IN' | 'OUT'
  from: string
  to: string
  deadline: string
}

export const DTO_MAP: Record<string, DtoInfo> = {
  'DTO-01': { id: 'DTO-IN-01', title: 'ICP B2B', direction: 'IN', from: 'Equipo 1 (Marketing)', to: 'Equipo 3 (Eugenia → Gabriel)', deadline: '7 Abr' },
  'DTO-02': { id: 'DTO-IN-02', title: 'ICP Creadores', direction: 'IN', from: 'Equipo 2 (Creadores)', to: 'Equipo 3 (Eugenia → Gabriel)', deadline: '7 Abr' },
  'DTO-03': { id: 'DTO-IN-03', title: 'Audio para Clonacion de Voz', direction: 'IN', from: 'Equipo 2 (Creadores)', to: 'Equipo 3 (Dayana)', deadline: '10 Abr' },
  'DTO-04': { id: 'DTO-IN-04', title: 'Aprobacion Flujos ManyChat', direction: 'IN', from: 'Equipo 2 (Mery)', to: 'Equipo 3 (Dayana)', deadline: '16 Abr' },
  'DTO-05': { id: 'DTO-IN-05', title: 'Aprobacion Plantillas Email B2B', direction: 'IN', from: 'Equipo 1 → Equipo 4', to: 'Equipo 3 carga', deadline: '20 Abr' },
  'DTO-06': { id: 'DTO-OUT-03', title: 'Cascada Clay 1,000 Prospectos', direction: 'OUT', from: 'Equipo 3 (Gabriel)', to: 'Equipo 4 (Contenido)', deadline: '14 Abr' },
  'DTO-07': { id: 'DTO-OUT-06', title: 'ManyChat Flujos', direction: 'OUT', from: 'Equipo 3 (Dayana)', to: 'Equipo 2 review + Equipo 4', deadline: '15 Abr' },
  'DTO-08': { id: 'DTO-OUT-07', title: 'Sendspark Configurado', direction: 'OUT', from: 'Equipo 3', to: 'Equipo 4 + Equipo 1', deadline: '13 Abr' },
  'DTO-09': { id: 'DTO-OUT-04', title: 'Smartlead Configurado', direction: 'OUT', from: 'Equipo 3', to: 'Equipo 4', deadline: '9 Abr' },
  'DTO-10': { id: 'DTO-OUT-05', title: 'Expandi Configurado', direction: 'OUT', from: 'Equipo 3', to: 'Equipo 4', deadline: '10 Abr' },
  'DTO-11': { id: 'DTO-OUT-10', title: 'Micrositios + Lead Magnets', direction: 'OUT', from: 'Equipo 3 (Lillian)', to: 'Equipos 1+2 aprueban', deadline: '21 Abr' },
  'DTO-12': { id: 'DTO-OUT-08', title: 'ElevenLabs Clon de Voz', direction: 'OUT', from: 'Equipo 3', to: 'Equipo 2 aprueba + Equipo 4', deadline: '16 Abr' },
}

export function isDto(ref: string): boolean {
  return ref.startsWith('DTO-')
}

export function getDtoInfo(ref: string): DtoInfo | undefined {
  return DTO_MAP[ref]
}
