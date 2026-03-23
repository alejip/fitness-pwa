import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppStore } from './store/useAppStore'
import BottomNav from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import Routines from './pages/Routines'
import RoutineDetail from './pages/RoutineDetail'
import Diet from './pages/Diet'
import Exercises from './pages/Exercises'
import Weight from './pages/Weight'
import Perfil from './pages/Perfil'
import ActiveWorkout from './pages/ActiveWorkout'
import WorkoutSummary from './pages/WorkoutSummary'
import Progreso from './pages/Progreso'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function OnboardingRedirect() {
  const perfil = useAppStore((s) => s.perfil)
  const navigate = useNavigate()
  const location = useLocation()
  const workoutRoutes = ['/entreno']

  useEffect(() => {
    const inWorkout = workoutRoutes.some((r) => location.pathname.startsWith(r))
    if (!perfil && !inWorkout) navigate('/perfil', { replace: true })
  }, [])

  return null
}

function ThemedApp() {
  const theme         = useAppStore((s) => s.theme)
  const activeWorkout = useAppStore((s) => s.activeWorkout)
  const location      = useLocation()

  const hideNav = location.pathname.startsWith('/entreno')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <OnboardingRedirect />
      <div className="app">
        <main className={`main-content ${hideNav ? 'full-height' : ''}`}>
          <Routes>
            {/* Rutas de entreno — sin nav, pantalla completa */}
            <Route path="/entreno/resumen"  element={<WorkoutSummary />} />
            <Route path="/entreno/:id"      element={<ActiveWorkout />} />

            {/* Rutas normales */}
            <Route path="/"            element={<Dashboard />} />
            <Route path="/rutinas"     element={<Routines />} />
            <Route path="/rutinas/:id" element={<RoutineDetail />} />
            <Route path="/dieta"       element={<Diet />} />
            <Route path="/ejercicios"  element={<Exercises />} />
            <Route path="/progreso"   element={<Progreso />} />
            <Route path="/peso"        element={<Weight />} />
            <Route path="/perfil"      element={<Perfil />} />
          </Routes>
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemedApp />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
