# T03 — Slack + Relay.app Alertas

## Información General
| Campo | Valor |
|-------|-------|
| **ID** | T03 |
| **Prioridad** | 🔴 CRITICA |
| **Responsable** | Eugenia García |
| **Fecha Inicio** | Martes 7 Abril |
| **Fecha Entrega** | Martes 7 Abril |
| **Bloqueada por** | — |
| **Bloquea a** | T14, T18, DTO-OUT-02 |

## Objetivo
Workspace de Slack operativo con canales por función y alertas automáticas desde HubSpot vía Relay.app.

## Detalle de Implementación

### Paso 1: Crear Workspace Slack (Free tier)
- Ir a slack.com → Create a workspace
- Nombre: "La Neta - Sprint Escalamiento" (o el que Daniel indique)
- Invitar a todos los miembros de los 4 equipos

### Paso 2: Crear Canales
| Canal | Propósito | Quién debe estar |
|-------|-----------|-----------------|
| #leads-b2b-calientes | Alertas automáticas de leads B2B de alta intención | Equipo 1, Daniel |
| #creadores-nuevos | Alertas de nuevos creadores del pipeline | Equipo 2, Daniel |
| #salud-dominios | Reportes diarios de Gabriel sobre reputación email | Equipo 3, Equipo 4 |
| #standup-diario | Standup async 9 AM | Todos los líderes |
| #general-sprint | Comunicación general del sprint | Todos |

### Paso 3: Configurar Relay.app ($9/mes)
1. Ir a relay.app → Sign up
2. Conectar HubSpot como fuente
3. Conectar Slack como destino
4. Crear relay (automatización):
   - **Trigger:** Nuevo contacto en HubSpot con `icp_score >= 7`
   - **Acción:** Enviar mensaje a #leads-b2b-calientes
   - **Formato:** "🔥 Nuevo lead caliente: {nombre} | {empresa} | Score: {icp_score} | [Ver en HubSpot](link)"
5. Crear segundo relay:
   - **Trigger:** Nuevo contacto en pipeline Creadores
   - **Acción:** Enviar mensaje a #creadores-nuevos
   - **Formato:** "🎬 Nuevo creador: {nombre} | {plataforma} | {suscriptores} | [Ver](link)"

### Paso 4: Enviar Alerta de Prueba
- Pedir a Daniel que cree un contacto de prueba en HubSpot con icp_score = 8
- Verificar que la alerta llega a #leads-b2b-calientes
- Verificar que todos los equipos la ven

## Entregables
- [ ] Workspace Slack creado con 5 canales
- [ ] Todos los miembros de los 4 equipos invitados
- [ ] Relay.app configurado con 2 automatizaciones
- [ ] Alerta de prueba recibida exitosamente en Slack
- [ ] Screenshot de la alerta funcionando

## Criterios de Aceptación
- [ ] Al crear un lead en HubSpot con score >= 7, aparece mensaje en #leads-b2b-calientes en menos de 5 minutos
- [ ] Todos los líderes de equipo confirman que recibieron la alerta de prueba
- [ ] Canales tienen las personas correctas

## Costo
| Item | Costo |
|------|-------|
| Slack Free | $0 |
| Relay.app | $9/mes |

## Notas para Eugenia
- Relay.app es similar a Zapier pero más simple. Tiene interfaz visual, no necesitas código.
- Si Relay.app no soporta el trigger que necesitas de HubSpot, usa Zapier Free (tiene 100 tareas/mes).
- Documenta paso a paso lo que configuraste (capturas de pantalla) para que alguien más pueda mantenerlo.
- Pide a Daniel que te dé acceso admin a HubSpot antes de empezar con Relay.app.
- El canal #standup-diario es donde cada persona postea su update a las 9 AM. Puedes fijar un mensaje con el formato.
