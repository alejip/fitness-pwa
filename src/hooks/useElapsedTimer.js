import { useState, useEffect } from 'react'

export default function useElapsedTimer(startedAt) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!startedAt) return
    const tick = () => {
      setSeconds(Math.floor((Date.now() - new Date(startedAt)) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const formatted = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return { seconds, formatted }
}
