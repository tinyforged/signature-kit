import type {
  WatermarkOptions,
  SignatureKitOptions,
  TrimOptions,
  TrimResult,
  PointGroup,
} from '@tinyforged/signature-kit'

export interface SignatureCanvasProps {
  /** Pen color. Default: 'black' */
  penColor?: string
  /** Background color. Default: 'rgba(0,0,0,0)' */
  backgroundColor?: string
  /** Minimum stroke width. Default: 0.5 */
  minWidth?: number
  /** Maximum stroke width. Default: 2.5 */
  maxWidth?: number
  /** Minimum distance between points. Default: 5 */
  minDistance?: number
  /** Dot size for single clicks. Default: 0 */
  dotSize?: number
  /** Velocity filter weight. Default: 0.7 */
  velocityFilterWeight?: number
  /** Throttle interval in ms. Default: 16 */
  throttle?: number

  /** Clear canvas on resize. Default: false */
  clearOnResize?: boolean
  /** Scale signature on resize. Default: true */
  scaleOnResize?: boolean

  /** Disable drawing. Default: false */
  disabled?: boolean

  /** Additional HTML attributes passed to the <canvas> element */
  canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>

  /** Callback when a stroke begins */
  onBegin?: (event: MouseEvent | TouchEvent | PointerEvent) => void
  /** Callback when a stroke ends */
  onEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void
  /** Callback when canvas is cleared */
  onClear?: () => void
  /** Callback when undo is performed */
  onUndo?: () => void
  /** Callback when redo is performed */
  onRedo?: () => void
  /** Callback when save() is called */
  onSave?: (dataUrl: string) => void

  /** Watermark options */
  watermark?: WatermarkOptions

  /** Load a signature from a data URL on mount */
  defaultUrl?: string
}

export interface SignatureCanvasRef {
  isEmpty: () => boolean
  clear: () => void
  reset: () => void
  save: (type?: string) => string
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  toDataURL: (type?: string, encoderOptions?: number) => string
  toBlob: (type?: string, quality?: number) => Promise<Blob>
  toFile: (filename?: string, type?: string, quality?: number) => Promise<File>
  toSVG: () => string
  fromDataURL: (url: string) => Promise<void>
  fromFile: (file: File | Blob) => Promise<void>
  toData: () => import('@tinyforged/signature-kit').PointGroup[]
  fromData: (data: import('@tinyforged/signature-kit').PointGroup[]) => void
  addWatermark: (options: WatermarkOptions) => void
  clearWatermark: () => void
  trim: (options?: import('@tinyforged/signature-kit').TrimOptions) => import('@tinyforged/signature-kit').TrimResult | null
  getKit: () => import('@tinyforged/signature-kit').SignatureKit | null
  getCanvas: () => HTMLCanvasElement | null
}

// --- useSignatureKit hook types ---

export interface UseSignatureKitOptions extends SignatureKitOptions {
  /** Callback when a stroke begins */
  onBegin?: (event: MouseEvent | TouchEvent | PointerEvent) => void
  /** Callback when a stroke ends */
  onEnd?: (event: MouseEvent | TouchEvent | PointerEvent) => void
  /** Callback when canvas is cleared */
  onClear?: () => void
  /** Callback when undo is performed */
  onUndo?: () => void
  /** Callback when redo is performed */
  onRedo?: () => void
  /** Load a signature from a data URL on mount */
  defaultUrl?: string
  /** Watermark options (applied on mount and when changed) */
  watermark?: WatermarkOptions
}

export interface UseSignatureKitReturn {
  /** Ref to attach to your own <canvas> element */
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  /** Whether undo is available (reactive) */
  canUndo: boolean
  /** Whether redo is available (reactive) */
  canRedo: boolean
  isEmpty: () => boolean
  clear: () => void
  reset: () => void
  undo: () => void
  redo: () => void
  toDataURL: (type?: string, encoderOptions?: number) => string
  toBlob: (type?: string, quality?: number) => Promise<Blob>
  toFile: (filename?: string, type?: string, quality?: number) => Promise<File>
  toSVG: () => string
  fromDataURL: (url: string) => Promise<void>
  fromFile: (file: File | Blob) => Promise<void>
  toData: () => PointGroup[]
  fromData: (data: PointGroup[]) => void
  addWatermark: (options: WatermarkOptions) => void
  clearWatermark: () => void
  trim: (options?: TrimOptions) => TrimResult | null
  getKit: () => import('@tinyforged/signature-kit').SignatureKit | null
  getCanvas: () => HTMLCanvasElement | null
}
