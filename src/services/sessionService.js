const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous: 0,O,1,I

export function generateSessionCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}
