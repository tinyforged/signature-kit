<template>
  <div
    :class="['signature-canvas-container', props.customClass]"
    :style="containerStyle"
  >
    <canvas ref="canvasRef" :style="{ width: '100%', height: '100%' }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useSignatureKit } from './useSignatureKit'
import type { SignatureCanvasProps, SignatureCanvasEmits } from './types'

const props = withDefaults(defineProps<SignatureCanvasProps>(), {
  width: '100%',
  height: '100%',
  clearOnResize: false,
  scaleOnResize: true,
  disabled: false,
  penColor: 'rgb(0, 0, 0)',
  backgroundColor: 'rgb(255, 255, 255)',
})

const emit = defineEmits<SignatureCanvasEmits>()

const {
  canvasRef,
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
} = useSignatureKit({
  penColor: toRef(props, 'penColor'),
  backgroundColor: toRef(props, 'backgroundColor'),
  minWidth: toRef(props, 'minWidth'),
  maxWidth: toRef(props, 'maxWidth'),
  minDistance: toRef(props, 'minDistance'),
  dotSize: toRef(props, 'dotSize'),
  velocityFilterWeight: toRef(props, 'velocityFilterWeight'),
  throttle: toRef(props, 'throttle'),
  clearOnResize: toRef(props, 'clearOnResize'),
  scaleOnResize: toRef(props, 'scaleOnResize'),
  disabled: toRef(props, 'disabled'),
  defaultUrl: toRef(props, 'defaultUrl'),
  watermark: toRef(props, 'watermark'),
  onBegin: (e) => emit('beginStroke', e),
  onEnd: (e) => emit('endStroke', e),
  onClear: () => emit('clear'),
  onUndo: () => emit('undo'),
  onRedo: () => emit('redo'),
})

// canvasRef is used as a template ref on <canvas ref="canvasRef">
void canvasRef

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  position: 'relative' as const,
}))

function save(type: string = 'image/png'): string {
  const dataUrl = toDataURL(type)
  emit('save', dataUrl)
  return dataUrl
}

defineExpose({
  save,
  clear,
  reset,
  isEmpty,
  undo,
  redo,
  canUndo: () => canUndo.value,
  canRedo: () => canRedo.value,
  addWatermark,
  clearWatermark,
  fromDataURL,
  fromFile,
  toDataURL,
  toBlob,
  toFile,
  toSVG,
  trim,
  toData,
  fromData,
  getKit,
  getCanvas,
})
</script>
