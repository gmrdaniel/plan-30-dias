// Sustituye {{var}} con el valor de la persona activa. Usado solo en preview.
// Si la persona no tiene el campo, deja el literal {{var}} — así Ana nota
// variables mal escritas o no seteadas en esa persona.
//
// Excluye {{link}} y {{qr}} — esos los maneja renderPlaceholders con la
// config del template, no con la persona.

const SPECIAL = new Set(['link', 'qr'])

export function substituteVars(
  text: string,
  variables: Record<string, string>,
): string {
  return text.replace(/\{\{\s*([^}|]+?)\s*\}\}/g, (match, name: string) => {
    const key = name.trim()
    if (SPECIAL.has(key)) return match
    const value = variables[key]
    return value !== undefined && value !== '' ? value : match
  })
}

export function extractVarNames(text: string): string[] {
  const out = new Set<string>()
  const re = /\{\{\s*([^}]+?)\s*\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const raw = m[1].split('|')[0].trim()
    if (raw) out.add(raw)
  }
  return [...out]
}
