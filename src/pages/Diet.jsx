import { useState, lazy, Suspense } from 'react'
import { useAppStore } from '../store/useAppStore'
import { calcularTDEE } from '../utils/tdee'
import { MEAL_TYPES } from '../i18n/es'
import { Plus, Trash2, UtensilsCrossed, Search, Barcode, X } from 'lucide-react'

const BarcodeScanner = lazy(() => import('../components/BarcodeScanner'))

const DEFAULT_COMIDA = { name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'Almuerzo', porcion: 100, per100: null }

function nutriFromOFF(product, grams = 100) {
  const n = product.nutriments || {}
  const factor = grams / 100
  const kcal = n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0)
  return {
    name:     product.product_name || product.product_name_es || '',
    calories: Math.round(kcal * factor),
    protein:  Math.round((n.proteins_100g || 0) * factor * 10) / 10,
    carbs:    Math.round((n.carbohydrates_100g || 0) * factor * 10) / 10,
    fat:      Math.round((n.fat_100g || 0) * factor * 10) / 10,
    per100: {
      kcal,
      protein: n.proteins_100g || 0,
      carbs:   n.carbohydrates_100g || 0,
      fat:     n.fat_100g || 0,
    },
  }
}

function recalcMacros(per100, grams) {
  if (!per100) return {}
  const f = grams / 100
  return {
    calories: Math.round(per100.kcal * f),
    protein:  Math.round(per100.protein * f * 10) / 10,
    carbs:    Math.round(per100.carbs * f * 10) / 10,
    fat:      Math.round(per100.fat * f * 10) / 10,
  }
}

