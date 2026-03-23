import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { exerciseService } from '../services/exerciseApi'
import ExerciseImage from '../components/ExerciseImage'
import ExerciseDetailModal from '../components/ExerciseDetailModal'
import { MUSCLES_ES, LEVEL_ES, t } from '../i18n/es'
import { Search, X } from 'lucide-react'

const FILTRO_OPCIONES = [
  { key: 'musculo', label: 'Músculo' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'equipamiento', label: 'Equipamiento' },
]

export default function Exercises() {
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('musculo')
  const [filtroValor, setFiltroValor] = useState('')
  const [pagina, setPagina] = useState(0)
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null)
  const LIMITE = 20

  const { data: musculos = [] } = useQuery({
    queryKey: ['musculos'],
    queryFn: exerciseService.getMuscleList,
    staleTime: Infinity,
  })

  const { data: ejercicios = [], isLoading } = useQuery({
    queryKey: ['ejercicios', filtroTipo, filtroValor, busqueda, pagina],
    queryFn: async () => {
      if (busqueda.trim()) return exerciseService.getByName(busqueda.trim(), LIMITE, pagina * LIMITE)
      if (filtroValor) {
        if (filtroTipo === 'musculo')       return exerciseService.getByMuscle(filtroValor, LIMITE, pagina * LIMITE)
        if (filtroTipo === 'categoria')    return exerciseService.getByCategory(filtroValor, LIMITE, pagina * LIMITE)
        if (filtroTipo === 'equipamiento') return exerciseService.getByEquipment(filtroValor, LIMITE, pagina * LIMITE)
      }
      return exerciseService.getAll(LIMITE, pagina * LIMITE)
    },
    staleTime: 1000 * 60 * 60,
  })

  const handleBusqueda = (e) => { setBusqueda(e.target.value); setPagina(0) }
  const handleFiltro = (valor) => { setFiltroValor(valor === filtroValor ? '' : valor); setBusqueda(''); setPagina(0) }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Ejercicios</h1>
      </header>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={busqueda}
          onChange={handleBusqueda}
        />
        {busqueda && <button onClick={() => setBusqueda('')}><X size={16} /></button>}
      </div>

      {/* Selector de tipo de filtro */}
      <div className="filter-type-row">
        {FILTRO_OPCIONES.map(op => (
          <button
            key={op.key}
            className={`chip ${filtroTipo === op.key ? 'active' : ''}`}
            onClick={() => { setFiltroTipo(op.key); setFiltroValor(''); setPagina(0) }}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Chips de valores según el filtro activo */}
      <div className="filter-chips">
        {filtroTipo === 'musculo' && musculos.map(m => (
          <button key={m} className={`chip ${filtroValor === m ? 'active' : ''}`} onClick={() => handleFiltro(m)}>
            {t(MUSCLES_ES, m)}
          </button>
        ))}
        {filtroTipo === 'categoria' && Object.keys(CATEGORY_ES).map(c => (
          <button key={c} className={`chip ${filtroValor === c ? 'active' : ''}`} onClick={() => handleFiltro(c)}>
            {CATEGORY_ES[c]}
          </button>
        ))}
        {filtroTipo === 'equipamiento' && Object.keys(EQUIPMENT_ES).map(e => (
          <button key={e} className={`chip ${filtroValor === e ? 'active' : ''}`} onClick={() => handleFiltro(e)}>
            {EQUIPMENT_ES[e]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="exercise-card skeleton" />)}
        </div>
      ) : (
        <>
          <p className="results-count">{ejercicios.length} resultados</p>
          <div className="exercise-grid">
            {ejercicios.map((ex) => (
              <div key={ex.id} className="exercise-card" onClick={() => setEjercicioSeleccionado(ex)}>
                <ExerciseImage images={ex.images} name={ex.name} size="card" />
                <div className="exercise-info">
                  <h3>{ex.name}</h3>
                  <div className="ex-chips">
                    <span className="tag">{t(MUSCLES_ES, ex.primaryMuscles?.[0])}</span>
                    {ex.level && <span className="tag tag-secondary">{t(LEVEL_ES, ex.level)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ejercicios.length === 0 && (
            <div className="empty-state" style={{ paddingTop: '2rem' }}>
              <p>Sin resultados para esta búsqueda</p>
            </div>
          )}

          <div className="pagination">
            <button onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0}>← Anterior</button>
            <span>Página {pagina + 1}</span>
            <button onClick={() => setPagina(p => p + 1)} disabled={ejercicios.length < LIMITE}>Siguiente →</button>
          </div>
        </>
      )}

      {ejercicioSeleccionado && (
        <ExerciseDetailModal
          exercise={ejercicioSeleccionado}
          onClose={() => setEjercicioSeleccionado(null)}
        />
      )}
    </div>
  )
}
