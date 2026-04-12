import type {
  WatermarkOptions,
  TrimOptions,
  TrimResult,
  PointGroup,
} from '@tinyforged/signature-kit'
import type { Ref } from 'vue'

/** Accepts a plain value or a Vue ref */
type MaybeRef<T> = T | Ref<T>

export interface SignatureCanvasProps {
  /** Pen color. Default: 'rgb(0, 0, 0)' */
  penColor?: string
  /** Background color. Default: 'rgb(255, 255, 255)' */
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

  /** Container width. CSS value. Default: '100%' */
  width?: string
  /** Container height. CSS value. Default: '100%' */
  height?: string

  /** Clear canvas on resize. Default: false */
  clearOnResize?: boolean
  /** Scale signature on resize. Default: true */
  scaleOnResize?: boolean

  /** Disable drawing. Default: false */
  disabled?: boolean

  /** Load a signature from a data URL on mount */
  defaultUrl?: string

  /** Watermark options */
  watermark?: WatermarkOptions

  /** Custom CSS class for the wrapper div */
  customClass?: string
}

export interface SignatureCanvasEmits {
  (e: 'beginStroke', event: MouseEvent | TouchEvent | PointerEvent): void
  (e: 'endStroke', event: MouseEvent | TouchEvent | PointerEvent): void
  (e: 'clear'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'save', dataUrl: string): void
}

// --- useSignatureKit composable types ---

export interface UseSignatureKitOptions {
  penColor?: MaybeRef<string | undefined>
  backgroundColor?: MaybeRef<string | undefined>
  minWidth?: MaybeRef<number | undefined>
  maxWidth?: MaybeRef<number | undefined>
  minDistance?: MaybeRef<number | undefined>
  dotSize?: MaybeRef<number | undefined>
  velocityFilterWeight?: MaybeRef<number | undefined>
  throttle?: MaybeRef<number | undefined>
  clearOnResize?: MaybeRef<boolean | undefined>
  scaleOnResize?: MaybeRef<boolean | undefined>
  disabled?: MaybeRef<boolean | undefined>
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
  defaultUrl?: MaybeRef<string | undefined>
  /** Watermark options (applied on mount and when changed) */
  watermark?: MaybeRef<WatermarkOptions | undefined>
}

export interface UseSignatureKitReturn {
  /** Template ref to attach to your own <canvas> element */
  canvasRef: Ref<HTMLCanvasElement | null>
  /** Whether undo is available (reactive) */
  canUndo: Readonly<Ref<boolean>>
  /** Whether redo is available (reactive) */
  canRedo: Readonly<Ref<boolean>>
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
