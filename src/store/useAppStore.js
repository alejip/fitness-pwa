import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Calcula 1RM estimado con fórmula Epley
function calc1RM(weight, reps) {
  if (!weight || !reps) return 0
  return weight * (1 + reps / 30)
}

export const useAppStore = create(
  persist(
    (set, get) => ({

      // ── RUTINAS ──────────────────────────────────────────────────────────
      routines: [],

      addRoutine: (routine) =>
        set((s) => ({
          routines: [...s.routines, { ...routine, id: Date.now(), createdAt: new Date().toISOString(), exercises: [] }],
        })),

      updateRoutine: (id, updates) =>
        set((s) => ({ routines: s.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)) })),

      deleteRoutine: (id) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),

      addExerciseToRoutine: (routineId, exercise) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, exercises: [...r.exercises, { ...exercise, sets: 3, reps: 12, weight: 0, restSeconds: 60 }] }
              : r
          ),
        })),

      updateExerciseInRoutine: (routineId, exerciseId, updates) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, exercises: r.exercises.map((e) => (e.id === exerciseId ? { ...e, ...updates } : e)) }
              : r
          ),
        })),

      removeExerciseFromRoutine: (routineId, exerciseId) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId ? { ...r, exercises: r.exercises.filter((e) => e.id !== exerciseId) } : r
          ),
        })),

      // ── ENTRENAMIENTO ACTIVO ─────────────────────────────────────────────
      activeWorkout: null,

      startWorkout: (rutina) => {
        const session = {
          routineId:   rutina.id,
          routineName: rutina.name,
          startedAt:   new Date().toISOString(),
          exercises: rutina.exercises.map((ex) => ({
            exerciseId:     ex.id,
            name:           ex.name,
            primaryMuscles: ex.primaryMuscles,
            images:         ex.images,
            restSeconds:    ex.restSeconds || 60,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
              setIndex:      i,
              targetReps:    ex.reps,
              targetWeight:  ex.weight,
              actualReps:    ex.reps,    // pre-rellenado con el objetivo
              actualWeight:  ex.weight,
              done:          false,
              doneAt:        null,
            })),
          })),
        }
        set({ activeWorkout: session })
      },

      updateSetInWorkout: (exerciseId, setIndex, updates) =>
        set((s) => ({
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map((ex) =>
              ex.exerciseId === exerciseId
                ? { ...ex, sets: ex.sets.map((set) => (set.setIndex === setIndex ? { ...set, ...updates } : set)) }
                : ex
            ),
          },
        })),

      completeSetInWorkout: (exerciseId, setIndex) =>
        set((s) => ({
          activeWorkout: {
            ...s.activeWorkout,
            exercises: s.activeWorkout.exercises.map((ex) =>
              ex.exerciseId === exerciseId
                ? {
                    ...ex,
                    sets: ex.sets.map((st) =>
                      st.setIndex === setIndex ? { ...st, done: true, doneAt: new Date().toISOString() } : st
                    ),
                  }
                : ex
            ),
          },
        })),

      finishWorkout: () => {
        const { activeWorkout, workoutHistory } = get()
        if (!activeWorkout) return

        const endedAt = new Date()
        const startedAt = new Date(activeWorkout.startedAt)
        const durationSeconds = Math.floor((endedAt - startedAt) / 1000)

        // Calcular volumen y series completadas
        let totalVolumeKg = 0
        let setsCompleted = 0
        activeWorkout.exercises.forEach((ex) => {
          ex.sets.forEach((st) => {
            if (st.done) {
              setsCompleted++
              totalVolumeKg += (st.actualWeight || 0) * (st.actualReps || 0)
            }
          })
        })

        // Detectar récords personales (1RM estimado por ejercicio)
        const prs = []
        activeWorkout.exercises.forEach((ex) => {
          const best1RM = Math.max(
            ...ex.sets.filter((s) => s.done).map((s) => calc1RM(s.actualWeight, s.actualReps)),
            0
          )
          if (!best1RM) return

          // Buscar el mejor 1RM histórico para este ejercicio
          let prev1RM = 0
          workoutHistory.forEach((session) => {
            session.exercises?.forEach((histEx) => {
              if (histEx.exerciseId === ex.exerciseId) {
                histEx.sets?.forEach((s) => {
                  const rm = calc1RM(s.actualWeight, s.actualReps)
                  if (rm > prev1RM) prev1RM = rm
                })
              }
            })
          })

          if (best1RM > prev1RM) {
            prs.push({
              exerciseId:    ex.exerciseId,
              exerciseName:  ex.name,
              new1RM:        Math.round(best1RM * 10) / 10,
              previous1RM:   Math.round(prev1RM * 10) / 10,
            })
          }
        })

        const entry = {
          id:              Date.now(),
          routineId:       activeWorkout.routineId,
          routineName:     activeWorkout.routineName,
          date:            endedAt.toISOString(),
          startedAt:       activeWorkout.startedAt,
          durationSeconds,
          totalVolumeKg:   Math.round(totalVolumeKg),
          setsCompleted,
          prs,
          exercises:       activeWorkout.exercises,
        }

        set((s) => ({
          workoutHistory: [...s.workoutHistory, entry],
          activeWorkout:  null,
        }))

        return entry
      },

      cancelWorkout: () => set({ activeWorkout: null }),

      // ── DIETA ────────────────────────────────────────────────────────────
      dietPlans: [],
      todayLog:  [],

      addDietPlan: (plan) =>
        set((s) => ({
          dietPlans: [...s.dietPlans, { ...plan, id: Date.now(), createdAt: new Date().toISOString(), meals: [] }],
        })),

      addMealToPlan: (planId, meal) =>
        set((s) => ({
          dietPlans: s.dietPlans.map((p) =>
            p.id === planId ? { ...p, meals: [...p.meals, { ...meal, id: Date.now() }] } : p
          ),
        })),

      deleteDietPlan: (id) =>
        set((s) => ({ dietPlans: s.dietPlans.filter((p) => p.id !== id) })),

      logFood: (entry) =>
        set((s) => ({ todayLog: [...s.todayLog, { ...entry, id: Date.now(), time: new Date().toISOString() }] })),

      removeFromLog: (id) =>
        set((s) => ({ todayLog: s.todayLog.filter((e) => e.id !== id) })),

      clearTodayLog: () => set({ todayLog: [] }),

      // ── HISTORIAL ────────────────────────────────────────────────────────
      workoutHistory: [],

      logWorkout: (routineId, exercises) =>
        set((s) => ({
          workoutHistory: [
            ...s.workoutHistory,
            { id: Date.now(), routineId, exercises, date: new Date().toISOString() },
          ],
        })),

      // ── PESO CORPORAL ────────────────────────────────────────────────────
      weightLog: [],

      logWeight: (kg, note = '') =>
        set((s) => ({
          weightLog: [...s.weightLog, { id: Date.now(), kg: Number(kg), note, date: new Date().toISOString() }],
        })),

      deleteWeightEntry: (id) =>
        set((s) => ({ weightLog: s.weightLog.filter((e) => e.id !== id) })),

      // ── TEMA ─────────────────────────────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // ── PERFIL ───────────────────────────────────────────────────────────
      perfil: null,

      setPerfil: (datos) => set({ perfil: datos }),

      generarRutinasPredefinidas: (rutinas) =>
        set((s) => ({
          routines: [
            ...s.routines,
            ...rutinas.map((r) => ({
              ...r,
              id: Date.now() + Math.random(),
              createdAt: new Date().toISOString(),
              predefinida: true,
            })),
          ],
        })),
    }),
    { name: 'fitness-pwa-storage' }
  )
)
