import { useAppStore } from '../store/useAppStore'
import { calcularTDEE } from '../utils/tdee'
import { Flame, Dumbbell, Target, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { todayLog, workoutHistory, routines, perfil } = useAppStore()

  const hoyKcal     = todayLog.reduce((s, e) => s + (Number(e.calories) || 0), 0)
  const hoyProteina = todayLog.reduce((s, e) => s + (Number(e.protein) || 0), 0)
  const tdee = perfil ? calcularTDEE(perfil) : null
  const objetivoKcal = tdee?.objetivoKcal || 0
  const kcalPct = objetivoKcal > 0 ? Math.min((hoyKcal / objetivoKcal) * 100, 100) : 0
  const kcalColor = kcalPct > 100 ? 'var(--red)' : kcalPct > 85 ? 'var(--orange)' : 'var(--accent2)'
  const ultimoEntreno = workoutHistory[workoutHistory.length - 1]
  const rutinaUltimo  = ultimoEntreno
    ? routines.find((r) => r.id === ultimoEntreno.routineId)
    : null

  const hoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="page">
      <header className="page-header">
        <h1>Hoy</h1>
        <p className="subtitle" style={{ flex: 1, textAlign: 'right', fontSize: '0.8rem' }}>
          {hoy.charAt(0).toUpperCase() + hoy.slice(1)}
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card accent-orange" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            <Flame size={24} />
            <div>
              <span className="stat-value">{hoyKcal}{objetivoKcal > 0 && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text2)' }}>/{objetivoKcal}</span>}</span>
              <span className="stat-label">kcal hoy</span>
            </div>
          </div>
          {objetivoKcal > 0 && (
            <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${kcalPct}%`, background: kcalColor, borderRadius: '2px', transition: 'width 0.4s' }} />
            </div>
          )}
        </div>

        <div className="stat-card accent-blue">
          <Target size={24} />
          <div>
            <span className="stat-value">{hoyProteina}g</span>
            <span className="stat-label">proteína</span>
          </div>
        </div>

        <div className="stat-card accent-green">
          <Dumbbell size={24} />
          <div>
            <span className="stat-value">{routines.length}</span>
            <span className="stat-label">rutinas</span>
          </div>
        </div>

        <div className="stat-card accent-purple">
          <TrendingUp size={24} />
          <div>
            <span className="stat-value">{workoutHistory.length}</span>
            <span className="stat-label">entrenos</span>
          </div>
        </div>
      </div>

      {ultimoEntreno && (
        <section className="card">
          <h2>Último entreno</h2>
          <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>
            {rutinaUltimo?.name || 'Rutina eliminada'}
          </p>
          <p className="subtitle" style={{ marginTop: '0.25rem' }}>
            {new Date(ultimoEntreno.date).toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long',
            })} · {ultimoEntreno.exercises.length} ejercicio{ultimoEntreno.exercises.length !== 1 ? 's' : ''}
          </p>
        </section>
      )}

      {todayLog.length > 0 && (
        <section className="card">
          <h2>Comidas de hoy</h2>
          <ul className="food-list">
            {todayLog.map((entrada) => (
              <li key={entrada.id} className="food-item">
                <span>{entrada.name}</span>
                <span className="food-calories">{entrada.calories} kcal</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {todayLog.length === 0 && routines.length === 0 && (
        <div className="empty-state">
          <Dumbbell size={48} />
          <h2>¡Empieza tu camino!</h2>
          <p>Crea una rutina o registra tu primera comida para comenzar.</p>
        </div>
      )}
    </div>
  )
}
