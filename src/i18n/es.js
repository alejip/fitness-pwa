// Traducciones español España

export const MUSCLES_ES = {
  abdominals: 'Abdominales',
  hamstrings: 'Isquiotibiales',
  adductors: 'Aductores',
  abductors: 'Abductores',
  calves: 'Pantorrillas',
  shoulders: 'Hombros',
  chest: 'Pecho',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quadriceps: 'Cuádriceps',
  glutes: 'Glúteos',
  lats: 'Dorsal ancho',
  'middle back': 'Espalda media',
  'lower back': 'Lumbar',
  traps: 'Trapecios',
  forearms: 'Antebrazos',
  neck: 'Cuello',
  'lower back': 'Lumbar',
  brachialis: 'Braquial',
  soleus: 'Sóleo',
  piriformis: 'Piriforme',
  'hip flexors': 'Flexores de cadera',
  'iliocostalis lumborum': 'Iliocostal lumbar',
}

export const EQUIPMENT_ES = {
  'body only': 'Peso corporal',
  machine: 'Máquina',
  'other': 'Otro',
  foam_roll: 'Foam roller',
  dumbbell: 'Mancuernas',
  barbell: 'Barra',
  'kettlebells': 'Kettlebell',
  bands: 'Bandas elásticas',
  'medicine ball': 'Balón medicinal',
  'exercise ball': 'Fitball',
  cable: 'Polea',
  'e-z curl bar': 'Barra EZ',
}

export const LEVEL_ES = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

export const CATEGORY_ES = {
  strength: 'Fuerza',
  stretching: 'Estiramientos',
  cardio: 'Cardio',
  plyometrics: 'Pliometría',
  powerlifting: 'Powerlifting',
  'olympic weightlifting': 'Halterofilia',
  strongman: 'Strongman',
}

export const FORCE_ES = {
  pull: 'Tracción',
  push: 'Empuje',
  static: 'Estático',
}

export const MEAL_TYPES = [
  'Desayuno',
  'Media mañana',
  'Almuerzo',
  'Merienda',
  'Cena',
  'Post-entreno',
]

export function t(map, key) {
  return map[key?.toLowerCase()] || key || '—'
}
