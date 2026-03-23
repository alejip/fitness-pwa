import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Trophy, Clock, Dumbbell, Zap, ChevronRight, Star } from 'lucide-react'
import { MUSCLES_ES, t } from '../i18n/es'

function formatDuration(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min ${s}s`
  return `${s}s`
}

export default function WorkoutSummary() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { workoutHistory } = useAppStore()

  // La entry llega por state de navigate, si no usamos la última del historial
  const entry = location.state?.entry || workoutHistory[workoutHistory.length - 1]

  if (!entry) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Sin datos de entreno</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Ir al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page summary-page">

      {/* ── CABECERA ── */}
      <div className="summary-hero">
        <div className="summary-emoji">🎉</div>
        <h1>¡Entreno completado!</h1>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
          {new Date(entry.date).toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </p>
      </div>

      {/* ── ESTADÍSTICAS ── */}
      <div className="stats-grid" style={{ padding: '0 1rem 0.5rem' }}>
        <div className="stat-card accent-purple">
          <Clock size={22} />
          <div>
            <span className="stat-value">{formatDuration(entry.durationSeconds)}</span>
            <span className="stat-label">Duración</span>
          </div>
        </div>
        <div className="stat-card accent-orange">
          <Zap size={22} />
          <div>
            <span className="stat-value">{entry.totalVolumeKg.toLocaleString('es-ES')}</span>
            <span className="stat-label">kg volumen</span>
          </div>
        </div>
        <div className="stat-card accent-green">
          <Dumbbell size={22} />
          <div>
            <span className="stat-value">{entry.setsCompleted}</span>
            <span className="stat-label">series</span>
          </div>
        </div>
        <div className="stat-card accent-blue">
          <Trophy size={22} />
          <div>
            <span className="stat-value">{entry.prs?.length || 0}</span>
            <span className="stat-label">récords</span>
          </div>
        </div>
      </div>

      {/* ── RÉCORDS PERSONALES ── */}
      {entry.prs?.length > 0 && (
        <section className="card" style={{ margin: '0 1rem 0.75rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Star size={18} style={{ color: 'var(--yellow)' }} /> Récords personales
          </h2>
          {entry.prs.map((pr) => (
            <div key={pr.exerciseId} className="pr-row">
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                  {pr.exerciseName}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                  1RM estimado: {pr.previous1RM > 0 ? `${pr.previous1RM}kg →` : 'Nuevo:'}{' '}
                  <strong style={{ color: 'var(--green)' }}>{pr.new1RM}kg</strong>
                </p>
              </div>
              <span className="pr-badge">🏆 PR</span>
            </div>
          ))}
        </section>
      )}

      {/* ── DETALLE POR EJERCICIO ── */}
      <section style={{ padding: '0 1rem' }}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Detalle</h2>
        {entry.exercises.map((ex) => {
          const doneSets = ex.sets?.filter((s) => s.done) || []
          if (doneSets.length === 0) return null
          return (
            <div key={ex.exerciseId} className="card" style={{ marginBottom: '0.5rem', padding: '0.75rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                {ex.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.4rem' }}>
                {t(MUSCLES_ES, ex.primaryMuscles?.[0])}
              </p>
              {doneSets.map((st) => (
                <div key={st.setIndex} className="summary-set-row">
                  <span>Serie {st.setIndex + 1}</span>
                  <span>{st.actualWeight} kg × {st.actualReps} reps</span>
                  <span style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>
                    {Math.round((st.actualWeight || 0) * (st.actualReps || 0))} kg
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </section>

      <div style={{ padding: '1rem' }}>
        <button
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
