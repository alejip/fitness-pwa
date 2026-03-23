import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { exerciseService } from '../services/exerciseApi'
import { PLANTILLAS, OBJETIVOS, estimarPeso } from '../data/plantillasRutinas'
import { calcularTDEE, ACTIVITY_LEVELS } from '../utils/tdee'
import { useNavigate } from 'react-router-dom'
import { User, Dumbbell, CheckCircle, RefreshCw, ChevronRight, Zap, Scale } from 'lucide-react'

async function resolverPlantilla(plantillaRutina, sexo, peso) {
  const ejerciciosResueltos = await Promise.all(
    plantillaRutina.exercises.map(async ({ id, sets, reps, weight, restSeconds }) => {
      const ex = await exerciseService.getById(id)
      if (!ex) return null
      const pesoEstimado = weight || estimarPeso(id, sexo, peso)
      return { ...ex, sets, reps, weight: pesoEstimado, restSeconds }
    })
  )
  return {
    ...plantillaRutina,
    exercises: ejerciciosResueltos.filter(Boolean),
  }
}

export default function Perfil() {
  const { perfil, setPerfil, generarRutinasPredefinidas, routines, weightLog, logWeight } = useAppStore()
  const navigate = useNavigate()

  const [editando, setEditando] = useState(!perfil)
  const [form, setForm]   = useState(perfil || { nombre: '', sexo: 'hombre', peso: '', altura: '', edad: '', objetivo: 'musculo', nivelActividad: 'moderado' })
  const [generando, setGenerando] = useState(false)
  const [generado, setGenerado]   = useState(false)
  const [error, setError] = useState('')

  const handleGuardar = (e) => {
    e.preventDefault()
    if (!form.peso || form.peso < 30 || form.peso > 300) {
      setError('Introduce un peso válido (30–300 kg)')
      return
    }
    if (form.altura && (form.altura < 100 || form.altura > 250)) {
      setError('Introduce una altura válida (100–250 cm)')
      return
    }
    if (form.edad && (form.edad < 10 || form.edad > 100)) {
      setError('Introduce una edad válida (10–100)')
      return
    }
    const nuevoPeso = Number(form.peso)
    setPerfil({
      ...form,
      peso:   nuevoPeso,
      altura: form.altura ? Number(form.altura) : undefined,
      edad:   form.edad   ? Number(form.edad)   : undefined,
    })
    // Registrar el peso en el historial si ha cambiado (o es el primero)
    const ultimoPeso = weightLog[weightLog.length - 1]?.kg
    if (ultimoPeso !== nuevoPeso) {
      logWeight(nuevoPeso, perfil ? 'Actualización de perfil' : 'Peso inicial')
    }
    setEditando(false)
    setError('')
  }

  const handleGenerarRutinas = async () => {
    if (!perfil) return
    setGenerando(true)
    setError('')
    try {
      const clave = `${perfil.objetivo}_${perfil.sexo}`
      const plantillas = PLANTILLAS[clave] || PLANTILLAS[`${perfil.objetivo}_hombre`]
      const rutinasResueltas = await Promise.all(
        plantillas.map(p => resolverPlantilla(p, perfil.sexo, perfil.peso))
      )
      generarRutinasPredefinidas(rutinasResueltas)
      setGenerado(true)
      setTimeout(() => setGenerado(false), 3000)
    } catch (err) {
      setError('Error al generar rutinas. Comprueba tu conexión.')
    } finally {
      setGenerando(false)
    }
  }

  const rutinasPredefinidas = routines.filter(r => r.predefinida)
  const objetivo = OBJETIVOS.find(o => o.key === perfil?.objetivo)
  const tdee = perfil ? calcularTDEE(perfil) : null

  return (
    <div className="page">
      <header className="page-header">
        <h1>Mi perfil</h1>
        {perfil && !editando && (
          <button className="icon-btn" onClick={() => setEditando(true)}>
            <User size={20} />
          </button>
        )}
      </header>

      {/* ── FORMULARIO DE PERFIL ── */}
      {editando ? (
        <form className="card form-card" onSubmit={handleGuardar} style={{ margin: '1rem' }}>
          <h2>{perfil ? 'Editar perfil' : 'Configura tu perfil'}</h2>
          {!perfil && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
              Con esta información generaremos rutinas adaptadas a ti.
            </p>
          )}

          <label className="field-label">Nombre (opcional)</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
          />

          <label className="field-label">Sexo</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${form.sexo === 'hombre' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, sexo: 'hombre' })}
            >
              Hombre
            </button>
            <button
              type="button"
              className={`toggle-btn ${form.sexo === 'mujer' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, sexo: 'mujer' })}
            >
              Mujer
            </button>
          </div>

          <label className="field-label">Peso corporal actual</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="75"
              value={form.peso}
              onChange={e => setForm({ ...form, peso: e.target.value })}
              min={30} max={300} step={0.5}
              required
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text2)', marginBottom: '0.6rem' }}>kg</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Altura (cm)</label>
              <input
                type="number"
                placeholder="175"
                value={form.altura}
                onChange={e => setForm({ ...form, altura: e.target.value })}
                min={100} max={250}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Edad</label>
              <input
                type="number"
                placeholder="30"
                value={form.edad}
                onChange={e => setForm({ ...form, edad: e.target.value })}
                min={10} max={100}
              />
            </div>
          </div>

          <label className="field-label">Nivel de actividad</label>
          <select
            value={form.nivelActividad || 'moderado'}
            onChange={e => setForm({ ...form, nivelActividad: e.target.value })}
          >
            {ACTIVITY_LEVELS.map(a => (
              <option key={a.key} value={a.key}>{a.label} — {a.desc}</option>
            ))}
          </select>

          <label className="field-label">Objetivo principal</label>
          <div className="objetivo-grid">
            {OBJETIVOS.map(obj => (
              <button
                key={obj.key}
                type="button"
                className={`objetivo-card ${form.objetivo === obj.key ? 'active' : ''}`}
                onClick={() => setForm({ ...form, objetivo: obj.key })}
              >
                <span className="objetivo-emoji">{obj.emoji}</span>
                <span className="objetivo-label">{obj.label}</span>
                <span className="objetivo-desc">{obj.desc}</span>
              </button>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions" style={{ marginTop: '1rem' }}>
            {perfil && (
              <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-primary">
              {perfil ? 'Guardar cambios' : 'Guardar perfil'}
            </button>
          </div>
        </form>
      ) : (
        /* ── RESUMEN DE PERFIL ── */
        <div className="card perfil-resumen" style={{ margin: '1rem' }}>
          <div className="perfil-avatar">
            {form.sexo === 'mujer' ? '👩' : '👨'}
          </div>
          <div className="perfil-datos">
            <h2>{perfil.nombre || (perfil.sexo === 'mujer' ? 'Usuaria' : 'Usuario')}</h2>
            <p>
              {perfil.peso} kg
              {perfil.altura ? ` · ${perfil.altura} cm` : ''}
              {perfil.edad   ? ` · ${perfil.edad} años` : ''}
              {' · '}{perfil.sexo === 'mujer' ? 'Mujer' : 'Hombre'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span>{objetivo?.emoji}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>{objetivo?.label}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setEditando(true)}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ── TDEE / OBJETIVO CALÓRICO ── */}
      {perfil && !editando && tdee && (
        <div className="card" style={{ margin: '0.75rem 1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={18} style={{ color: 'var(--orange)' }} />
            <h3 style={{ fontSize: '0.95rem' }}>Objetivo calórico diario</h3>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '0.75rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--orange)' }}>{tdee.objetivoKcal}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>kcal objetivo</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{tdee.tdee}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>TDEE</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--accent2)' }}>{tdee.macros.proteina}g</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>proteína</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--orange)' }}>{tdee.macros.carbos}g</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>carbos</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, color: 'var(--yellow)' }}>{tdee.macros.grasa}g</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>grasa</p>
            </div>
          </div>
          {!perfil.altura && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.5rem', textAlign: 'center' }}>
              Añade altura y edad para cálculos más precisos
            </p>
          )}
        </div>
      )}

      {/* ── GENERAR RUTINAS ── */}
      {perfil && !editando && (
        <div className="card" style={{ margin: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Dumbbell size={22} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h3>Rutinas sugeridas para ti</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                Generamos {PLANTILLAS[`${perfil.objetivo}_${perfil.sexo}`]?.length || 2} rutinas
                optimizadas para <strong>{objetivo?.label.toLowerCase()}</strong>,
                con los pesos iniciales estimados según tu peso corporal ({perfil.peso} kg).
              </p>

              {rutinasPredefinidas.length > 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '0.4rem' }}>
                  Ya tienes {rutinasPredefinidas.length} rutina{rutinasPredefinidas.length !== 1 ? 's' : ''} generada{rutinasPredefinidas.length !== 1 ? 's' : ''}. Puedes regenerarlas.
                </p>
              )}
            </div>
          </div>

          {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleGenerarRutinas}
            disabled={generando}
          >
            {generando ? (
              <><RefreshCw size={16} className="spin" /> Generando...</>
            ) : generado ? (
              <><CheckCircle size={16} /> ¡Rutinas creadas!</>
            ) : (
              <><Dumbbell size={16} /> {rutinasPredefinidas.length > 0 ? 'Regenerar rutinas' : 'Generar mis rutinas'}</>
            )}
          </button>
        </div>
      )}

      {/* ── PESO CORPORAL ── */}
      {perfil && !editando && (
        <div
          className="card"
          style={{ margin: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => navigate('/peso')}
        >
          <Scale size={22} style={{ color: 'var(--accent2)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.95rem' }}>Registro de peso corporal</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '2px' }}>
              {weightLog.length > 0
                ? `${weightLog[weightLog.length - 1].kg} kg · ${weightLog.length} registro${weightLog.length !== 1 ? 's' : ''}`
                : 'Sin registros aún'}
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text2)' }} />
        </div>
      )}
    </div>
  )
}
