import SignaturePad from 'signature_pad'
import type { PointGroup } from 'signature_pad'
import type {
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
  SignatureKitEventHandler,
  WatermarkOptions,
} from './types'
import { drawWatermark } from './watermark'

const MAX_UNDO_STACK = 50

export class SignatureKit {
  private _sigPad: SignaturePad
  private _canvas: HTMLCanvasElement
  private _options: SignatureKitOptions
  private _undoStack: PointGroup[][] = []
  private _listeners: Map<SignatureKitEventType, Set<SignatureKitEventHandler>> =
    new Map()
  private _resizeObserver: ResizeObserver | null = null
  private _lastSize = { width: 0, height: 0 }

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
    this._sigPad.addEventListener('beginStroke', (e: Event) => {
      const detail = (e as CustomEvent).detail
      this._emit('beginStroke', {
        type: 'beginStroke',
        originalEvent: detail?.event,
      })
    })
    this._sigPad.addEventListener('endStroke', (e: Event) => {
      const detail = (e as CustomEvent).detail
      this._emit('endStroke', {
        type: 'endStroke',
        originalEvent: detail?.event,
      })
    })
    this._sigPad.addEventListener('beforeUpdateStroke', () => {
      this._emit('beforeUpdateStroke', { type: 'beforeUpdateStroke' })
    })
    this._sigPad.addEventListener('afterUpdateStroke', () => {
      this._emit('afterUpdateStroke', { type: 'afterUpdateStroke' })
    })

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
    this._listeners.get(event)?.delete(handler)
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
    this._emit('clear', { type: 'clear' })
  }

  isEmpty(): boolean {
    return this._sigPad.isEmpty()
  }

  toDataURL(type?: string, encoderOptions?: number): string {
    return this._sigPad.toDataURL(type, encoderOptions)
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
    return this._sigPad.fromDataURL(url, options)
  }

  fromData(data: PointGroup[]): void {
    this._sigPad.fromData(data)
  }

  toData(): PointGroup[] {
    return this._sigPad.toData()
  }

  // --- SignatureKit-specific ---

  undo(): void {
    const data = this._sigPad.toData()
    if (data.length === 0) return
    this._saveUndoState()
    data.pop()
    this._sigPad.clear()
    this._sigPad.fromData(data, { clear: false })
    this._emit('undo', { type: 'undo' })
  }

  addWatermark(options: WatermarkOptions): void {
    const ctx = this._canvas.getContext('2d')
    if (ctx) {
      drawWatermark(ctx, options)
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
        // Scale stroke points proportionally
        const ratio = Math.min(newWidth / width, newHeight / height)
        const scaledData = data.map((group) => ({
          ...group,
          points: group.points.map((point) => ({
            ...point,
            x: point.x * ratio,
            y: point.y * ratio,
          })),
        }))
        this._sigPad.fromData(scaledData, { clear: false })
      } else {
        // Restore without scaling
        this._sigPad.fromData(data, { clear: false })
      }
    }

    this._lastSize = { width: newWidth, height: newHeight }
  }

  private _saveUndoState(): void {
    if (this._undoStack.length >= MAX_UNDO_STACK) {
      this._undoStack.shift()
    }
    this._undoStack.push(this._sigPad.toData())
  }

  // --- Lifecycle ---

  destroy(): void {
    this._resizeObserver?.disconnect()
    this._sigPad.off()
    this._listeners.clear()
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
    Object.assign(this._sigPad, options)
    if (options.disabled !== undefined) {
      this.disabled = options.disabled
    }
  }
}
