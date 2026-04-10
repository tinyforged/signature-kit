<template>
  <div class="demo">
    <!-- Signature controls -->
    <div class="controls">
      <div class="control-row">
        <label>
          Pen Color:
          <input type="color" v-model="penColor" />
        </label>
        <label>
          Background:
          <input type="color" v-model="backgroundColor" />
        </label>
      </div>
      <div class="control-row">
        <label>
          Min Width: {{ minWidth }}
          <input type="range" min="0.1" max="5" step="0.1" v-model.number="minWidth" />
        </label>
        <label>
          Max Width: {{ maxWidth }}
          <input type="range" min="0.5" max="10" step="0.5" v-model.number="maxWidth" />
        </label>
      </div>
      <div class="button-row">
        <button @click="handleSave('image/png')">Save PNG</button>
        <button @click="handleSave('image/jpeg')">Save JPEG</button>
        <button @click="handleSaveSVG">Save SVG</button>
        <button @click="handleClear">Clear</button>
        <button @click="handleUndo" :disabled="!canUndo">Undo</button>
        <button @click="handleRedo" :disabled="!canRedo">Redo</button>
        <button @click="isDisabled = !isDisabled">
          {{ isDisabled ? 'Enable' : 'Disable' }}
        </button>
      </div>
    </div>

    <!-- Watermark controls -->
    <details class="watermark-section">
      <summary>Watermark Settings</summary>
      <div class="watermark-controls">
        <div class="control-row">
          <label>
            Text:
            <textarea v-model="wm.text" rows="2" placeholder="Signature Kit&#10;TinyForged"></textarea>
          </label>
        </div>
        <div class="control-row">
          <label>
            Font Size: {{ wm.fontSize }}
            <input type="range" min="10" max="60" step="1" v-model.number="wm.fontSize" />
          </label>
          <label>
            Line Height: {{ wm.lineHeight }}
            <input type="range" min="1" max="3" step="0.1" v-model.number="wm.lineHeight" />
          </label>
          <label>
            Rotation: {{ wm.rotation }}°
            <input type="range" min="-180" max="180" step="1" v-model.number="wm.rotation" />
          </label>
        </div>
        <div class="control-row">
          <label>
            Font:
            <select v-model="wm.fontFamily">
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="cursive">Cursive</option>
            </select>
          </label>
          <label>
            Style:
            <select v-model="wm.fontStyle">
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
              <option value="oblique">Oblique</option>
            </select>
          </label>
          <label>
            Weight:
            <select v-model="wm.fontWeight">
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="lighter">Lighter</option>
              <option value="100">100</option>
              <option value="300">300</option>
              <option value="900">900</option>
            </select>
          </label>
        </div>
        <div class="control-row">
          <label>
            Render:
            <select v-model="wm.style">
              <option value="fill">Fill</option>
              <option value="stroke">Stroke</option>
              <option value="all">Fill + Stroke</option>
            </select>
          </label>
          <label>
            Fill Color:
            <input type="color" v-model="wm.fillStyleHex" />
          </label>
          <label>
            Opacity: {{ wm.opacity }}
            <input type="range" min="0.05" max="1" step="0.05" v-model.number="wm.opacity" />
          </label>
        </div>
        <div class="control-row">
          <label>
            Align:
            <select v-model="wm.align">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label>
            Baseline:
            <select v-model="wm.baseline">
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
              <option value="alphabetic">Alphabetic</option>
            </select>
          </label>
          <label>
            X: {{ wm.x }}
            <input type="range" min="0" max="400" step="5" v-model.number="wm.x" />
          </label>
          <label>
            Y: {{ wm.y }}
            <input type="range" min="0" max="300" step="5" v-model.number="wm.y" />
          </label>
        </div>
        <div class="button-row">
          <button @click="handleWatermark">Apply Watermark</button>
        </div>
      </div>
    </details>

    <div class="canvas-wrapper">
      <SignatureCanvas
        ref="sigRef"
        :pen-color="penColor"
        :background-color="backgroundColor"
        :min-width="minWidth"
        :max-width="maxWidth"
        :disabled="isDisabled"
        width="100%"
        height="300px"
        custom-class="sig-canvas"
        @begin-stroke="onBegin"
        @end-stroke="onEnd"
        @save="onSave"
        @undo="onUndo"
        @redo="onRedo"
      />
    </div>

    <div v-if="previewUrl" class="preview">
      <h3>Preview:</h3>
      <img :src="previewUrl" alt="Signature preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { SignatureCanvas } from '@tinyforged/signature-kit-vue'

