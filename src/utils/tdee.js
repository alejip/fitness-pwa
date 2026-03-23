// Mifflin-St Jeor BMR formula
function calcBMR({ peso, altura, edad, sexo }) {
  if (!peso || !altura || !edad) return null
  const base = 10 * peso + 6.25 * altura - 5 * edad
  return sexo === 'mujer' ? base - 161 : base + 5
}

export const ACTIVITY_LEVELS = [
  { key: 'sedentario', label: 'Sedentario',  desc: 'Trabajo de escritorio, sin deporte' },
  { key: 'ligero',     label: 'Ligero',      desc: '1-3 días de ejercicio/semana' },
  { key: 'moderado',   label: 'Moderado',    desc: '3-5 días de ejercicio/semana' },
  { key: 'activo',     label: 'Activo',      desc: '6-7 días de ejercicio/semana' },
  { key: 'muyActivo',  label: 'Muy activo',  desc: 'Trabajo físico o entrenos 2x/día' },
]

const MULTIPLIERS = {
  sedentario: 1.2,
  ligero:     1.375,
  moderado:   1.55,
  activo:     1.725,
  muyActivo:  1.9,
}

const ADJUSTMENTS = {
  perdida:       -500,
  musculo:       +300,
  mantenimiento:    0,
  fuerza:        +150,
}

// Protein/carbs = 4 kcal/g, fat = 9 kcal/g
const MACRO_SPLITS = {
  perdida:       { p: 0.35, c: 0.35, f: 0.30 },
  musculo:       { p: 0.30, c: 0.45, f: 0.25 },
  mantenimiento: { p: 0.25, c: 0.45, f: 0.30 },
  fuerza:        { p: 0.28, c: 0.42, f: 0.30 },
}

export function calcularTDEE(perfil) {
  const bmr = calcBMR(perfil)
  if (!bmr) return null
  const mult = MULTIPLIERS[perfil.nivelActividad || 'moderado'] ?? 1.55
  const tdee = Math.round(bmr * mult)
  const adj  = ADJUSTMENTS[perfil.objetivo] ?? 0
  const kcal = tdee + adj
  const split = MACRO_SPLITS[perfil.objetivo] ?? MACRO_SPLITS.mantenimiento
  return {
    tdee,
    objetivoKcal: kcal,
    macros: {
      proteina: Math.round((kcal * split.p) / 4),
      carbos:   Math.round((kcal * split.c) / 4),
      grasa:    Math.round((kcal * split.f) / 9),
    },
  }
}
