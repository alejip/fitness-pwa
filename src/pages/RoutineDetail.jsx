import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { exerciseService } from '../services/exerciseApi'
import { MUSCLES_ES, t } from '../i18n/es'
import { Plus, Trash2, ArrowLeft, Play, Search, X, Timer } from 'lucide-react'
import RestTimer from '../components/RestTimer'
import ExerciseImage from '../components/ExerciseImage'
import ExerciseDetailModal from '../components/ExerciseDetailModal'

export default function RoutineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { routines, addExerciseToRoutine, removeExerciseFromRoutine, updateExerciseInRoutine, startWorkout } = useAppStore()
  const rutina = routines.find((r) => r.id === Number(id))

  const [mostrarBusqueda, setMostrarBusqueda] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [timerSegundos, setTimerSegundos] = useState(null)
  const [ejercicioDetalle, setEjercicioDetalle] = useState(null)

  const { data: resultados = [], isLoading: buscando } = useQuery({
    queryKey: ['exSearch', busqueda],
    queryFn: () => exerciseService.getByName(busqueda, 15, 0),
    enabled: busqueda.length > 2,
    staleTime: 1000 * 60 * 10,
  })

  if (!rutina) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Rutina no encontrada</p>
          <button className="btn-primary" onClick={() => navigate('/rutinas')}>Volver</button>
        </div>
      </div>
    )
  }

  const handleIniciarEntreno = () => {
    if (rutina.exercises.length === 0) return
    startWorkout(rutina)
    navigate(`/entreno/${rutina.id}`)
  }

  return (
    <div className="page">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate('/rutinas')}>
          <ArrowLeft size={22} />
        </button>
        <h1>{rutina.name}</h1>
        <button className="icon-btn" onClick={() => setTimerSegundos(60)} title="Temporizador de descanso">
          <Timer size={22} />
        </button>
        <button
          className="icon-btn success"
          onClick={handleIniciarEntreno}
          title="Iniciar entrenamiento"
          disabled={rutina.exercises.length === 0}
        >
          <Play size={22} />
        </button>
      </header>

      {rutina.description && (
        <p className="subtitle" style={{ padding: '0.5rem 1rem 0' }}>{rutina.description}</p>
      )}

      {rutina.exercises.length === 0 ? (
        <div className="empty-state">
          <p>Sin ejercicios aún</p>
          <p>Pulsa el + para añadir ejercicios a esta rutina</p>
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          {rutina.exercises.map((ex) => (
            <div key={ex.id} className="exercise-row">
              {/* Foto → abre detalle con foto grande */}
              <div style={{ cursor: 'zoom-in' }} onClick={() => setEjercicioDetalle(ex)}>
                <ExerciseImage images={ex.images} name={ex.name} size="thumb" />
              </div>
              <div className="ex-row-info">
                {/* Nombre → abre detalle con descripción e instrucciones traducidas */}
                <h4
                  className="ex-name-link"
                  onClick={() => setEjercicioDetalle(ex)}
                >
                  {ex.name}
                </h4>
                <p className="ex-muscle">{t(MUSCLES_ES, ex.primaryMuscles?.[0])}</p>
                <div className="ex-params">
                  <label>
                    Series
                    <input
                      type="number"
                      value={ex.sets}
                      min={1}
                      onChange={(e) => updateExerciseInRoutine(rutina.id, ex.id, { sets: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    Reps
                    <input
                      type="number"
                      value={ex.reps}
                      min={1}
                      onChange={(e) => updateExerciseInRoutine(rutina.id, ex.id, { reps: Number(e.target.value) })}
                    />
                  </label>
                  <label>
                    kg
                    <input
                      type="number"
                      value={ex.weight}
                      min={0}
                      onChange={(e) => updateExerciseInRoutine(rutina.id, ex.id, { weight: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  className="icon-btn"
                  title="Temporizador de descanso"
                  onClick={() => setTimerSegundos(ex.restSeconds || 60)}
                >
                  <Timer size={16} />
                </button>
                <button className="icon-btn danger" onClick={() => removeExerciseFromRoutine(rutina.id, ex.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setMostrarBusqueda(true)}>
        <Plus size={24} />
      </button>

      {/* Modal añadir ejercicio */}
      {mostrarBusqueda && (
        <div className="modal-overlay" onClick={() => setMostrarBusqueda(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setMostrarBusqueda(false)}>
              <X size={20} />
            </button>
            <h2>Añadir ejercicio</h2>
            <div className="search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre (en inglés)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />
            </div>

            {buscando && <p className="loading-text">Buscando...</p>}

            <div className="search-results">
              {resultados.map((ex) => (
                <div
                  key={ex.id}
                  className="search-result-item"
                  onClick={() => {
                    addExerciseToRoutine(rutina.id, ex)
                    setMostrarBusqueda(false)
                    setBusqueda('')
                  }}
                >
                  <ExerciseImage images={ex.images} name={ex.name} size="thumb" />
                  <div>
                    <p>{ex.name}</p>
                    <span className="tag">{t(MUSCLES_ES, ex.primaryMuscles?.[0])}</span>
                  </div>
                </div>
              ))}
              {busqueda.length > 2 && !buscando && resultados.length === 0 && (
                <p className="loading-text">Sin resultados</p>
              )}
            </div>
          </div>
        </div>
      )}

      {timerSegundos !== null && (
        <RestTimer
          defaultSeconds={timerSegundos}
          onClose={() => setTimerSegundos(null)}
        />
      )}

      {ejercicioDetalle && (
        <ExerciseDetailModal
          exercise={ejercicioDetalle}
          onClose={() => setEjercicioDetalle(null)}
        />
      )}
    </div>
  )
}
