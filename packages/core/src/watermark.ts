import type { WatermarkOptions } from './types'

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  text: '',
  font: '20px sans-serif',
  style: 'fill',
  fillStyle: '#333',
  strokeStyle: '#333',
  x: 20,
  y: 20,
  sx: 40,
  sy: 40,
}

/**
 * Renders a watermark on the given canvas context.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  options: WatermarkOptions = {},
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  if (!opts.text) return

  if (opts.style === 'fill' || opts.style === 'all') {
    ctx.save()
    ctx.font = opts.font
    ctx.fillStyle = opts.fillStyle
    ctx.fillText(opts.text, opts.x, opts.y)
    ctx.restore()
  }

  if (opts.style === 'stroke' || opts.style === 'all') {
    ctx.save()
    ctx.font = opts.font
    ctx.strokeStyle = opts.strokeStyle
    ctx.strokeText(opts.text, opts.sx, opts.sy)
    ctx.restore()
  }
}
