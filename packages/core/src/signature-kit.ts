import SignaturePad from 'signature_pad'
import type { PointGroup } from 'signature_pad'
import type {
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
  SignatureKitEventHandler,
  WatermarkOptions,
  TrimOptions,
  TrimResult,
} from './types'
import { drawWatermark } from './watermark'

const MAX_UNDO_STACK = 50

// Keys that belong to SignaturePad (not our custom extensions)
const SIG_PAD_KEYS = new Set([
  'penColor',
  'backgroundColor',
  'minWidth',
  'maxWidth',
  'minDistance',
  'dotSize',
  'velocityFilterWeight',
  'throttle',
])

export class SignatureKit {
  private _sigPad: SignaturePad
  private _canvas: HTMLCanvasElement
  private _options: SignatureKitOptions
  private _undoStack: PointGroup[][] = []
  private _redoStack: PointGroup[][] = []
  private _watermarkOptions: WatermarkOptions | null = null
  private _listeners: Map<SignatureKitEventType, Set<SignatureKitEventHandler>> =
    new Map()
  private _resizeObserver: ResizeObserver | null = null
  private _lastSize = { width: 0, height: 0 }
  private _colorCache = new Map<string, [number, number, number, number] | null>()
  private _sigPadListeners: Array<{ event: string; handler: EventListener }> = []

  constructor(canvas: HTMLCanvasElement, options: SignatureKitOptions = {}) {
    this._canvas = canvas
    this._options = options

    // Set canvas resolution to match display size * devicePixelRatio
    this._resizeCanvas()

    this._sigPad = new SignaturePad(canvas, options)
    this._lastSize = {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    }

    // Forward signature_pad native events
    const onBeginStroke = (e: Event) => {
      const detail = (e as CustomEvent).detail
      this._emit('beginStroke', {
        type: 'beginStroke',
        originalEvent: detail?.event,
      })
    }
    const onEndStroke = (e: Event) => {
      const detail = (e as CustomEvent).detail
      this._emit('endStroke', {
        type: 'endStroke',
        originalEvent: detail?.event,
      })
      // New stroke invalidates redo stack
      this._redoStack.length = 0
    }
    const onBeforeUpdateStroke = () => {
      this._emit('beforeUpdateStroke', { type: 'beforeUpdateStroke' })
    }
    const onAfterUpdateStroke = () => {
      this._emit('afterUpdateStroke', { type: 'afterUpdateStroke' })
    }

    this._sigPadListeners = [
      { event: 'beginStroke', handler: onBeginStroke },
      { event: 'endStroke', handler: onEndStroke },
      { event: 'beforeUpdateStroke', handler: onBeforeUpdateStroke },
      { event: 'afterUpdateStroke', handler: onAfterUpdateStroke },
    ]
    for (const { event, handler } of this._sigPadListeners) {
      this._sigPad.addEventListener(event, handler)
    }

    // Disabled on init
    if (options.disabled) {
      this._sigPad.off()
    }

    // Resize handling
    this._setupResizeObserver()
  }

  /**
   * Set canvas internal resolution to match CSS display size * devicePixelRatio,
   * then scale the context so drawing coordinates map 1:1 with CSS pixels.
   */
  private _resizeCanvas(): void {
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const width = this._canvas.offsetWidth || this._canvas.parentElement?.clientWidth || 300
    const height = this._canvas.offsetHeight || this._canvas.parentElement?.clientHeight || 150

    this._canvas.width = width * ratio
    this._canvas.height = height * ratio

    const ctx = this._canvas.getContext('2d')
    ctx?.scale(ratio, ratio)
  }

  // --- Event system ---

