import { NavLink } from 'react-router-dom'
import { Dumbbell, UtensilsCrossed, BarChart2, TrendingUp, Search, Sun, Moon, User } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const navItems = [
  { to: '/',           icon: BarChart2,       label: 'Hoy' },
  { to: '/rutinas',    icon: Dumbbell,        label: 'Rutinas' },
  { to: '/dieta',      icon: UtensilsCrossed, label: 'Dieta' },
  { to: '/ejercicios', icon: Search,          label: 'Buscar' },
  { to: '/progreso',   icon: TrendingUp,      label: 'Progreso' },
  { to: '/perfil',     icon: User,            label: 'Perfil' },
]

export default function BottomNav() {
  const { theme, toggleTheme } = useAppStore()

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className="nav-item theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
      </button>
    </nav>
  )
}
