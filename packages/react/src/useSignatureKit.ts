import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { SignatureKit } from '@tinyforged/signature-kit'
import type {
  SignatureKitOptions,
  WatermarkOptions,
  TrimOptions,
  PointGroup,
} from '@tinyforged/signature-kit'
import type { UseSignatureKitOptions, UseSignatureKitReturn } from './types'

export function useSignatureKit(
  options: UseSignatureKitOptions = {},
): UseSignatureKitReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const kitRef = useRef<SignatureKit | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Store latest callbacks to avoid stale closures
  const callbacksRef = useRef({
    onBegin: options.onBegin,
    onEnd: options.onEnd,
    onClear: options.onClear,
    onUndo: options.onUndo,
    onRedo: options.onRedo,
  })
  callbacksRef.current = {
    onBegin: options.onBegin,
    onEnd: options.onEnd,
    onClear: options.onClear,
    onUndo: options.onUndo,
    onRedo: options.onRedo,
  }

  const buildOptions = useCallback((): SignatureKitOptions => {
    return {
      penColor: options.penColor ?? 'black',
      backgroundColor: options.backgroundColor ?? 'rgba(0,0,0,0)',
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      minDistance: options.minDistance,
      dotSize: options.dotSize,
      velocityFilterWeight: options.velocityFilterWeight,
      throttle: options.throttle,
      clearOnResize: options.clearOnResize,
      scaleOnResize: options.scaleOnResize,
      disabled: options.disabled,
    }
  }, [
    options.penColor,
    options.backgroundColor,
    options.minWidth,
    options.maxWidth,
    options.minDistance,
    options.dotSize,
    options.velocityFilterWeight,
    options.throttle,
    options.clearOnResize,
    options.scaleOnResize,
    options.disabled,
  ])

  const syncState = useCallback(() => {
    const kit = kitRef.current
    if (!kit) return
    setCanUndo(kit.canUndo)
    setCanRedo(kit.canRedo)
  }, [])

  // Mount effect: create kit, register events, load defaults
  useEffect(() => {
    if (!canvasRef.current) return
    const kit = new SignatureKit(canvasRef.current, buildOptions())
    kitRef.current = kit

    // Register events — callbacksRef ensures fresh closures
    kit.on('beginStroke', (detail) =>
      callbacksRef.current.onBegin?.(detail.originalEvent!),
    )
    kit.on('endStroke', (detail) => {
      setCanUndo(kit.canUndo)
      setCanRedo(kit.canRedo)
      callbacksRef.current.onEnd?.(detail.originalEvent!)
    })
    kit.on('clear', () => {
      setCanUndo(kit.canUndo)
      setCanRedo(kit.canRedo)
      callbacksRef.current.onClear?.()
    })
    kit.on('undo', () => {
      setCanUndo(kit.canUndo)
      setCanRedo(kit.canRedo)
      callbacksRef.current.onUndo?.()
    })
    kit.on('redo', () => {
      setCanUndo(kit.canUndo)
      setCanRedo(kit.canRedo)
      callbacksRef.current.onRedo?.()
    })

    // Load defaults
    if (options.defaultUrl) {
      kit.fromDataURL(options.defaultUrl).then(() => {
        setCanUndo(kit.canUndo)
        setCanRedo(kit.canRedo)
      })
    } else {
      setCanUndo(kit.canUndo)
      setCanRedo(kit.canRedo)
    }
    if (options.watermark) {
      kit.addWatermark(options.watermark)
    }

    return () => {
      kit.destroy()
      kitRef.current = null
    }
  }, [])

  // Options update effect
  useEffect(() => {
    if (!kitRef.current) return
    kitRef.current.updateOptions(buildOptions())
  }, [buildOptions])

  // Watermark effect
  useEffect(() => {
    if (!kitRef.current) return
    if (options.watermark) {
      kitRef.current.addWatermark(options.watermark)
    } else {
      kitRef.current.clearWatermark()
    }
  }, [options.watermark])

  // --- Methods ---

  const isEmpty = useCallback(() => kitRef.current?.isEmpty() ?? true, [])
  const clear = useCallback(() => {
    kitRef.current?.clear()
    syncState()
  }, [syncState])
  const reset = useCallback(() => {
    kitRef.current?.reset()
    syncState()
  }, [syncState])
  const undo = useCallback(() => {
    kitRef.current?.undo()
    syncState()
  }, [syncState])
  const redo = useCallback(() => {
    kitRef.current?.redo()
    syncState()
  }, [syncState])

  const toDataURL = useCallback(
    (type?: string, encoderOptions?: number) =>
      kitRef.current?.toDataURL(type, encoderOptions) ?? '',
    [],
  )
  const toBlob = useCallback(
    (type?: string, quality?: number) =>
      kitRef.current?.toBlob(type, quality) ??
      Promise.reject(new Error('No kit')),
    [],
  )
  const toFile = useCallback(
    (filename?: string, type?: string, quality?: number) =>
      kitRef.current?.toFile(filename, type, quality) ??
      Promise.reject(new Error('No kit')),
    [],
  )
  const toSVG = useCallback(() => kitRef.current?.toSVG() ?? '', [])

  const fromDataURL = useCallback(
    (url: string) =>
      kitRef.current?.fromDataURL(url)?.then(() => syncState()) ??
      Promise.resolve(),
    [syncState],
  )
  const fromFile = useCallback(
    (file: File | Blob) =>
      kitRef.current?.fromFile(file)?.then(() => syncState()) ??
      Promise.resolve(),
    [syncState],
  )

  const toData = useCallback(() => kitRef.current?.toData() ?? [], [])
  const fromData = useCallback(
    (data: PointGroup[]) => kitRef.current?.fromData(data),
    [],
  )

  const addWatermark = useCallback(
    (wmOptions: WatermarkOptions) => kitRef.current?.addWatermark(wmOptions),
    [],
  )
  const clearWatermark = useCallback(
    () => kitRef.current?.clearWatermark(),
    [],
  )

  const trim = useCallback(
    (trimOptions?: TrimOptions) => kitRef.current?.trim(trimOptions) ?? null,
    [],
  )

  const getKit = useCallback(() => kitRef.current, [])
  const getCanvas = useCallback(() => canvasRef.current, [])

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement | null>,
    canUndo,
    canRedo,
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