const sigRef = ref<InstanceType<typeof SignatureCanvas> | null>(null)

const penColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const minWidth = ref(0.5)
const maxWidth = ref(2.5)
const isDisabled = ref(false)
const previewUrl = ref('')
const canUndo = ref(false)
const canRedo = ref(false)

const wm = reactive({
  text: 'Signature Kit\nTinyForged',
  fontSize: 24,
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic' as const,
  fontWeight: 'bold' as string | number,
  style: 'fill' as const,
  fillStyleHex: '#000000',
  opacity: 0.15,
  lineWidth: 1,
  x: 20,
  y: 20,
  rotation: -25,
  lineHeight: 1.6,
  align: 'left' as const,
  baseline: 'top' as const,
})

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function handleSave(type: string) {
  const url = sigRef.value?.save(type)
  if (url) {
    previewUrl.value = url
    const a = document.createElement('a')
    a.href = url
    a.download = `signature.${type === 'image/png' ? 'png' : 'jpg'}`
    a.click()
  }
}

function handleSaveSVG() {
  const svg = sigRef.value?.toSVG()
  if (svg) {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    previewUrl.value = URL.createObjectURL(blob)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'signature.svg'
    a.click()
  }
}

function handleClear() {
  sigRef.value?.clear()
  previewUrl.value = ''
  updateCanStates()
}

function handleUndo() {
  sigRef.value?.undo()
  updateCanStates()
}

function handleRedo() {
  sigRef.value?.redo()
  updateCanStates()
}

function handleWatermark() {
  sigRef.value?.addWaterMark({
    text: wm.text,
    fontSize: wm.fontSize,
    fontFamily: wm.fontFamily,
    fontStyle: wm.fontStyle,
    fontWeight: wm.fontWeight,
    style: wm.style,
    fillStyle: hexToRgba(wm.fillStyleHex, 1),
    strokeStyle: hexToRgba(wm.fillStyleHex, 1),
    opacity: wm.opacity,
    lineWidth: wm.lineWidth,
    x: wm.x,
    y: wm.y,
    rotation: wm.rotation,
    lineHeight: wm.lineHeight,
    align: wm.align,
    baseline: wm.baseline,
  })
}

function onBegin() { updateCanStates() }
function onEnd() { updateCanStates() }
function onUndo() { updateCanStates() }
function onRedo() { updateCanStates() }
function onSave(_dataUrl: string) {}

function updateCanStates() {
  canUndo.value = sigRef.value?.canUndo() ?? false
  canRedo.value = sigRef.value?.canRedo() ?? false
}
</script>

<style scoped>
.demo {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  margin-bottom: 1rem;
}

.control-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.control-row label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.button-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
}

button:hover:not(:disabled) {
  background: #f0f0f0;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.watermark-section {
  margin-bottom: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 0.75rem;
}

.watermark-section summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.watermark-controls {
  padding-top: 0.5rem;
}

textarea {
  width: 200px;
  font-size: 0.85rem;
  padding: 0.25rem 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

select {
  font-size: 0.85rem;
  padding: 0.2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.canvas-wrapper {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.sig-canvas {
  width: 100%;
  height: 300px;
}

.preview {
  margin-top: 1rem;
}

.preview img {
  max-width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