  on(event: SignatureKitEventType, handler: SignatureKitEventHandler): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event)!.add(handler)
  }

  off(event: SignatureKitEventType, handler: SignatureKitEventHandler): void {
    const set = this._listeners.get(event)
    set?.delete(handler)
    if (set?.size === 0) {
      this._listeners.delete(event)
    }
  }

  /** Remove all custom event listeners */
  offAll(): void {
    this._listeners.clear()
  }

  private _emit(
    event: SignatureKitEventType,
    detail: SignatureKitEventDetail,
  ): void {
    this._listeners.get(event)?.forEach((handler) => handler(detail))
  }

  // --- SignaturePad passthrough ---

  clear(): void {
    this._saveUndoState()
    this._sigPad.clear()
    this._applyWatermark()
    this._emit('clear', { type: 'clear' })
  }

  reset(): void {
    this._sigPad.clear()
    this._undoStack.length = 0
    this._redoStack.length = 0
    this._watermarkOptions = null
    this._emit('reset', { type: 'reset' })
  }

  isEmpty(): boolean {
    return this._sigPad.isEmpty()
  }

  toDataURL(type?: string, encoderOptions?: number): string {
    return this._sigPad.toDataURL(type, encoderOptions)
  }

  toBlob(type?: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this._canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
        type ?? 'image/png',
        quality,
      )
    })
  }

  toFile(filename?: string, type?: string, quality?: number): Promise<File> {
    return this.toBlob(type, quality).then(
      (blob) => new File([blob], filename ?? 'signature.png', { type: type ?? 'image/png' }),
    )
  }

  toSVG(options?: {
    includeBackgroundColor?: boolean
    includeDataUrl?: boolean
  }): string {
    return this._sigPad.toSVG(options)
  }

  fromDataURL(
    url: string,
    options?: { ratio?: number; width?: number; height?: number },
  ): Promise<void> {
    return this._sigPad.fromDataURL(url, options).then(() => {
      this._undoStack.length = 0
      this._redoStack.length = 0
      this._applyWatermark()
    })
  }

  fromFile(
    file: File | Blob,
    options?: { ratio?: number; width?: number; height?: number },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this._sigPad
            .fromDataURL(reader.result, options)
            .then(() => {
              this._undoStack.length = 0
              this._redoStack.length = 0
              this._applyWatermark()
              resolve()
            })
            .catch(reject)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  fromData(data: PointGroup[]): void {
    this._sigPad.fromData(data)
  }

  toData(): PointGroup[] {
    return this._sigPad.toData()
  }

  // --- SignatureKit-specific ---

  trim(options?: TrimOptions): TrimResult | null {
    if (this._sigPad.isEmpty()) return null

    const ctx = this._canvas.getContext('2d')
    if (!ctx) return null

    const { width, height } = this._canvas
    if (width === 0 || height === 0) return null

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Parse background color to RGBA
    const bgColor = this._parseColor(
      options?.backgroundColor ?? this._options.backgroundColor ?? 'rgba(0,0,0,0)',
    )

    // Find bounding box of non-background pixels
    let top = height
    let left = width
    let right = -1
    let bottom = -1

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        if (!this._matchesBackground(data, idx, bgColor)) {
          if (x < left) left = x
          if (x > right) right = x
          if (y < top) top = y
          if (y > bottom) bottom = y
        }
      }
    }

    if (right === -1 || bottom === -1) return null

    const padding = options?.padding ?? 0
    const bx = Math.max(0, left - padding)
    const by = Math.max(0, top - padding)
    const bw = Math.min(width, right + 1 + padding) - bx
    const bh = Math.min(height, bottom + 1 + padding) - by

    if (bw <= 0 || bh <= 0) return null

    // Create trimmed canvas
    const trimmed = document.createElement('canvas')
    trimmed.width = bw
    trimmed.height = bh
    const trimmedCtx = trimmed.getContext('2d')!
    trimmedCtx.drawImage(this._canvas, bx, by, bw, bh, 0, 0, bw, bh)

    const format = options?.format ?? 'image/png'
    const dataUrl = options?.quality
      ? trimmed.toDataURL(format, options.quality)
      : trimmed.toDataURL(format)

    return {
      canvas: trimmed,
      dataUrl,
      bounds: { x: bx, y: by, width: bw, height: bh },
    }
  }

  /** Parse a CSS color string to [r, g, b, a] or null (cached) */
  private _parseColor(color: string): [number, number, number, number] | null {
    if (this._colorCache.has(color)) return this._colorCache.get(color)!
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      const result: [number, number, number, number] = [r, g, b, a]
      this._colorCache.set(color, result)
      return result
    } catch {
      this._colorCache.set(color, null)
      return null
    }
  }

  /** Check if pixel at index matches the background color */
  private _matchesBackground(
    data: Uint8ClampedArray,
    index: number,
    bg: [number, number, number, number] | null,
  ): boolean {
    if (!bg) return data[index + 3] === 0
    return (
      data[index] === bg[0] &&
      data[index + 1] === bg[1] &&
      data[index + 2] === bg[2] &&
      data[index + 3] === bg[3]
    )
  }

  undo(): void {
    const data = this._sigPad.toData()
    if (data.length === 0) return
    // Save current state to redo stack
    if (this._redoStack.length >= MAX_UNDO_STACK) {
      this._redoStack.shift()
    }
    this._redoStack.push(this._cloneData(data))
    // Remove last stroke
    data.pop()
    this._sigPad.clear()
    this._sigPad.fromData(data, { clear: false })
    this._applyWatermark()
    this._emit('undo', { type: 'undo' })
  }

  redo(): void {
    if (this._redoStack.length === 0) return
    const state = this._redoStack.pop()!
    // Save current state to undo stack
    if (this._undoStack.length >= MAX_UNDO_STACK) {
      this._undoStack.shift()
    }
    this._undoStack.push(this._cloneData(this._sigPad.toData()))
    // Restore redo state
    this._sigPad.clear()
    this._sigPad.fromData(state, { clear: false })
    this._applyWatermark()
    this._emit('redo', { type: 'redo' })
  }

  get canUndo(): boolean {
    return this._sigPad.toData().length > 0
  }

  get canRedo(): boolean {
    return this._redoStack.length > 0
  }

  addWatermark(options: WatermarkOptions): void {
    this._watermarkOptions = options
    this._applyWatermark()
  }

  clearWatermark(): void {
    this._watermarkOptions = null
    // Redraw canvas from stroke data to remove watermark
    const data = this._sigPad.toData()
    this._sigPad.clear()
    if (data.length > 0) {
      this._sigPad.fromData(data, { clear: false })
    }
  }

  get watermark(): WatermarkOptions | null {
    return this._watermarkOptions
  }

  /** Draw the stored watermark onto the canvas (if any) */
  private _applyWatermark(): void {
    if (!this._watermarkOptions) return
    const ctx = this._canvas.getContext('2d')
    if (ctx) {
      drawWatermark(ctx, this._watermarkOptions)
    }
  }

  // --- Resize handling ---

  private _setupResizeObserver(): void {
    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize()
    })
    this._resizeObserver.observe(this._canvas.parentElement ?? this._canvas)
  }

  private _handleResize(): void {
    const { width, height } = this._lastSize
    const newWidth = this._canvas.offsetWidth
    const newHeight = this._canvas.offsetHeight

    if (newWidth === width && newHeight === height) return

    // Capture current strokes before resizing
    const data = this._sigPad.toData()
    const hasSignature = data.length > 0

    // Resize canvas resolution
    this._resizeCanvas()

    this._sigPad.clear()

    if (!this._options.clearOnResize && hasSignature) {
      if (this._options.scaleOnResize !== false) {
        // Scale stroke points independently in X and Y
        const ratioX = width > 0 && height > 0 ? newWidth / width : 1
        const ratioY = width > 0 && height > 0 ? newHeight / height : 1
        const scaledData = data.map((group) => ({
          ...group,
          points: group.points.map((point) => ({
            ...point,
            x: point.x * ratioX,
            y: point.y * ratioY,
          })),
        }))
        this._sigPad.fromData(scaledData, { clear: false })
      } else {
        // Restore without scaling
        this._sigPad.fromData(data, { clear: false })
      }
    }

    this._applyWatermark()

    this._lastSize = { width: newWidth, height: newHeight }

    // Emit resize event and callback
    this._emit('resize', { type: 'resize' })
    this._options.onResize?.({ width: newWidth, height: newHeight })
  }

  private _saveUndoState(): void {
    if (this._undoStack.length >= MAX_UNDO_STACK) {
      this._undoStack.shift()
    }
    this._undoStack.push(this._cloneData(this._sigPad.toData()))
  }

  private _cloneData(data: PointGroup[]): PointGroup[] {
    return data.map((group) => ({
      ...group,
      points: group.points.map((point) => ({ ...point })),
    }))
  }

  // --- Lifecycle ---

  destroy(): void {
    this._resizeObserver?.disconnect()
    for (const { event, handler } of this._sigPadListeners) {
      this._sigPad.removeEventListener(event, handler)
    }
    this._sigPadListeners.length = 0
    this._sigPad.off()
    this._undoStack.length = 0
    this._redoStack.length = 0
    this._watermarkOptions = null
    this._listeners.clear()
    this._colorCache.clear()
  }

  // --- Accessors ---

  get signaturePad(): SignaturePad {
    return this._sigPad
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas
  }

  get disabled(): boolean {
    return this._options.disabled ?? false
  }

  set disabled(value: boolean) {
    this._options.disabled = value
    if (value) {
      this._sigPad.off()
    } else {
      this._sigPad.on()
    }
  }

  /** Update options on the fly */
  updateOptions(options: Partial<SignatureKitOptions>): void {
    this._options = { ...this._options, ...options }

    // Only assign SignaturePad-compatible options with non-undefined values
    const sigPadOptions: Record<string, unknown> = {}
    for (const key of SIG_PAD_KEYS) {
      if ((options as Record<string, unknown>)[key] !== undefined) {
        sigPadOptions[key] = (options as Record<string, unknown>)[key]
      }
    }

    const needRepaint = sigPadOptions.backgroundColor !== undefined
    Object.assign(this._sigPad, sigPadOptions)

    // backgroundColor setter only updates internal state, need to repaint
    if (needRepaint) {
      const data = this._sigPad.toData()
      this._sigPad.clear()
      if (data.length > 0) {
        this._sigPad.fromData(data, { clear: false })
      }
      this._applyWatermark()
    }

    if (options.disabled !== undefined) {
      this.disabled = options.disabled
    }
  }
}
