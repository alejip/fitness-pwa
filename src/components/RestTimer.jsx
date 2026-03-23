import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react'

export default function RestTimer({ defaultSeconds = 60, onClose }) {
  const [total, setTotal] = useState(defaultSeconds)
  const [remaining, setRemaining] = useState(defaultSeconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Beep al llegar a 0
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (_) {}
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            playBeep()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const reset = () => {
    clearInterval(intervalRef.current)
    setRemaining(total)
    setRunning(true)
  }

  const changeTotal = (secs) => {
    setTotal(secs)
    setRemaining(secs)
    setRunning(true)
  }

  const pct = (remaining / total) * 100
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const presets = [30, 60, 90, 120, 180]

  return (
    <div className="timer-overlay" onClick={onClose}>
      <div className="timer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 className="timer-title"><Timer size={18} /> Descanso</h2>

        <svg className="timer-ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} className="ring-bg" />
          <circle
            cx="60" cy="60" r={radius}
            className={`ring-progress ${remaining === 0 ? 'ring-done' : ''}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
          />
        </svg>

        <div className="timer-display">
          {mins > 0 && <span>{mins}:</span>}
          <span>{String(secs).padStart(2, '0')}</span>
        </div>

        <div className="timer-controls">
          <button className="icon-btn" onClick={reset}><RotateCcw size={20} /></button>
          <button className="btn-primary timer-play" onClick={() => setRunning(r => !r)}>
            {running ? <Pause size={22} /> : <Play size={22} />}
          </button>
        </div>

        <div className="timer-presets">
          {presets.map((s) => (
            <button
              key={s}
              className={`chip ${total === s ? 'active' : ''}`}
              onClick={() => changeTotal(s)}
            >
              {s >= 60 ? `${s / 60}min` : `${s}s`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
