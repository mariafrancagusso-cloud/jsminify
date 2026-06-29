// lib/minifier.js
// Port direto da lógica PHP original

export function minifyJS(code) {
  // Remove comentários de bloco /* ... */
  code = code.replace(/\/\*[\s\S]*?\*\//g, '')

  // Remove comentários de linha // (preserva strings)
  code = code.replace(/(["'`](?:[^"'`\\]|\\.)*["'`])|\/\/[^\n]*/g, (m, str) => str || '')

  // Colapsa whitespace
  code = code.replace(/\s+/g, ' ')

  // Remove espaços ao redor de operadores
  code = code.replace(/\s*([{}\[\]();,=+\-*\/%&|^~<>!?:])\s*/g, '$1')

  // Restaura espaço após keywords
  const keywords = [
    'return','typeof','instanceof','in','of','new','delete','void','throw',
    'var','let','const','function','class','extends','import','export',
    'if','else','for','while','do','switch','case','break','continue',
    'try','catch','finally','async','await','yield','from','default'
  ]
  for (const kw of keywords) {
    code = code.replace(new RegExp(`\\b(${kw})\\b([a-zA-Z0-9_$])`, 'g'), '$1 $2')
  }

  return code.trim()
}

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' B'
}
