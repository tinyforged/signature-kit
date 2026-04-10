import type { WatermarkOptions } from './types'

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  text: '',
  fontSize: 20,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontVariant: 'normal',
  style: 'fill',
  fillStyle: 'rgba(0,0,0,0.15)',
  strokeStyle: 'rgba(0,0,0,0.15)',
  opacity: 1,
  lineWidth: 1,
  x: 20,
  y: 20,
  rotation: 0,
  lineHeight: 1.5,
  align: 'left',
  baseline: 'top',
}

/**
 * Renders a watermark on the given canvas context.
 * Supports multi-line text, rotation, alignment, opacity, and rich font options.
 */
export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  options: WatermarkOptions = {},
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  if (!opts.text) return

  // Build font string: "italic small-caps bold 20px sans-serif"
  const font = [
    opts.fontStyle,
    opts.fontVariant,
    opts.fontWeight,
    `${opts.fontSize}px`,
    opts.fontFamily,
  ].join(' ')

  const lines = opts.text.split('\n')
  const lineHeightPx = opts.fontSize * opts.lineHeight

  ctx.save()
  ctx.font = font
  ctx.textAlign = opts.align
  ctx.textBaseline = opts.baseline
  ctx.globalAlpha = opts.opacity

  // Apply rotation around (x, y)
  if (opts.rotation !== 0) {
    ctx.translate(opts.x, opts.y)
    ctx.rotate((opts.rotation * Math.PI) / 180)
    ctx.translate(-opts.x, -opts.y)
  }

  const doFill = opts.style === 'fill' || opts.style === 'all'
  const doStroke = opts.style === 'stroke' || opts.style === 'all'

  if (doStroke) {
    ctx.strokeStyle = opts.strokeStyle
    ctx.lineWidth = opts.lineWidth
  }
  if (doFill) {
    ctx.fillStyle = opts.fillStyle
  }

  for (let i = 0; i < lines.length; i++) {
    const lineY = opts.y + i * lineHeightPx
    if (doFill) {
      ctx.fillText(lines[i], opts.x, lineY)
    }
    if (doStroke) {
      ctx.strokeText(lines[i], opts.x, lineY)
    }
  }

  ctx.restore()
}
