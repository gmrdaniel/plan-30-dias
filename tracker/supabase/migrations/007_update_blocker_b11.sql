-- Migration 007: Update blocker B11 with Opcion A strategy

UPDATE blockers SET
  question = 'Clay: empezar con plan Base ($149) y medir creditos en batch 1 de 200 prospectos',
  context = 'Estrategia Opcion A: NO hacer upgrade por adelantado. Correr primer batch de 200 prospectos con plan Base (~2,000 creditos). Medir creditos consumidos por prospecto. Si <= 2 creditos/prospecto → Base alcanza para 1,000. Si > 2 → upgrade a Pro ($495, ~50,000 creditos) inmediato. Gabriel mide y reporta a Daniel. Daniel aprueba upgrade el mismo dia si es necesario. Ver detalle completo en T06.',
  asks_to = 'Gabriel mide, Daniel decide'
WHERE code = 'B11';
