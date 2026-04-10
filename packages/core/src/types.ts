import type { Options as SignaturePadOptions } from 'signature_pad'

/** Options for SignatureKit (extends SignaturePad options) */
export interface SignatureKitOptions extends SignaturePadOptions {
  /** Clear canvas when the container resizes. Default: false */
  clearOnResize?: boolean
  /** Scale signature data when the container resizes. Default: true */
  scaleOnResize?: boolean
  /** Whether the signature pad is disabled/read-only. Default: false */
  disabled?: boolean
}

/** Watermark configuration */
export interface WatermarkOptions {
  /** Watermark text */
  text?: string
  /** Font CSS string. Default: '20px sans-serif' */
  font?: string
  /** Render style: 'all' | 'fill' | 'stroke'. Default: 'fill' */
  style?: 'all' | 'fill' | 'stroke'
  /** Fill color. Default: '#333' */
  fillStyle?: string
  /** Stroke color. Default: '#333' */
  strokeStyle?: string
  /** Fill position X. Default: 20 */
  x?: number
  /** Fill position Y. Default: 20 */
  y?: number
  /** Stroke position X. Default: 40 */
  sx?: number
  /** Stroke position Y. Default: 40 */
  sy?: number
}

/** Event names emitted by SignatureKit */
export type SignatureKitEventType =
  | 'beginStroke'
  | 'endStroke'
  | 'beforeUpdateStroke'
  | 'afterUpdateStroke'
  | 'clear'
  | 'undo'

/** Event detail payload */
export interface SignatureKitEventDetail {
  type: SignatureKitEventType
  originalEvent?: MouseEvent | TouchEvent | PointerEvent
}

export type SignatureKitEventHandler = (detail: SignatureKitEventDetail) => void
