import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import useElapsedTimer from '../hooks/useElapsedTimer'
import RestTimer from '../components/RestTimer'
import ExerciseImage from '../components/ExerciseImage'
import ExerciseDetailModal from '../components/ExerciseDetailModal'
import { MUSCLES_ES, t } from '../i18n/es'
import { X, Check, ChevronDown, ChevronUp, Info } from 'lucide-react'

// Devuelve el último dato registrado para un ejercicio y número de serie
function getAnterior(workoutHistory, exerciseId, setIndex) {
  for (let i = workoutHistory.length - 1; i >= 0; i--) {
    const session = workoutHistory[i]
    const ex = session.exercises?.find(
      (e) => e.exerciseId === exerciseId || e.id === exerciseId
    )
    if (!ex) continue
    const set = ex.sets?.[setIndex]
    if (set?.actualWeight) return `${set.actualWeight}kg × ${set.actualReps}`
    if (set?.targetWeight) return `${set.targetWeight}kg × ${set.targetReps}`
  }
  return '—'
}

function SetRow({ set, exerciseId, onUpdate, onComplete, anterior }) {
  return (
    <div className={`set-row ${set.done ? 'done' : ''}`}>
      <span className="set-num">{set.setIndex + 1}</span>

      <span className="set-anterior">{anterior}</span>

      <input
        className="set-input"
        type="number"
        value={set.actualWeight}
        min={0}
        step={2.5}
        onChange={(e) => onUpdate({ actualWeight: Number(e.target.value) })}
        disabled={set.done}
      />

      <input
        className="set-input"
        type="number"
        value={set.actualReps}
        min={1}
        onChange={(e) => onUpdate({ actualReps: Number(e.target.value) })}
        disabled={set.done}
      />

      <button
        className={`set-check ${set.done ? 'set-check-done' : ''}`}
        onClick={() => !set.done && onComplete()}
      >
        <Check size={16} />
      </button>
    </div>
  )
}

export default function ActiveWorkout() {
  const navigate = useNavigate()
  const {
    activeWorkout,
    workoutHistory,
    updateSetInWorkout,
    completeSetInWorkout,
    finishWorkout,
    cancelWorkout,
  } = useAppStore()

  const { formatted: elapsed } = useElapsedTimer(activeWorkout?.startedAt)

  const [timerConfig, setTimerConfig]       = useState(null)   // { seconds }
  const [collapsed, setCollapsed]           = useState({})
  const [ejercicioDetalle, setEjercicioDetalle] = useState(null)
  const [confirmCancel, setConfirmCancel]   = useState(false)

  if (!activeWorkout) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>No hay ningún entrenamiento activo.</p>
          <button className="btn-primary" onClick={() => navigate('/rutinas')}>
            Ir a rutinas
          </button>
        </div>
      </div>
    )
  }

  const totalSets     = activeWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0)
  const completedSets = activeWorkout.exercises.reduce(
    (s, ex) => s + ex.sets.filter((st) => st.done).length, 0
  )
  const progress = totalSets > 0 ? completedSets / totalSets : 0

  const handleComplete = (exerciseId, setIndex, restSeconds) => {
    completeSetInWorkout(exerciseId, setIndex)
    setTimerConfig({ seconds: restSeconds })
  }

  const handleFinish = () => {
    const entry = finishWorkout()
    navigate('/entreno/resumen', { state: { entry } })
  }

  const handleCancel = () => {
    cancelWorkout()
    navigate('/rutinas')
  }

  const toggleCollapse = (exerciseId) =>
    setCollapsed((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }))

  return (
    <div className="workout-page">

      {/* ── CABECERA ── */}
      <header className="workout-header">
        <button className="icon-btn" onClick={() => setConfirmCancel(true)}>
          <X size={22} />
        </button>
        <div className="workout-header-center">
          <span className="workout-title">{activeWorkout.routineName}</span>
          <span className="elapsed-timer">{elapsed}</span>
        </div>
        <button className="btn-finish" onClick={handleFinish}>
          Finalizar
        </button>
      </header>

      {/* Barra de progreso */}
      <div className="workout-progress-bar">
        <div className="workout-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="workout-progress-text">{completedSets} / {totalSets} series</p>

      {/* ── EJERCICIOS ── */}
      <div className="workout-exercises">
        {activeWorkout.exercises.map((ex) => {
          const exDone  = ex.sets.every((s) => s.done)
          const exStart = ex.sets.some((s) => s.done)
          const isCollapsed = collapsed[ex.exerciseId] ?? exDone

          return (
            <div key={ex.exerciseId} className={`workout-ex-card ${exDone ? 'ex-all-done' : ''}`}>

              {/* Cabecera del ejercicio */}
              <div className="workout-ex-header" onClick={() => toggleCollapse(ex.exerciseId)}>
                <div className="workout-ex-thumb-wrap">
                  <ExerciseImage images={ex.images} name={ex.name} size="thumb" />
                  {exDone && <div className="ex-done-overlay"><Check size={20} /></div>}
                </div>
                <div className="workout-ex-meta">
                  <span className="workout-ex-name">{ex.name}</span>
                  <span className="workout-ex-muscle">{t(MUSCLES_ES, ex.primaryMuscles?.[0])}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    className="icon-btn"
                    style={{ padding: '0.25rem' }}
                    onClick={(e) => { e.stopPropagation(); setEjercicioDetalle(ex) }}
                  >
                    <Info size={16} />
                  </button>
                  {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>

              {/* Tabla de series */}
              {!isCollapsed && (
                <>
                  <div className="set-table-header">
                    <span>Serie</span>
                    <span>Anterior</span>
                    <span>kg</span>
                    <span>Reps</span>
                    <span>✓</span>
                  </div>
                  {ex.sets.map((st) => (
                    <SetRow
                      key={st.setIndex}
                      set={st}
                      exerciseId={ex.exerciseId}
                      anterior={getAnterior(workoutHistory, ex.exerciseId, st.setIndex)}
                      onUpdate={(updates) => updateSetInWorkout(ex.exerciseId, st.setIndex, updates)}
                      onComplete={() => handleComplete(ex.exerciseId, st.setIndex, ex.restSeconds)}
                    />
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ── TEMPORIZADOR DE DESCANSO ── */}
      {timerConfig && (
        <RestTimer
          defaultSeconds={timerConfig.seconds}
          onClose={() => setTimerConfig(null)}
        />
      )}

      {/* ── DETALLE EJERCICIO ── */}
      {ejercicioDetalle && (
        <ExerciseDetailModal
          exercise={ejercicioDetalle}
          onClose={() => setEjercicioDetalle(null)}
        />
      )}

      {/* ── CONFIRMAR CANCELAR ── */}
      {confirmCancel && (
        <div className="modal-overlay" onClick={() => setConfirmCancel(false)}>
          <div className="modal" style={{ maxHeight: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2>¿Abandonar entreno?</h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', margin: '0.75rem 0 1.25rem' }}>
              Se perderán los datos de esta sesión.
            </p>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setConfirmCancel(false)}>
                Continuar entrenando
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--red)' }}
                onClick={handleCancel}
              >
                Abandonar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
