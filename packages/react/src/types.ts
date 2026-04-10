import type { WatermarkOptions } from '@tinyforged/signature-kit'

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

  /** Watermark options */
  watermark?: WatermarkOptions

  /** Load a signature from a data URL on mount */
  defaultUrl?: string
}

export interface SignatureCanvasRef {
  isEmpty: () => boolean
  clear: () => void
  undo: () => void
  toDataURL: (type?: string, encoderOptions?: number) => string
  toSVG: () => string
  fromDataURL: (url: string) => Promise<void>
  toData: () => import('@tinyforged/signature-kit').PointGroup[]
  fromData: (data: import('@tinyforged/signature-kit').PointGroup[]) => void
  addWatermark: (options: WatermarkOptions) => void
  getKit: () => import('@tinyforged/signature-kit').SignatureKit | null
  getCanvas: () => HTMLCanvasElement | null
}
