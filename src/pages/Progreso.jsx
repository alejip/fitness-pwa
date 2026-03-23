import { useState, useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { MUSCLES_ES, t } from '../i18n/es'

function calc1RM(w, r) {
  if (!w || !r) return 0
  return Math.round(w * (1 + r / 30) * 10) / 10
}

function LineChart({ data, color = '#6c63ff' }) {
  if (data.length < 2) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '0.82rem', padding: '1.5rem 0' }}>
        Necesitas al menos 2 sesiones para ver la gráfica
      </p>
    )
  }

  const W = 300, H = 150
  const padL = 38, padR = 8, padT = 8, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const ys = data.map((d) => d.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeY = maxY - minY || maxY * 0.1 || 1

  const toX = (i) => padL + (i / (data.length - 1)) * chartW
  const toY = (y) => padT + chartH - ((y - minY) / rangeY) * chartH

  const linePoints = data.map((d, i) => `${toX(i)},${toY(d.y)}`).join(' ')
  const areaPoints = [
    `${padL},${padT + chartH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.y)}`),
    `${toX(data.length - 1)},${padT + chartH}`,
  ].join(' ')

  const gridVals = [maxY, minY + rangeY * 0.5, minY]

  // Show x labels at first, middle and last
  const xLabelIdxs = [...new Set([0, Math.floor((data.length - 1) / 2), data.length - 1])]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {gridVals.map((v, i) => {
        const y = toY(v)
        return (
          <g key={i}>
            <line
              x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="4,3"
            />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text2)">
              {Math.round(v)}
            </text>
          </g>
        )
      })}

      <polygon points={areaPoints} fill={color} fillOpacity="0.12" />

      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {data.map((d, i) => (
        <circle
          key={i}
          cx={toX(i)} cy={toY(d.y)} r="3.5"
          fill={color} stroke="var(--bg2)" strokeWidth="1.5"
        />
      ))}

      {xLabelIdxs.map((i) => (
        <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--text2)">
          {new Date(data[i].x).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </text>
      ))}
    </svg>
  )
}

export default function Progreso() {
  const { workoutHistory } = useAppStore()
  const [selectedId, setSelectedId] = useState(null)
  const [metric, setMetric] = useState('1rm')

  const exerciseMap = useMemo(() => {
    const map = {}
    workoutHistory.forEach((session) => {
      session.exercises?.forEach((ex) => {
        if (!map[ex.exerciseId]) {
          map[ex.exerciseId] = {
            id: ex.exerciseId,
            name: ex.name,
            primaryMuscles: ex.primaryMuscles,
            sessions: [],
          }
        }
        const done = ex.sets?.filter((s) => s.done) || []
        if (done.length > 0) {
          map[ex.exerciseId].sessions.push({ date: session.date, sets: done })
        }
      })
    })
    return Object.values(map)
      .filter((ex) => ex.sessions.length > 0)
      .sort((a, b) => b.sessions.length - a.sessions.length)
  }, [workoutHistory])

  const selected = exerciseMap.find((e) => e.id === selectedId)

  const chartData = useMemo(() => {
    if (!selected) return []
    return selected.sessions.map((s) => {
      if (metric === '1rm') {
        const best = Math.max(...s.sets.map((st) => calc1RM(st.actualWeight, st.actualReps)))
        return { x: s.date, y: best }
      }
      if (metric === 'peso') {
        return { x: s.date, y: Math.max(...s.sets.map((st) => st.actualWeight || 0)) }
      }
      // volumen
      const vol = s.sets.reduce((sum, st) => sum + (st.actualWeight || 0) * (st.actualReps || 0), 0)
      return { x: s.date, y: vol }
    })
  }, [selected, metric])

  if (workoutHistory.length === 0) {
    return (
      <div className="page">
        <header className="page-header"><h1>Progreso</h1></header>
        <div className="empty-state">
          <TrendingUp size={48} />
          <h2>Sin datos aún</h2>
          <p>Completa tu primer entreno para ver tu progreso aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        {selected && (
          <button className="icon-btn" onClick={() => setSelectedId(null)}>
            <ArrowLeft size={22} />
          </button>
        )}
        <h1 style={{ textTransform: selected ? 'capitalize' : undefined }}>
          {selected ? selected.name : 'Progreso'}
        </h1>
      </header>

      {selected ? (
        <div>
          <p style={{ padding: '0.5rem 1rem 0', fontSize: '0.8rem', color: 'var(--text2)', textTransform: 'capitalize' }}>
            {t(MUSCLES_ES, selected.primaryMuscles?.[0])} · {selected.sessions.length} sesión{selected.sessions.length !== 1 ? 'es' : ''}
          </p>

          {/* Metric selector */}
          <div className="toggle-group" style={{ margin: '0.75rem 1rem 0.25rem' }}>
            {[
              { key: '1rm',     label: '1RM est.' },
              { key: 'peso',    label: 'Peso máx.' },
              { key: 'volumen', label: 'Volumen' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                className={`toggle-btn ${metric === m.key ? 'active' : ''}`}
                onClick={() => setMetric(m.key)}
                style={{ fontSize: '0.75rem' }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ margin: '0.75rem 1rem' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              {metric === '1rm' ? '1RM estimado (kg)' : metric === 'peso' ? 'Peso máximo (kg)' : 'Volumen total (kg)'}
            </p>
            <LineChart data={chartData} />
          </div>

          {/* Last sessions */}
          <div style={{ padding: '0 1rem' }}>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Últimas sesiones
            </h3>
            {[...selected.sessions].reverse().slice(0, 5).map((s, i) => (
              <div key={i} className="card" style={{ padding: '0.75rem', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.4rem' }}>
                  {new Date(s.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                {s.sets.map((st, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                    <span style={{ color: 'var(--text2)' }}>Serie {st.setIndex + 1}</span>
                    <span>{st.actualWeight} kg × {st.actualReps} reps</span>
                    <span style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>
                      ~{calc1RM(st.actualWeight, st.actualReps)} 1RM
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.75rem 1rem 0' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
            {exerciseMap.length} ejercicio{exerciseMap.length !== 1 ? 's' : ''} registrado{exerciseMap.length !== 1 ? 's' : ''}
          </p>
          {exerciseMap.map((ex) => {
            const last = ex.sessions[ex.sessions.length - 1]
            const bestSet = last?.sets.reduce(
              (b, s) => calc1RM(s.actualWeight, s.actualReps) > calc1RM(b.actualWeight, b.actualReps) ? s : b,
              last.sets[0]
            )
            const trend = ex.sessions.length >= 2
              ? calc1RM(
                  ex.sessions[ex.sessions.length - 1].sets[0]?.actualWeight,
                  ex.sessions[ex.sessions.length - 1].sets[0]?.actualReps,
                ) > calc1RM(
                  ex.sessions[ex.sessions.length - 2].sets[0]?.actualWeight,
                  ex.sessions[ex.sessions.length - 2].sets[0]?.actualReps,
                )
                ? '↑' : '→'
              : null

            return (
              <div
                key={ex.id}
                className="list-item"
                style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                onClick={() => setSelectedId(ex.id)}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{ex.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '2px' }}>
                    {t(MUSCLES_ES, ex.primaryMuscles?.[0])} · {ex.sessions.length} sesión{ex.sessions.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>
                    {bestSet ? `${bestSet.actualWeight}kg` : '—'}
                    {trend && <span style={{ fontSize: '0.8rem', marginLeft: '2px', color: trend === '↑' ? 'var(--green)' : 'var(--text2)' }}>{trend}</span>}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>último máx.</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
