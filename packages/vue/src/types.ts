import type { WatermarkOptions } from '@tinyforged/signature-kit'

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
  (e: 'save', dataUrl: string): void
}
