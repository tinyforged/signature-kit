<template>
  <div class="demo">
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
        <button @click="handleUndo">Undo</button>
        <button @click="handleWatermark">Add Watermark</button>
        <button @click="isDisabled = !isDisabled">
          {{ isDisabled ? 'Enable' : 'Disable' }}
        </button>
      </div>
    </div>

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
      />
    </div>

    <div v-if="previewUrl" class="preview">
      <h3>Preview:</h3>
      <img :src="previewUrl" alt="Signature preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SignatureCanvas } from '@tinyforged/signature-kit-vue'

const sigRef = ref<InstanceType<typeof SignatureCanvas> | null>(null)

const penColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const minWidth = ref(0.5)
const maxWidth = ref(2.5)
const isDisabled = ref(false)
const previewUrl = ref('')

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
}

function handleUndo() {
  sigRef.value?.undo()
}

function handleWatermark() {
  sigRef.value?.addWaterMark({ text: 'Signature Kit', style: 'all' })
}

function onBegin(_event: MouseEvent | TouchEvent | PointerEvent) {
  console.log('Stroke began')
}

function onEnd(_event: MouseEvent | TouchEvent | PointerEvent) {
  console.log('Stroke ended')
}

function onSave(dataUrl: string) {
  console.log('Saved:', dataUrl.substring(0, 50) + '...')
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

button:hover {
  background: #f0f0f0;
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
