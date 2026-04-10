import type { Options as SignaturePadOptions } from 'signature_pad'

/** Options for SignatureKit (extends SignaturePad options) */
export interface SignatureKitOptions extends SignaturePadOptions {
  /** Clear canvas when the container resizes. Default: false */
  clearOnResize?: boolean
  /** Scale signature data when the container resizes. Default: true */
  scaleOnResize?: boolean
  /** Whether the signature pad is disabled/read-only. Default: false */
  disabled?: boolean
  /** Callback when the canvas resizes */
  onResize?: (size: { width: number; height: number }) => void
}

/** Watermark configuration */
export interface WatermarkOptions {
  /** Watermark text. Supports multi-line via `\n` */
  text?: string

  // Font
  /** Font size in px. Default: 20 */
  fontSize?: number
  /** Font family. Default: 'sans-serif' */
  fontFamily?: string
  /** Font style. Default: 'normal' */
  fontStyle?: 'normal' | 'italic' | 'oblique'
  /** Font weight. Default: 'normal' */
  fontWeight?: string | number
  /** Font variant. Default: 'normal' */
  fontVariant?: 'normal' | 'small-caps'

  // Color & render
  /** Render style. Default: 'fill' */
  style?: 'fill' | 'stroke' | 'all'
  /** Fill color. Default: 'rgba(0,0,0,0.15)' */
  fillStyle?: string
  /** Stroke color. Default: 'rgba(0,0,0,0.15)' */
  strokeStyle?: string
  /** Global opacity 0-1. Default: 1 */
  opacity?: number
  /** Stroke line width (stroke mode only). Default: 1 */
  lineWidth?: number

  // Layout
  /** Start position X. Default: 20 */
  x?: number
  /** Start position Y. Default: 20 */
  y?: number
  /** Rotation angle in degrees. Default: 0 */
  rotation?: number
  /** Line height multiplier for multi-line text. Default: 1.5 */
  lineHeight?: number
  /** Text alignment. Default: 'left' */
  align?: 'left' | 'center' | 'right'
  /** Text baseline. Default: 'top' */
  baseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'
}

/** Event names emitted by SignatureKit */
export type SignatureKitEventType =
  | 'beginStroke'
  | 'endStroke'
  | 'beforeUpdateStroke'
  | 'afterUpdateStroke'
  | 'clear'
  | 'undo'
  | 'redo'
  | 'resize'

/** Event detail payload */
export interface SignatureKitEventDetail {
  type: SignatureKitEventType
  originalEvent?: MouseEvent | TouchEvent | PointerEvent
}

export type SignatureKitEventHandler = (detail: SignatureKitEventDetail) => void

/** Options for trim() */
export interface TrimOptions {
  /** Export format: 'image/png', 'image/jpeg', etc. Default: 'image/png' */
  format?: string
  /** Encoder quality for lossy formats (0-1). Default: undefined */
  quality?: number
  /** Override background color for detection. Default: uses the pad's backgroundColor */
  backgroundColor?: string
  /** Padding in pixels around the trimmed area. Default: 0 */
  padding?: number
}

/** Result of trim() */
export interface TrimResult {
  /** Trimmed canvas element */
  canvas: HTMLCanvasElement
  /** Trimmed image as data URL */
  dataUrl: string
  /** Bounding box: { x, y, width, height } in canvas pixels */
  bounds: { x: number; y: number; width: number; height: number }
}
