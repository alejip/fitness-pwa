import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'

function SparkLine({ data }) {
  if (data.length < 2) return null
  const values = data.map((d) => d.kg)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 280
  const H = 80
  const pad = 8

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sparkline">
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(' ')}
      />
      {/* Último punto */}
      {(() => {
        const [x, y] = points[points.length - 1].split(',').map(Number)
        return <circle cx={x} cy={y} r="4" fill="var(--accent)" />
      })()}
    </svg>
  )
}

export default function Weight() {
  const { weightLog, logWeight, deleteWeightEntry } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [kg, setKg] = useState('')
  const [note, setNote] = useState('')

  const sorted = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latest = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const diff = latest && prev ? (latest.kg - prev.kg).toFixed(1) : null
  const startWeight = sorted[0]?.kg
  const totalDiff = latest && startWeight ? (latest.kg - startWeight).toFixed(1) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!kg) return
    logWeight(kg, note)
    setKg('')
    setNote('')
    setShowForm(false)
  }

  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus
  const trendColor = diff > 0 ? 'var(--orange)' : diff < 0 ? 'var(--green)' : 'var(--text2)'

  return (
    <div className="page">
      <header className="page-header">
        <h1>Peso corporal</h1>
        <button className="icon-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={22} />
        </button>
      </header>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>Registrar peso</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="kg (ej: 78.5)"
              value={kg}
              step="0.1"
              min="30"
              max="300"
              onChange={(e) => setKg(e.target.value)}
              autoFocus
              required
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text2)', whiteSpace: 'nowrap', marginBottom: '0.6rem' }}>kg</span>
          </div>
          <input
            type="text"
            placeholder="Nota (opcional, ej: en ayunas)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      )}

      {latest && (
        <div className="weight-summary">
          <div className="weight-main">
            <span className="weight-value">{latest.kg}</span>
            <span className="weight-unit">kg</span>
          </div>
          <div className="weight-stats">
            {diff !== null && (
              <div className="weight-stat" style={{ color: trendColor }}>
                <TrendIcon size={16} />
                <span>{diff > 0 ? '+' : ''}{diff} kg vs anterior</span>
              </div>
            )}
            {totalDiff !== null && sorted.length > 1 && (
              <div className="weight-stat" style={{ color: 'var(--text2)' }}>
                <span>Total: {totalDiff > 0 ? '+' : ''}{totalDiff} kg desde el inicio</span>
              </div>
            )}
          </div>
        </div>
      )}

      {sorted.length >= 2 && (
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>Evolución</h3>
          <SparkLine data={sorted} />
          <div className="sparkline-labels">
            <span>{sorted[0]?.kg} kg</span>
            <span>{new Date(sorted[0]?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            <span>{new Date(sorted[sorted.length - 1]?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
            <span>{sorted[sorted.length - 1]?.kg} kg</span>
          </div>
        </div>
      )}

      <div className="list" style={{ marginTop: '0.5rem' }}>
        {[...weightLog].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
          <div key={entry.id} className="list-item">
            <div className="list-item-content">
              <p className="food-name">{entry.kg} kg</p>
              <p className="food-macros">
                {new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                {entry.note ? ` · ${entry.note}` : ''}
              </p>
            </div>
            <button className="icon-btn danger" onClick={() => deleteWeightEntry(entry.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {weightLog.length === 0 && (
        <div className="empty-state">
          <TrendingDown size={48} />
          <h2>Sin registros de peso</h2>
          <p>Pulsa + para añadir tu peso de hoy</p>
        </div>
      )}
    </div>
  )
}
