// Plantillas de rutinas predefinidas por objetivo y sexo.
// Los IDs corresponden a ejercicios reales del dataset free-exercise-db.

// series, reps y peso iniciales según nivel y objetivo
const cfg = {
  perdida:      { sets: 3, reps: 15, weight: 0, restSeconds: 45  },
  hipertrofia:  { sets: 4, reps: 10, weight: 0, restSeconds: 75  },
  mantenimiento:{ sets: 3, reps: 12, weight: 0, restSeconds: 60  },
  fuerza:       { sets: 5, reps: 5,  weight: 0, restSeconds: 120 },
}

// Ajuste de peso inicial estimado por sexo y peso corporal
export function estimarPeso(ejercicio, sexo, pesoCorporal) {
  const factores = {
    'Barbell_Bench_Press_-_Medium_Grip': { H: 0.6, M: 0.35 },
    'Barbell_Full_Squat':                { H: 0.8, M: 0.5  },
    'Barbell_Deadlift':                  { H: 1.0, M: 0.6  },
    'Barbell_Shoulder_Press':            { H: 0.4, M: 0.25 },
    'Romanian_Deadlift':                 { H: 0.7, M: 0.45 },
    'Barbell_Hip_Thrust':                { H: 0.7, M: 0.55 },
    'Dumbbell_Bicep_Curl':               { H: 0.15, M: 0.09 },
  }
  const factor = factores[ejercicio]?.[sexo === 'hombre' ? 'H' : 'M']
  if (!factor) return 0
  return Math.round((pesoCorporal * factor) / 2.5) * 2.5 // redondear a 2.5kg
}

