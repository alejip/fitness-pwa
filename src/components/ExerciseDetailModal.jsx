import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { IMG_BASE } from '../services/exerciseApi'
import { translateList } from '../services/translate'
import { MUSCLES_ES, EQUIPMENT_ES, LEVEL_ES, CATEGORY_ES, t } from '../i18n/es'

export default function ExerciseDetailModal({ exercise, onClose }) {
  const [instrucciones, setInstrucciones] = useState([])
  const [descripcion, setDescripcion]     = useState('')
  const [cargando, setCargando]           = useState(true)
  const [fotoGrande, setFotoGrande]       = useState(false)

  useEffect(() => {
    let activo = true
    setCargando(true)

    async function traducir() {
      const textos = [
        exercise.description || '',
        ...(exercise.instructions || []),
      ]
      const traducidos = await translateList(textos)
      if (!activo) return
      setDescripcion(traducidos[0])
      setInstrucciones(traducidos.slice(1))
      setCargando(false)
    }

    traducir()
    return () => { activo = false }
  }, [exercise.id])

  const img0 = exercise.images?.[0] ? `${IMG_BASE}/${exercise.images[0]}` : null
  const img1 = exercise.images?.[1] ? `${IMG_BASE}/${exercise.images[1]}` : null

  return (
    <>
      {/* Modal principal */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>

          {/* Foto clickable */}
          {img0 && (
            <img
              src={img0}
              alt={exercise.name}
              className="ex-card-img"
              style={{ borderRadius: '10px', cursor: 'zoom-in' }}
              onClick={() => setFotoGrande(true)}
            />
          )}

          <h2 style={{ marginTop: '1rem', textTransform: 'capitalize' }}>{exercise.name}</h2>

          {/* Tags */}
          <div className="exercise-tags" style={{ marginTop: '0.5rem' }}>
            {exercise.primaryMuscles?.map(m => (
              <span key={m} className="tag">{t(MUSCLES_ES, m)}</span>
            ))}
            {exercise.secondaryMuscles?.map(m => (
              <span key={m} className="tag tag-secondary">{t(MUSCLES_ES, m)}</span>
            ))}
            {exercise.equipment && (
              <span className="tag tag-target">{t(EQUIPMENT_ES, exercise.equipment)}</span>
            )}
            {exercise.level && (
              <span className="tag" style={{ background: 'rgba(255,112,67,0.15)', color: 'var(--orange)' }}>
                {t(LEVEL_ES, exercise.level)}
              </span>
            )}
            {exercise.category && (
              <span className="tag" style={{ background: 'rgba(79,195,247,0.12)', color: 'var(--accent2)' }}>
                {t(CATEGORY_ES, exercise.category)}
              </span>
            )}
          </div>

          {cargando ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem 0', color: 'var(--text2)', justifyContent: 'center' }}>
              <Loader size={18} className="spin" /> Traduciendo...
            </div>
          ) : (
            <>
              {descripcion && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6, margin: '0.75rem 0' }}>
                  {descripcion}
                </p>
              )}

              {/* Segunda imagen (posición final) */}
              {img1 && (
                <img
                  src={img1}
                  alt={`${exercise.name} - posición final`}
                  className="ex-card-img"
                  style={{ borderRadius: '10px', marginBottom: '0.75rem', cursor: 'zoom-in' }}
                  onClick={() => setFotoGrande(true)}
                />
              )}

              {instrucciones.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Instrucciones</h3>
                  <ol className="instructions">
                    {instrucciones.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Foto a pantalla completa */}
      {fotoGrande && img0 && (
        <div
          className="modal-overlay"
          style={{ alignItems: 'center', justifyContent: 'center', zIndex: 400 }}
          onClick={() => setFotoGrande(false)}
        >
          <img
            src={img0}
            alt={exercise.name}
            style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  )
}
