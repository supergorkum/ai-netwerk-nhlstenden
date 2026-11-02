// Wachtwoord voor Beheer (verzoek van Edgar, 2 november 2026, v2.55). Hier staat
// alleen een gezouten PBKDF2-hash (SHA-256, 310.000 rondes); het wachtwoord zelf staat
// in .sleutels/ai-netwerk.env als BEHEERWACHTWOORD en mag nergens in git komen (de
// controle houdt dat tegen). Niet weghalen en het wachtwoord hier nooit als tekst
// terugzetten. Een nieuw wachtwoord: zie CLAUDE.md, "Beheerwachtwoord".
// Let op: dit is een controle in de browser, niet op de server.
export const BEHEER_SLOT = { zout: "cfa89ebe593f6834860e5415cd1d06dd", rondes: 310000, hash: "b593da1ce6b62473bce7ca2c1e070c43cae9d3206325a2054f9eeecb33255f83" }

export async function beheerWachtwoordKlopt(invoer) {
  if (!invoer) return false
  const enc = new TextEncoder()
  const zout = new Uint8Array(BEHEER_SLOT.zout.match(/../g).map(h => parseInt(h, 16)))
  const sleutel = await crypto.subtle.importKey("raw", enc.encode(invoer), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: zout, iterations: BEHEER_SLOT.rondes }, sleutel, 256)
  const hex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, "0")).join("")
  return hex === BEHEER_SLOT.hash
}
