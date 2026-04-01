-- Migration 015: Add 6 pipeline gaps as blockers

INSERT INTO blockers (code, category, question, context, owner, asks_to, needed_by, related_tasks) VALUES

('G1', 'Infraestructura',
 'Slybroadcast no tiene integración con HubSpot — voicemail Día 7 no se logea',
 'Slybroadcast envía voicemail sin timbre pero no reporta a HubSpot si se entregó o no. El vendedor no sabe si el prospecto recibió el voicemail. Opciones: (1) Ignorar — es complementario, no crítico. (2) Log manual en HubSpot después de cada batch de voicemails. (3) Buscar alternativa que sí integre (Drop Cowboy tiene Zapier).',
 'Daniel', 'Daniel decide', '17 Abr (antes de Fase 3)', 'T10'),

('G2', 'Definicion',
 '¿Expandi pausa automáticamente si el prospecto respondió por otro canal (email/SMS)?',
 'Si un prospecto responde el Email #1 en Smartlead pero Expandi sigue enviando mensajes de LinkedIn, se ve como spam y daña la relación. Necesitamos verificar: ¿Expandi tiene "stop on reply from other channel"? ¿Se puede configurar via HubSpot (si status cambia a Respondido, Expandi pausa)? Esto requiere que Expandi ↔ HubSpot estén sincronizados.',
 'Dayana (verifica en Expandi)', 'Documentación Expandi', '17 Abr (antes de Fase 3)', 'T07'),

('G3', 'Definicion',
 '¿Smartlead pausa automáticamente si el prospecto respondió por LinkedIn (Expandi)?',
 'Mismo problema inverso: si el prospecto acepta LinkedIn y responde DM en Expandi, pero Smartlead sigue enviando emails programados, se duplica el contacto. Verificar: ¿Smartlead tiene trigger para pausar secuencia basado en cambio de status en HubSpot? ¿O hay que pausar manualmente?',
 'Gabriel (verifica en Smartlead)', 'Documentación Smartlead', '17 Abr (antes de Fase 3)', 'T07'),

('G4', 'Definicion',
 '¿Supabase necesita tracking de eventos de la secuencia o solo datos iniciales del prospecto?',
 'Actualmente Supabase recibe datos del prospecto (T11-B: empresa, contacto, score). Pero NO recibe eventos de la secuencia (email abierto, LinkedIn aceptado, reply, etc.). HubSpot sí tiene todo el tracking. Pregunta: ¿es suficiente HubSpot como log de eventos? ¿O necesitamos replicar en Supabase para analytics propios? Si solo HubSpot, no hay trabajo extra. Si Supabase también, hay que crear tabla de eventos y webhooks.',
 'Daniel', 'Daniel decide', '17 Abr (antes de Fase 3)', 'T11-B'),

('G5', 'Definicion',
 '¿Quién mueve prospectos sin respuesta a lista Nurture automáticamente después de Día 21?',
 'Cuando la secuencia de 21 días termina sin respuesta, el prospecto debe moverse a una lista "Nurture" (solo boletines mensuales, no más outreach activo). Opciones: (1) HubSpot workflow automático: si status = "Sin respuesta" después de 21 días → mover a lista Nurture. (2) Smartlead tiene status "Unresponsive" → webhook a HubSpot → workflow. (3) Manual: Gabriel revisa semanalmente. Recomendación: opción 2 (Smartlead → HubSpot → automático).',
 'Gabriel + Daniel', 'Daniel decide', '28 Abr (antes de Fase 5)', 'T18'),

('G6', 'Definicion',
 'Segmentación por país: WhatsApp Día 15 solo para LatAm — ¿cómo se filtra?',
 'La secuencia incluye nota de voz WhatsApp el Día 15 pero SOLO para prospectos en LatAm. Prospectos en US no deben recibir WhatsApp (no es canal business allá). Necesitamos: (1) Que Clay enriquezca el campo "country" correctamente. (2) Que Smartlead/ManyChat tenga un conditional: si country = Mexico/Colombia/etc → enviar WhatsApp. Si country = US → skip. Verificar si Smartlead soporta branching condicional en secuencias.',
 'Gabriel (verifica en Smartlead) + Dayana (ManyChat)', 'Documentación Smartlead/ManyChat', '17 Abr (antes de Fase 3)', 'T08, T12');
