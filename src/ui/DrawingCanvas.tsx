import { useEffect, useRef, useState } from 'react'

export function DrawingCanvas({
  glyph,
  onPlayAudio,
}: {
  glyph: string
  onPlayAudio?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  const drawBackgroundGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)

    // Lignes de guidage d'écriture
    ctx.strokeStyle = 'rgba(31, 111, 92, 0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([6, 6])

    // Ligne médiane / baseline
    ctx.beginPath()
    ctx.moveTo(0, height * 0.65)
    ctx.lineTo(width, height * 0.65)
    ctx.stroke()
    ctx.setLineDash([])

    // Lettre filigrane de guidage
    ctx.font = `${height * 0.55}px "Noto Naskh Arabic", "Amiri", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(31, 111, 92, 0.18)'
    ctx.fillText(glyph, width / 2, height / 2)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * (window.devicePixelRatio || 1)
    canvas.height = rect.height * (window.devicePixelRatio || 1)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

    drawBackgroundGuide(ctx, rect.width, rect.height)
  }, [glyph])

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)

    ctx.strokeStyle = '#1F6F5C'
    ctx.lineWidth = 10
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    drawBackgroundGuide(ctx, rect.width, rect.height)
    setHasDrawn(false)
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      const touch = e.touches[0]
      if (!touch) return { x: 0, y: 0 }
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    }
  }

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="canvas-pad"
        onMouseDown={(e) => {
          const { x, y } = getCoordinates(e)
          startDrawing(x, y)
        }}
        onMouseMove={(e) => {
          const { x, y } = getCoordinates(e)
          draw(x, y)
        }}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          const { x, y } = getCoordinates(e)
          startDrawing(x, y)
        }}
        onTouchMove={(e) => {
          const { x, y } = getCoordinates(e)
          draw(x, y)
        }}
        onTouchEnd={stopDrawing}
      />

      <div className="canvas-controls">
        {onPlayAudio && (
          <button type="button" className="canvas-btn" onClick={onPlayAudio} aria-label="Écouter">
            🔊 Écouter
          </button>
        )}
        <button
          type="button"
          className="canvas-btn canvas-btn--clear"
          onClick={clearCanvas}
          disabled={!hasDrawn}
        >
          🗑️ Effacer
        </button>
      </div>
    </div>
  )
}