export const PLANTILLAS = {
  // ── PERDER PESO ──────────────────────────────────────────────────────────
  perdida_hombre: [
    {
      name: 'Full Body A - Quema de grasa',
      description: 'Circuito de cuerpo completo con alta intensidad',
      exercises: [
        { id: 'Barbell_Full_Squat',           ...cfg.perdida },
        { id: 'Barbell_Bench_Press_-_Medium_Grip', ...cfg.perdida },
        { id: 'Bent_Over_Two-Dumbbell_Row',   ...cfg.perdida },
        { id: 'Mountain_Climbers',            ...cfg.perdida },
        { id: 'Plank',                        sets: 3, reps: 1, weight: 0, restSeconds: 30 },
      ],
    },
    {
      name: 'Full Body B - Quema de grasa',
      description: 'Movimientos compuestos para maximizar el gasto calórico',
      exercises: [
        { id: 'Barbell_Deadlift',             ...cfg.perdida },
        { id: 'Barbell_Shoulder_Press',       ...cfg.perdida },
        { id: 'Band_Assisted_Pull-Up',        ...cfg.perdida },
        { id: 'Rope_Jumping',                 sets: 4, reps: 1, weight: 0, restSeconds: 30 },
        { id: 'Step-up_with_Knee_Raise',      ...cfg.perdida },
      ],
    },
  ],

  perdida_mujer: [
    {
      name: 'Tren inferior A - Quema de grasa',
      description: 'Piernas y glúteos con alta repetición',
      exercises: [
        { id: 'Goblet_Squat',                 ...cfg.perdida },
        { id: 'Romanian_Deadlift',            ...cfg.perdida },
        { id: 'Barbell_Lunge',                ...cfg.perdida },
        { id: 'Step-up_with_Knee_Raise',      ...cfg.perdida },
        { id: 'Mountain_Climbers',            ...cfg.perdida },
      ],
    },
    {
      name: 'Cuerpo completo - Quema de grasa',
      description: 'Circuito funcional para todo el cuerpo',
      exercises: [
        { id: 'Clock_Push-Up',                ...cfg.perdida },
        { id: 'Barbell_Glute_Bridge',         ...cfg.perdida },
        { id: 'Bent_Over_Two-Dumbbell_Row',   ...cfg.perdida },
        { id: 'Rope_Jumping',                 sets: 4, reps: 1, weight: 0, restSeconds: 30 },
        { id: 'Plank',                        sets: 3, reps: 1, weight: 0, restSeconds: 30 },
      ],
    },
  ],

  // ── GANAR MÚSCULO ────────────────────────────────────────────────────────
  musculo_hombre: [
    {
      name: 'Empuje (Pecho / Hombros / Tríceps)',
      description: 'Día de press y empuje — hipertrofia',
      exercises: [
        { id: 'Barbell_Bench_Press_-_Medium_Grip', ...cfg.hipertrofia },
        { id: 'Barbell_Shoulder_Press',           ...cfg.hipertrofia },
        { id: 'Bench_Dips',                       ...cfg.hipertrofia },
        { id: 'Dumbbell_Bicep_Curl',              ...cfg.hipertrofia },
      ],
    },
    {
      name: 'Tracción (Espalda / Bíceps)',
      description: 'Día de remo y dominadas — hipertrofia',
      exercises: [
        { id: 'Band_Assisted_Pull-Up',        ...cfg.hipertrofia },
        { id: 'Bent_Over_Two-Dumbbell_Row',   ...cfg.hipertrofia },
        { id: 'Close-Grip_Front_Lat_Pulldown',...cfg.hipertrofia },
        { id: 'Face_Pull',                    ...cfg.hipertrofia },
        { id: 'Dumbbell_Bicep_Curl',          ...cfg.hipertrofia },
      ],
    },
    {
      name: 'Piernas (Cuádriceps / Isquios / Glúteos)',
      description: 'Día de pierna completo — hipertrofia',
      exercises: [
        { id: 'Barbell_Full_Squat',           ...cfg.hipertrofia },
        { id: 'Romanian_Deadlift',            ...cfg.hipertrofia },
        { id: 'Barbell_Lunge',                ...cfg.hipertrofia },
        { id: 'Leg_Extensions',               ...cfg.hipertrofia },
        { id: 'Barbell_Seated_Calf_Raise',    ...cfg.hipertrofia },
      ],
    },
  ],

  musculo_mujer: [
    {
      name: 'Tren inferior A (Glúteos y Cuádriceps)',
      description: 'Enfoque en glúteos y piernas — hipertrofia',
      exercises: [
        { id: 'Barbell_Full_Squat',     ...cfg.hipertrofia },
        { id: 'Barbell_Hip_Thrust',     ...cfg.hipertrofia },
        { id: 'Romanian_Deadlift',      ...cfg.hipertrofia },
        { id: 'Step-up_with_Knee_Raise',...cfg.hipertrofia },
        { id: 'Barbell_Seated_Calf_Raise',...cfg.hipertrofia },
      ],
    },
    {
      name: 'Tren inferior B (Isquios y Glúteos)',
      description: 'Cadena posterior — hipertrofia',
      exercises: [
        { id: 'Barbell_Deadlift',       ...cfg.hipertrofia },
        { id: 'Goblet_Squat',           ...cfg.hipertrofia },
        { id: 'Barbell_Glute_Bridge',   ...cfg.hipertrofia },
        { id: 'Barbell_Lunge',          ...cfg.hipertrofia },
        { id: 'Ball_Leg_Curl',          ...cfg.hipertrofia },
      ],
    },
    {
      name: 'Tren superior (Espalda, Hombros y Brazos)',
      description: 'Tonificación de la parte superior',
      exercises: [
        { id: 'Band_Assisted_Pull-Up',        ...cfg.hipertrofia },
        { id: 'Bent_Over_Two-Dumbbell_Row',   ...cfg.hipertrofia },
        { id: 'Barbell_Shoulder_Press',       ...cfg.hipertrofia },
        { id: 'Clock_Push-Up',                ...cfg.hipertrofia },
        { id: 'Dumbbell_Bicep_Curl',          ...cfg.hipertrofia },
      ],
    },
  ],

  // ── MANTENIMIENTO ────────────────────────────────────────────────────────
  mantenimiento_hombre: [
    {
      name: 'Full Body A',
      description: 'Cuerpo completo — 3 veces por semana',
      exercises: [
        { id: 'Barbell_Full_Squat',                ...cfg.mantenimiento },
        { id: 'Barbell_Bench_Press_-_Medium_Grip', ...cfg.mantenimiento },
        { id: 'Bent_Over_Two-Dumbbell_Row',        ...cfg.mantenimiento },
        { id: 'Barbell_Shoulder_Press',            ...cfg.mantenimiento },
        { id: 'Plank', sets: 3, reps: 1, weight: 0, restSeconds: 45 },
      ],
    },
    {
      name: 'Full Body B',
      description: 'Cuerpo completo — variante B',
      exercises: [
        { id: 'Barbell_Deadlift',             ...cfg.mantenimiento },
        { id: 'Band_Assisted_Pull-Up',        ...cfg.mantenimiento },
        { id: 'Barbell_Lunge',                ...cfg.mantenimiento },
        { id: 'Bench_Dips',                   ...cfg.mantenimiento },
        { id: 'Dumbbell_Bicep_Curl',          ...cfg.mantenimiento },
      ],
    },
  ],

  mantenimiento_mujer: [
    {
      name: 'Full Body A',
      description: 'Cuerpo completo — 3 veces por semana',
      exercises: [
        { id: 'Goblet_Squat',                 ...cfg.mantenimiento },
        { id: 'Barbell_Hip_Thrust',           ...cfg.mantenimiento },
        { id: 'Clock_Push-Up',                ...cfg.mantenimiento },
        { id: 'Bent_Over_Two-Dumbbell_Row',   ...cfg.mantenimiento },
        { id: 'Plank', sets: 3, reps: 1, weight: 0, restSeconds: 45 },
      ],
    },
    {
      name: 'Full Body B',
      description: 'Cuerpo completo — variante B',
      exercises: [
        { id: 'Romanian_Deadlift',            ...cfg.mantenimiento },
        { id: 'Barbell_Lunge',                ...cfg.mantenimiento },
        { id: 'Band_Assisted_Pull-Up',        ...cfg.mantenimiento },
        { id: 'Barbell_Shoulder_Press',       ...cfg.mantenimiento },
        { id: 'Dumbbell_Bicep_Curl',          ...cfg.mantenimiento },
      ],
    },
  ],

  // ── FUERZA ───────────────────────────────────────────────────────────────
  fuerza_hombre: [
    {
      name: 'Día de sentadilla',
      description: 'Sentadilla como movimiento principal — fuerza',
      exercises: [
        { id: 'Barbell_Full_Squat',       ...cfg.fuerza },
        { id: 'Romanian_Deadlift',        sets: 3, reps: 8, weight: 0, restSeconds: 120 },
        { id: 'Barbell_Lunge',            sets: 3, reps: 8, weight: 0, restSeconds: 90  },
        { id: 'Leg_Extensions',           sets: 3, reps: 10, weight: 0, restSeconds: 60 },
      ],
    },
    {
      name: 'Día de press banca',
      description: 'Banca como movimiento principal — fuerza',
      exercises: [
        { id: 'Barbell_Bench_Press_-_Medium_Grip', ...cfg.fuerza },
        { id: 'Barbell_Shoulder_Press',            sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Bench_Dips',                        sets: 3, reps: 8, weight: 0, restSeconds: 90  },
        { id: 'Face_Pull',                         sets: 3, reps: 12, weight: 0, restSeconds: 60 },
      ],
    },
    {
      name: 'Día de peso muerto',
      description: 'Peso muerto como movimiento principal — fuerza',
      exercises: [
        { id: 'Barbell_Deadlift',                  ...cfg.fuerza },
        { id: 'Band_Assisted_Pull-Up',             sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Bent_Over_Two-Dumbbell_Row',        sets: 3, reps: 8, weight: 0, restSeconds: 90  },
        { id: 'Close-Grip_Front_Lat_Pulldown',     sets: 3, reps: 10, weight: 0, restSeconds: 60 },
      ],
    },
  ],

  fuerza_mujer: [
    {
      name: 'Tren inferior — Fuerza',
      description: 'Sentadilla y peso muerto pesados',
      exercises: [
        { id: 'Barbell_Full_Squat',   ...cfg.fuerza },
        { id: 'Barbell_Deadlift',     sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Barbell_Hip_Thrust',   sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Romanian_Deadlift',    sets: 3, reps: 8, weight: 0, restSeconds: 90  },
      ],
    },
    {
      name: 'Tren superior — Fuerza',
      description: 'Press y tracción pesados',
      exercises: [
        { id: 'Barbell_Bench_Press_-_Medium_Grip', ...cfg.fuerza },
        { id: 'Band_Assisted_Pull-Up',             sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Barbell_Shoulder_Press',            sets: 4, reps: 6, weight: 0, restSeconds: 120 },
        { id: 'Bent_Over_Two-Dumbbell_Row',        sets: 3, reps: 8, weight: 0, restSeconds: 90  },
      ],
    },
  ],
}

export const OBJETIVOS = [
  { key: 'perdida',       label: 'Perder peso',     emoji: '🔥', desc: 'Quemar grasa y mejorar la resistencia' },
  { key: 'musculo',       label: 'Ganar músculo',   emoji: '💪', desc: 'Aumentar masa muscular (hipertrofia)' },
  { key: 'mantenimiento', label: 'Mantenimiento',   emoji: '⚖️', desc: 'Mantener forma física con 2-3 días/semana' },
  { key: 'fuerza',        label: 'Fuerza máxima',   emoji: '🏋️', desc: 'Aumentar fuerza en los movimientos básicos' },
]
