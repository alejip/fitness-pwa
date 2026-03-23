import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { Plus, Trash2, ChevronRight, Dumbbell } from 'lucide-react'

export default function Routines() {
  const { routines, addRoutine, deleteRoutine } = useAppStore()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const navigate = useNavigate()

  const handleCrear = (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    addRoutine({ name: nombre.trim(), description: descripcion.trim() })
    setNombre('')
    setDescripcion('')
    setMostrarForm(false)
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mis Rutinas</h1>
        <button className="icon-btn" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus size={22} />
        </button>
      </header>

      {mostrarForm && (
        <form className="card form-card" onSubmit={handleCrear}>
          <h2>Nueva rutina</h2>
          <input
            type="text"
            placeholder="Nombre (ej: Día de pecho)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            required
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">Crear</button>
          </div>
        </form>
      )}

      {routines.length === 0 ? (
        <div className="empty-state">
          <Dumbbell size={48} />
          <h2>Sin rutinas aún</h2>
          <p>Pulsa el + para crear tu primera rutina</p>
        </div>
      ) : (
        <div className="list">
          {routines.map((rutina) => (
            <div key={rutina.id} className="list-item">
              <div className="list-item-content" onClick={() => navigate(`/rutinas/${rutina.id}`)}>
                <h3>{rutina.name}</h3>
                <p>{rutina.description || `${rutina.exercises.length} ejercicio${rutina.exercises.length !== 1 ? 's' : ''}`}</p>
              </div>
              <div className="list-item-actions">
                <button className="icon-btn danger" onClick={() => deleteRoutine(rutina.id)}>
                  <Trash2 size={16} />
                </button>
                <ChevronRight
                  size={20}
                  className="chevron"
                  onClick={() => navigate(`/rutinas/${rutina.id}`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