async function searchOFF(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=8&fields=product_name,product_name_es,nutriments`
  const res = await fetch(url)
  const data = await res.json()
  return (data.products || []).filter((p) => p.product_name || p.product_name_es)
}

async function lookupBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  const res = await fetch(url)
  const data = await res.json()
  return data.status === 1 ? data.product : null
}

export default function Diet() {
  const { todayLog, logFood, removeFromLog, dietPlans, addDietPlan, deleteDietPlan, perfil } = useAppStore()
  const [pestana, setPestana] = useState('hoy')
  const [mostrarFormComida, setMostrarFormComida] = useState(false)
  const [mostrarFormPlan, setMostrarFormPlan] = useState(false)
  const [mostrarScanner, setMostrarScanner] = useState(false)
  const [comida, setComida] = useState(DEFAULT_COMIDA)
  const [nombrePlan, setNombrePlan] = useState('')
  const [objetivoPlan, setObjetivoPlan] = useState('')

  // Food search state
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [buscandoBarcode, setBuscandoBarcode] = useState(false)

  const totalKcal     = todayLog.reduce((s, e) => s + (Number(e.calories) || 0), 0)
  const totalProteina = todayLog.reduce((s, e) => s + (Number(e.protein) || 0), 0)
  const totalCarbos   = todayLog.reduce((s, e) => s + (Number(e.carbs) || 0), 0)
  const totalGrasa    = todayLog.reduce((s, e) => s + (Number(e.fat) || 0), 0)

  const tdee = perfil ? calcularTDEE(perfil) : null
  const objetivoKcal = tdee?.objetivoKcal || 0

  const handleBuscar = async (query) => {
    setBusqueda(query)
    if (query.length < 3) { setResultados([]); return }
    setBuscando(true)
    try {
      const res = await searchOFF(query)
      setResultados(res)
    } finally {
      setBuscando(false)
    }
  }

  const handleSeleccionarProducto = (product) => {
    const datos = nutriFromOFF(product, comida.porcion)
    setComida((prev) => ({
      ...prev,
      name: datos.name || prev.name,
      calories: datos.calories,
      protein:  datos.protein,
      carbs:    datos.carbs,
      fat:      datos.fat,
      per100:   datos.per100,
    }))
    setResultados([])
    setBusqueda('')
  }

  const handlePorcionChange = (grams) => {
    const newPorcion = Number(grams) || 100
    const macros = recalcMacros(comida.per100, newPorcion)
    setComida((prev) => ({ ...prev, porcion: newPorcion, ...macros }))
  }

  const handleBarcodeScan = async (barcode) => {
    setMostrarScanner(false)
    setBuscandoBarcode(true)
    try {
      const product = await lookupBarcode(barcode)
      if (product) {
        handleSeleccionarProducto(product)
        if (!mostrarFormComida) setMostrarFormComida(true)
      } else {
        alert(`Producto con código ${barcode} no encontrado en OpenFoodFacts`)
      }
    } catch {
      alert('Error al buscar el código de barras')
    } finally {
      setBuscandoBarcode(false)
    }
  }

  const handleAnadirComida = (e) => {
    e.preventDefault()
    logFood({
      ...comida,
      calories: Number(comida.calories),
      protein:  Number(comida.protein),
      carbs:    Number(comida.carbs),
      fat:      Number(comida.fat),
    })
    setComida(DEFAULT_COMIDA)
    setBusqueda('')
    setResultados([])
    setMostrarFormComida(false)
  }

  const handleCrearPlan = (e) => {
    e.preventDefault()
    addDietPlan({ name: nombrePlan, goal: objetivoPlan })
    setNombrePlan('')
    setObjetivoPlan('')
    setMostrarFormPlan(false)
  }

  const progresoPct = objetivoKcal > 0 ? Math.min((totalKcal / objetivoKcal) * 100, 100) : 0
  const progresoColor = progresoPct > 100 ? 'var(--red)' : progresoPct > 85 ? 'var(--orange)' : 'var(--green)'

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dieta</h1>
        <button
          className="icon-btn"
          onClick={() => pestana === 'hoy' ? setMostrarFormComida(true) : setMostrarFormPlan(true)}
        >
          <Plus size={22} />
        </button>
      </header>

      <div className="tabs">
        <button className={pestana === 'hoy'    ? 'tab active' : 'tab'} onClick={() => setPestana('hoy')}>Hoy</button>
        <button className={pestana === 'planes' ? 'tab active' : 'tab'} onClick={() => setPestana('planes')}>Planes</button>
      </div>

      {pestana === 'hoy' && (
        <>
          {/* Macro summary + progress */}
          <div className="macro-bar" style={{ flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <div className="macro">
                <span className="macro-value">{totalKcal}{objetivoKcal > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 400 }}> / {objetivoKcal}</span>}</span>
                <span>kcal</span>
              </div>
              <div className="macro"><span className="macro-value accent-blue">{totalProteina}g</span><span>proteína</span></div>
              <div className="macro"><span className="macro-value accent-orange">{totalCarbos}g</span><span>carbos</span></div>
              <div className="macro"><span className="macro-value accent-yellow">{totalGrasa}g</span><span>grasa</span></div>
            </div>
            {objetivoKcal > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progresoPct}%`, background: progresoColor, borderRadius: '3px', transition: 'width 0.4s' }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text2)', marginTop: '3px', textAlign: 'right' }}>
                  {Math.round(progresoPct)}% del objetivo · quedan {Math.max(0, objetivoKcal - totalKcal)} kcal
                </p>
              </div>
            )}
          </div>

          {/* Barcode shortcut */}
          {!mostrarFormComida && (
            <button
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setMostrarScanner(true)}
              disabled={buscandoBarcode}
            >
              <Barcode size={16} />
              {buscandoBarcode ? 'Buscando producto...' : 'Escanear código de barras'}
            </button>
          )}

          {mostrarFormComida && (
            <form className="card form-card" onSubmit={handleAnadirComida} style={{ margin: '0.5rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h2>Registrar alimento</h2>
                <button type="button" className="modal-close" style={{ position: 'static' }} onClick={() => { setMostrarFormComida(false); setResultados([]); setBusqueda('') }}>
                  <X size={18} />
                </button>
              </div>

              {/* Search OpenFoodFacts */}
              <div className="food-search-wrap">
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <div className="search-bar" style={{ flex: 1, margin: 0 }}>
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Buscar en OpenFoodFacts..."
                      value={busqueda}
                      onChange={(e) => handleBuscar(e.target.value)}
                    />
                    {busqueda && <button type="button" onClick={() => { setBusqueda(''); setResultados([]) }}><X size={14} /></button>}
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    title="Escanear código de barras"
                    onClick={() => setMostrarScanner(true)}
                  >
                    <Barcode size={18} />
                  </button>
                </div>

                {buscando && <p className="loading-text" style={{ padding: '0.4rem 0' }}>Buscando...</p>}

                {resultados.length > 0 && (
                  <div className="food-search-results">
                    {resultados.map((p, i) => {
                      const name = p.product_name_es || p.product_name
                      const n = p.nutriments || {}
                      const kcal = Math.round(n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0))
                      return (
                        <div key={i} className="food-result-item" onClick={() => handleSeleccionarProducto(p)}>
                          <p>{name}</p>
                          <span>{kcal} kcal/100g</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <input
                placeholder="Nombre del alimento"
                value={comida.name}
                onChange={(e) => setComida({ ...comida, name: e.target.value })}
                required
              />

              <select
                value={comida.mealType}
                onChange={(e) => setComida({ ...comida, mealType: e.target.value })}
              >
                {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
              </select>

              {comida.per100 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <label className="field-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Porción:</label>
                  <input
                    type="number"
                    value={comida.porcion}
                    min={1} max={2000}
                    onChange={(e) => handlePorcionChange(e.target.value)}
                    style={{ margin: 0, width: '80px' }}
                  />
                  <span style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>g</span>
                </div>
              )}

              <div className="form-row">
                <input type="number" placeholder="kcal"     value={comida.calories} onChange={(e) => setComida({ ...comida, calories: e.target.value, per100: null })} min={0} />
                <input type="number" placeholder="prot (g)" value={comida.protein}  onChange={(e) => setComida({ ...comida, protein: e.target.value,  per100: null })} min={0} />
                <input type="number" placeholder="carbos (g)" value={comida.carbs} onChange={(e) => setComida({ ...comida, carbs: e.target.value,    per100: null })} min={0} />
                <input type="number" placeholder="grasa (g)"  value={comida.fat}   onChange={(e) => setComida({ ...comida, fat: e.target.value,      per100: null })} min={0} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => { setMostrarFormComida(false); setResultados([]); setBusqueda('') }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Añadir</button>
              </div>
            </form>
          )}

          {todayLog.length === 0 ? (
            <div className="empty-state">
              <UtensilsCrossed size={48} />
              <h2>Sin registros hoy</h2>
              <p>Pulsa + para añadir lo que has comido</p>
            </div>
          ) : (
            <div className="list">
              {MEAL_TYPES.filter((mt) => todayLog.some((e) => e.mealType === mt)).map((mt) => (
                <div key={mt}>
                  <h3 className="meal-group-title">{mt}</h3>
                  {todayLog.filter((e) => e.mealType === mt).map((entrada) => (
                    <div key={entrada.id} className="list-item">
                      <div className="list-item-content">
                        <p className="food-name">{entrada.name}</p>
                        <p className="food-macros">
                          {entrada.calories} kcal · {entrada.protein}g P · {entrada.carbs}g C · {entrada.fat}g G
                        </p>
                      </div>
                      <button className="icon-btn danger" onClick={() => removeFromLog(entrada.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {pestana === 'planes' && (
        <>
          {mostrarFormPlan && (
            <form className="card form-card" onSubmit={handleCrearPlan}>
              <h2>Nuevo plan de dieta</h2>
              <input placeholder="Nombre del plan" value={nombrePlan} onChange={(e) => setNombrePlan(e.target.value)} required autoFocus />
              <input placeholder="Objetivo (ej: Volumen, Definición)" value={objetivoPlan} onChange={(e) => setObjetivoPlan(e.target.value)} />
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setMostrarFormPlan(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear</button>
              </div>
            </form>
          )}

          {dietPlans.length === 0 ? (
            <div className="empty-state">
              <UtensilsCrossed size={48} />
              <h2>Sin planes de dieta</h2>
              <p>Crea un plan para organizar tus comidas semanales</p>
            </div>
          ) : (
            <div className="list">
              {dietPlans.map((plan) => (
                <div key={plan.id} className="list-item">
                  <div className="list-item-content">
                    <h3>{plan.name}</h3>
                    <p>{plan.goal || `${plan.meals.length} comidas`}</p>
                  </div>
                  <button className="icon-btn danger" onClick={() => deleteDietPlan(plan.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {mostrarScanner && (
        <Suspense fallback={<div className="modal-overlay"><div className="modal"><p className="loading-text">Cargando cámara...</p></div></div>}>
          <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setMostrarScanner(false)} />
        </Suspense>
      )}
    </div>
  )
}
