import { useImperativeHandle, forwardRef } from 'react'
import { useSignatureKit } from './useSignatureKit'
import type { WatermarkOptions } from '@tinyforged/signature-kit'
import type { SignatureCanvasProps, SignatureCanvasRef } from './types'

const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  function SignatureCanvas(props, ref) {
    const {
      canvasRef,
      canUndo: hookCanUndo,
      canRedo: hookCanRedo,
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
    } = useSignatureKit({
      penColor: props.penColor,
      backgroundColor: props.backgroundColor,
      minWidth: props.minWidth,
      maxWidth: props.maxWidth,
      minDistance: props.minDistance,
      dotSize: props.dotSize,
      velocityFilterWeight: props.velocityFilterWeight,
      throttle: props.throttle,
      clearOnResize: props.clearOnResize,
      scaleOnResize: props.scaleOnResize,
      disabled: props.disabled,
      defaultUrl: props.defaultUrl,
      watermark: props.watermark,
      onBegin: props.onBegin,
      onEnd: props.onEnd,
      onClear: props.onClear,
      onUndo: props.onUndo,
      onRedo: props.onRedo,
    })

    useImperativeHandle(ref, () => ({
      isEmpty,
      clear,
      reset,
      save: (type?: string) => {
        const url = toDataURL(type)
        props.onSave?.(url)
        return url
      },
      undo,
      redo,
      canUndo: () => hookCanUndo,
      canRedo: () => hookCanRedo,
      toDataURL,
      toBlob,
      toFile,
      toSVG,
      fromDataURL,
      fromFile,
      toData,
      fromData,
      addWatermark: (options: WatermarkOptions) => addWatermark(options),
      clearWatermark,
      trim,
      getKit,
      getCanvas,
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
