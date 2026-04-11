<template>
  <div
    :class="['signature-canvas-container', props.customClass]"
    :style="containerStyle"
  >
    <canvas ref="canvasRef" :style="{ width: '100%', height: '100%' }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { SignatureKit } from '@tinyforged/signature-kit'
import type {
  SignatureKitOptions,
  WatermarkOptions,
  TrimOptions,
  TrimResult,
} from '@tinyforged/signature-kit'
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

const canvasRef = ref<HTMLCanvasElement | null>(null)
let kit: SignatureKit | null = null

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  position: 'relative' as const,
}))

function buildOptions(): SignatureKitOptions {
  return {
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
  }
}

onMounted(() => {
  if (!canvasRef.value) return
  kit = new SignatureKit(canvasRef.value, buildOptions())

  kit.on('beginStroke', (detail) => emit('beginStroke', detail.originalEvent!))
  kit.on('endStroke', (detail) => emit('endStroke', detail.originalEvent!))
  kit.on('clear', () => emit('clear'))
  kit.on('undo', () => emit('undo'))
  kit.on('redo', () => emit('redo'))

  if (props.defaultUrl) {
    kit.fromDataURL(props.defaultUrl)
  }
  if (props.watermark) {
    kit.addWatermark(props.watermark)
  }
})

onBeforeUnmount(() => {
  kit?.destroy()
  kit = null
})

// React to option changes
watch(
  () => [
    props.penColor,
    props.backgroundColor,
    props.minWidth,
    props.maxWidth,
    props.minDistance,
    props.dotSize,
    props.velocityFilterWeight,
    props.throttle,
  ],
  () => {
    if (kit) kit.updateOptions(buildOptions())
  },
)

watch(
  () => props.disabled,
  (val) => {
    if (kit) kit.disabled = val
  },
)

// --- Exposed methods ---

function save(type: string = 'image/png'): string {
  const dataUrl = kit!.toDataURL(type)
  emit('save', dataUrl)
  return dataUrl
}

function clear(): void {
  kit!.clear()
}

function isEmpty(): boolean {
  return kit!.isEmpty()
}

function undo(): void {
  kit!.undo()
}

function redo(): void {
  kit!.redo()
}

function canUndo(): boolean {
  return kit!.canUndo
}

function canRedo(): boolean {
  return kit!.canRedo
}

function addWatermark(options: WatermarkOptions): void {
  kit!.addWatermark(options)
}

function clearWatermark(): void {
  kit!.clearWatermark()
}

function fromDataURL(url: string): Promise<void> {
  return kit!.fromDataURL(url)
}

function fromFile(file: File | Blob): Promise<void> {
  return kit!.fromFile(file)
}

function toDataURL(type?: string, encoderOptions?: number): string {
  return kit!.toDataURL(type, encoderOptions)
}

function toBlob(type?: string, quality?: number): Promise<Blob> {
  return kit!.toBlob(type, quality)
}

function toFile(filename?: string, type?: string, quality?: number): Promise<File> {
  return kit!.toFile(filename, type, quality)
}

function toSVG(): string {
  return kit!.toSVG()
}

function trim(options?: TrimOptions): TrimResult | null {
  return kit!.trim(options)
}

defineExpose({
  save,
  clear,
  isEmpty,
  undo,
  redo,
  canUndo,
  canRedo,
  addWatermark,
  clearWatermark,
  fromDataURL,
  fromFile,
  toDataURL,
  toBlob,
  toFile,
  toSVG,
  trim,
  getKit: () => kit,
  getCanvas: () => canvasRef.value,
})
</script>
