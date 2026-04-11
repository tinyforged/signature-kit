import 'canvas'
import ResizeObserver from 'resize-observer-polyfill'

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserver as unknown as typeof globalThis.ResizeObserver
}
