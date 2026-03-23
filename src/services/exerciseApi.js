// Free Exercise DB — dataset estático público, sin API key
// https://yuhonas.github.io/free-exercise-db/

const EXERCISES_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
export const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

let _cache = null

async function fetchAll() {
  if (_cache) return _cache
  const res = await fetch(EXERCISES_URL)
  if (!res.ok) throw new Error('Error al cargar ejercicios')
  _cache = await res.json()
  return _cache
}

// Normalizaciones de texto para búsqueda
const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const exerciseService = {
  getAll: async (limit = 20, offset = 0) => {
    const all = await fetchAll()
    return all.slice(offset, offset + limit)
  },

  getByMuscle: async (muscle, limit = 20, offset = 0) => {
    const all = await fetchAll()
    const filtered = all.filter(ex =>
      ex.primaryMuscles?.some(m => norm(m) === norm(muscle)) ||
      ex.secondaryMuscles?.some(m => norm(m) === norm(muscle))
    )
    return filtered.slice(offset, offset + limit)
  },

  getByCategory: async (category, limit = 20, offset = 0) => {
    const all = await fetchAll()
    const filtered = all.filter(ex => norm(ex.category) === norm(category))
    return filtered.slice(offset, offset + limit)
  },

  getByEquipment: async (equipment, limit = 20, offset = 0) => {
    const all = await fetchAll()
    const filtered = all.filter(ex => norm(ex.equipment) === norm(equipment))
    return filtered.slice(offset, offset + limit)
  },

  getByName: async (query, limit = 20, offset = 0) => {
    const all = await fetchAll()
    const q = norm(query)
    const filtered = all.filter(ex => norm(ex.name).includes(q))
    return filtered.slice(offset, offset + limit)
  },

  getById: async (id) => {
    const all = await fetchAll()
    return all.find(ex => ex.id === id) || null
  },

  getMuscleList: async () => {
    const all = await fetchAll()
    const muscles = new Set()
    all.forEach(ex => {
      ex.primaryMuscles?.forEach(m => muscles.add(m))
    })
    return Array.from(muscles).sort()
  },

  getEquipmentList: async () => {
    const all = await fetchAll()
    const equip = new Set()
    all.forEach(ex => { if (ex.equipment) equip.add(ex.equipment) })
    return Array.from(equip).sort()
  },

  getTotalCount: async () => {
    const all = await fetchAll()
    return all.length
  },
}

export function getExerciseImageUrl(images = [], index = 0) {
  const img = images[index] || images[0]
  if (!img) return null
  return `${IMG_BASE}/${img}`
}
