import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { SignatureKit } from '@tinyforged/signature-kit'
import type {
  SignatureKitOptions,
  WatermarkOptions,
  TrimOptions,
  PointGroup,
} from '@tinyforged/signature-kit'
import type { SignatureCanvasProps, SignatureCanvasRef } from './types'

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  function SignatureCanvas(props, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const kitRef = useRef<SignatureKit | null>(null)

    const buildOptions = useCallback((): SignatureKitOptions => {
      return {
        penColor: props.penColor ?? 'black',
        backgroundColor: props.backgroundColor ?? 'rgba(0,0,0,0)',
        minWidth: props.minWidth,
        maxWidth: props.maxWidth,
        minDistance: props.minDistance,
        dotSize: props.dotSize,
        velocityFilterWeight: props.velocityFilterWeight,
        throttle: props.throttle,
        clearOnResize: props.clearOnResize,
        scaleOnResize: props.scaleOnResize,
        disabled: props.disabled,
      }
    }, [
      props.penColor,
      props.backgroundColor,
      props.minWidth,
      props.maxWidth,
      props.minDistance,
      props.dotSize,
      props.velocityFilterWeight,
      props.throttle,
      props.clearOnResize,
      props.scaleOnResize,
      props.disabled,
    ])

    useEffect(() => {
      if (!canvasRef.current) return
      const kit = new SignatureKit(canvasRef.current, buildOptions())
      kitRef.current = kit

      kit.on('beginStroke', (detail) => props.onBegin?.(detail.originalEvent!))
      kit.on('endStroke', (detail) => props.onEnd?.(detail.originalEvent!))
      kit.on('clear', () => props.onClear?.())
      kit.on('undo', () => props.onUndo?.())
      kit.on('redo', () => props.onRedo?.())

      if (props.defaultUrl) {
        kit.fromDataURL(props.defaultUrl)
      }
      if (props.watermark) {
        kit.addWatermark(props.watermark)
      }

      return () => {
        kit.destroy()
        kitRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      kitRef.current?.updateOptions(buildOptions())
    }, [buildOptions])

    useImperativeHandle(ref, () => ({
      isEmpty: () => kitRef.current?.isEmpty() ?? true,
      clear: () => kitRef.current?.clear(),
      save: (type?: string) => {
        const url = kitRef.current?.toDataURL(type) ?? ''
        props.onSave?.(url)
        return url
      },
      undo: () => kitRef.current?.undo(),
      redo: () => kitRef.current?.redo(),
      canUndo: () => kitRef.current?.canUndo ?? false,
      canRedo: () => kitRef.current?.canRedo ?? false,
      toDataURL: (type?: string, encoderOptions?: number) =>
        kitRef.current?.toDataURL(type, encoderOptions) ?? '',
      toBlob: (type?: string, quality?: number) =>
        kitRef.current?.toBlob(type, quality) ?? Promise.reject(new Error('No kit')),
      toFile: (filename?: string, type?: string, quality?: number) =>
        kitRef.current?.toFile(filename, type, quality) ?? Promise.reject(new Error('No kit')),
      toSVG: () => kitRef.current?.toSVG() ?? '',
      fromDataURL: (url: string) =>
        kitRef.current?.fromDataURL(url) ?? Promise.resolve(),
      fromFile: (file: File | Blob) =>
        kitRef.current?.fromFile(file) ?? Promise.resolve(),
      toData: () => kitRef.current?.toData() ?? [],
      fromData: (data: PointGroup[]) => kitRef.current?.fromData(data),
      addWatermark: (options: WatermarkOptions) =>
        kitRef.current?.addWatermark(options),
      clearWatermark: () => kitRef.current?.clearWatermark(),
      trim: (options?: TrimOptions) =>
        kitRef.current?.trim(options) ?? null,
      getKit: () => kitRef.current,
      getCanvas: () => canvasRef.current,
    }))

    const { canvasProps } = props
    const canvasOnlyProps: React.CanvasHTMLAttributes<HTMLCanvasElement> = {
      ...(canvasProps ?? {}),
      style: {
        width: '100%',
        height: '100%',
        ...(canvasProps?.style ?? {}),
      },
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} {...canvasOnlyProps} />
      </div>
    )
  },
)

export { SignatureCanvas }
