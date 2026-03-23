import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode('barcode-reader-div')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 140 } },
          (text) => {
            onScan(text)
            scanner.stop().catch(() => {})
          },
          () => {}
        )
        startedRef.current = true
      } catch (err) {
        console.error('BarcodeScanner error:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (scannerRef.current && startedRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 style={{ marginBottom: '1rem' }}>Escanear código de barras</h2>
        <div id="barcode-reader-div" style={{ width: '100%' }} />
        <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
