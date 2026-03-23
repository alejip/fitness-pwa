// Traducción en tiempo real usando la API no oficial de Google Translate.
// Gratuita, sin API key, con caché en memoria para no repetir peticiones.

const cache = new Map()

async function translateText(text) {
  if (!text?.trim()) return text
  if (cache.has(text)) return cache.get(text)

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = await res.json()
    // La respuesta viene en data[0] como array de [traducido, original]
    const translated = data[0]?.map(chunk => chunk[0]).join('') || text
    cache.set(text, translated)
    return translated
  } catch {
    return text // si falla, devolvemos el original en inglés
  }
}

export async function translateList(texts = []) {
  return Promise.all(texts.map(translateText))
}

export default translateText
