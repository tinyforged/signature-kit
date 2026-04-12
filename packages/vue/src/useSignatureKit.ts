import { ref, readonly, onMounted, onBeforeUnmount, watch, unref } from 'vue'
import { SignatureKit } from '@tinyforged/signature-kit'
import type {
  SignatureKitOptions,
  WatermarkOptions,
  TrimOptions,
  TrimResult,
  PointGroup,
} from '@tinyforged/signature-kit'
import type { UseSignatureKitOptions, UseSignatureKitReturn } from './types'

export function useSignatureKit(
  options: UseSignatureKitOptions = {},
): UseSignatureKitReturn {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const canUndo = ref(false)
  const canRedo = ref(false)

  let kit: SignatureKit | null = null

  function syncState() {
    if (!kit) return
    canUndo.value = kit.canUndo
    canRedo.value = kit.canRedo
  }

  function syncEvents() {
    if (!kit) return
    kit.offAll()
    kit.on('beginStroke', (detail) => options.onBegin?.(detail.originalEvent!))
    kit.on('endStroke', (detail) => {
      syncState()
      options.onEnd?.(detail.originalEvent!)
    })
    kit.on('clear', () => {
      syncState()
      options.onClear?.()
    })
    kit.on('undo', () => {
      syncState()
      options.onUndo?.()
    })
    kit.on('redo', () => {
      syncState()
      options.onRedo?.()
    })
  }

  function buildOptions(): SignatureKitOptions {
    return {
      penColor: unref(options.penColor) ?? 'rgb(0, 0, 0)',
      backgroundColor: unref(options.backgroundColor) ?? 'rgb(255, 255, 255)',
      minWidth: unref(options.minWidth),
      maxWidth: unref(options.maxWidth),
      minDistance: unref(options.minDistance),
      dotSize: unref(options.dotSize),
      velocityFilterWeight: unref(options.velocityFilterWeight),
      throttle: unref(options.throttle),
      clearOnResize: unref(options.clearOnResize),
      scaleOnResize: unref(options.scaleOnResize),
      disabled: unref(options.disabled),
    }
  }

  onMounted(() => {
    if (!canvasRef.value) return
    kit = new SignatureKit(canvasRef.value, buildOptions())
    syncEvents()

    const url = unref(options.defaultUrl)
    if (url) {
      kit.fromDataURL(url).then(() => syncState())
    } else {
      syncState()
    }
    const wm = unref(options.watermark)
    if (wm) {
      kit.addWatermark(wm)
    }
  })

  onBeforeUnmount(() => {
    kit?.destroy()
    kit = null
  })

  // Watch drawing options
  watch(
    () => [
      unref(options.penColor),
      unref(options.backgroundColor),
      unref(options.minWidth),
      unref(options.maxWidth),
      unref(options.minDistance),
      unref(options.dotSize),
      unref(options.velocityFilterWeight),
      unref(options.throttle),
      unref(options.clearOnResize),
      unref(options.scaleOnResize),
    ],
    () => {
      if (kit) kit.updateOptions(buildOptions())
    },
  )

  // Watch disabled separately
  watch(
    () => unref(options.disabled),
    (val) => {
      if (kit && val !== undefined) kit.disabled = val
    },
  )

  // Watch watermark
  watch(
    () => unref(options.watermark),
    (val) => {
      if (!kit) return
      if (val) {
        kit.addWatermark(val)
      } else {
        kit.clearWatermark()
      }
    },
  )

  // Watch callback changes to re-register events
  watch(
    () => [options.onBegin, options.onEnd, options.onClear, options.onUndo, options.onRedo],
    () => syncEvents(),
  )

  // --- Methods ---

  function isEmpty(): boolean {
    return kit?.isEmpty() ?? true
  }

  function clear(): void {
    kit?.clear()
    syncState()
  }

  function reset(): void {
    kit?.reset()
    syncState()
  }

  function undo(): void {
    kit?.undo()
    syncState()
  }

  function redo(): void {
    kit?.redo()
    syncState()
  }

  function toDataURL(type?: string, encoderOptions?: number): string {
    return kit?.toDataURL(type, encoderOptions) ?? ''
  }

  function toBlob(type?: string, quality?: number): Promise<Blob> {
    return kit?.toBlob(type, quality) ?? Promise.reject(new Error('No kit'))
  }

  function toFile(filename?: string, type?: string, quality?: number): Promise<File> {
    return kit?.toFile(filename, type, quality) ?? Promise.reject(new Error('No kit'))
  }

  function toSVG(): string {
    return kit?.toSVG() ?? ''
  }

  function fromDataURL(url: string): Promise<void> {
    return kit?.fromDataURL(url)?.then(() => syncState()) ?? Promise.resolve()
  }

  function fromFile(file: File | Blob): Promise<void> {
    return kit?.fromFile(file)?.then(() => syncState()) ?? Promise.resolve()
  }

  function toData(): PointGroup[] {
    return kit?.toData() ?? []
  }

  function fromData(data: PointGroup[]): void {
    kit?.fromData(data)
  }

  function addWatermark(wmOptions: WatermarkOptions): void {
    kit?.addWatermark(wmOptions)
  }

  function clearWatermark(): void {
    kit?.clearWatermark()
  }

  function trim(trimOptions?: TrimOptions): TrimResult | null {
    return kit?.trim(trimOptions) ?? null
  }

  function getKit(): SignatureKit | null {
    return kit
  }

  function getCanvas(): HTMLCanvasElement | null {
    return canvasRef.value
  }

  return {
    canvasRef,
    canUndo: readonly(canUndo),
    canRedo: readonly(canRedo),
    isEmpty,
    clear,
    reset,
    undo,
    redo,
    toDataURL,
    toBlob,
    toFile,
    toSVG,
    fromDataURL,
    fromFile,
    toData,
    fromData,
    addWatermark,
    clearWatermark,
    trim,
    getKit,
    getCanvas,
  }
}
