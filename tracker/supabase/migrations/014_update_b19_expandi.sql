-- Migration 014: Update B19 with Expandi HubSpot integration findings

UPDATE blockers SET
  question = 'Expandi: verificar que licencia actual incluye integración HubSpot nativa',
  context = 'Expandi SI tiene integración nativa con HubSpot (sync bidireccional: contactos, mensajes, connection requests, interest level). Ref: https://intercom.help/expandi/en/articles/11697776-hubspot-integration. Config: Workspace > Integrations > HubSpot. Syncea: first_name, last_name, email, job_title, company, linkedin_url. Triggers: connection accepted, reply, interest change. PENDIENTE: verificar si la integración está disponible en el plan actual ($99/mes) o requiere upgrade. Solo workspace owners pueden habilitar.',
  status = 'respondida',
  answer = 'Expandi tiene HubSpot nativo. Falta verificar si está incluido en plan $99/mes. El flujo queda: Clay → Smartlead → HubSpot ↔ Expandi (bidireccional). No necesita Relay directo ni HTTP API.',
  answered_at = now()
WHERE code = 'B19';
