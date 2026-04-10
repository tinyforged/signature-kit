<template>
  <div class="demo">
    <!-- Left: Canvas + Preview -->
    <div class="main-area">
      <div class="toolbar">
        <div class="toolbar-group">
          <button class="btn btn-primary" @click="handleSave('image/png')">PNG</button>
          <button class="btn btn-primary" @click="handleSave('image/jpeg')">JPEG</button>
          <button class="btn btn-primary" @click="handleSaveSVG">SVG</button>
          <button class="btn btn-outline" @click="handleTrim">&#9986; Trim</button>
        </div>
        <div class="toolbar-group">
          <button class="btn" @click="handleUndo" :disabled="!canUndo">&#8617; Undo</button>
          <button class="btn" @click="handleRedo" :disabled="!canRedo">&#8618; Redo</button>
          <button class="btn" @click="handleClear">&#128465; Clear</button>
          <button class="btn" :class="{ active: isDisabled }" @click="isDisabled = !isDisabled">
            {{ isDisabled ? '&#9999; Edit' : '&#128274; Lock' }}
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
          height="100%"
          custom-class="sig-canvas"
          @begin-stroke="onBegin"
          @end-stroke="onEnd"
          @save="onSave"
          @undo="onUndo"
          @redo="onRedo"
        />
        <div v-if="isDisabled" class="disabled-overlay">
          <span>Read-only mode</span>
        </div>
      </div>
      <div v-if="previewUrl" class="preview-section">
        <div class="preview-header">
          <span>Preview</span>
          <button class="btn-close" @click="previewUrl = ''">&#10005;</button>
        </div>
        <div class="preview-body">
          <img :src="previewUrl" alt="Signature preview" />
        </div>
      </div>
    </div>

    <!-- Right: Settings panel -->
    <aside class="sidebar">
      <details class="panel-collapsible" open>
        <summary class="panel-summary">
          <h3 class="panel-title">Pen &amp; Background</h3>
          <span class="panel-arrow">&#9662;</span>
        </summary>
        <div class="panel-body">
          <div class="field-row">
            <label class="field-label">Pen Color</label>
            <div class="color-wrap">
              <input type="color" v-model="penColor" />
              <code class="color-hex">{{ penColor }}</code>
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Background</label>
            <div class="color-wrap">
              <input type="color" v-model="backgroundColor" />
              <code class="color-hex">{{ backgroundColor }}</code>
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Min Width</label>
            <div class="slider-wrap">
              <input type="range" min="0.1" max="5" step="0.1" v-model.number="minWidth" />
              <span class="slider-val">{{ minWidth }}</span>
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Max Width</label>
            <div class="slider-wrap">
              <input type="range" min="0.5" max="10" step="0.5" v-model.number="maxWidth" />
              <span class="slider-val">{{ maxWidth }}</span>
            </div>
          </div>
        </div>
      </details>

      <details class="panel-collapsible" open>
        <summary class="panel-summary">
          <h3 class="panel-title">Watermark</h3>
          <span class="panel-arrow">&#9662;</span>
        </summary>
        <div class="panel-body">
          <div class="field-row">
            <label class="field-label">Text</label>
            <textarea v-model="wm.text" rows="2" placeholder="Line 1&#10;Line 2"></textarea>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Font</label>
              <select v-model="wm.fontFamily">
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="cursive">Cursive</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">Style</label>
              <select v-model="wm.fontStyle">
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">Weight</label>
              <select v-model="wm.fontWeight">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="100">100</option>
                <option value="300">300</option>
                <option value="900">900</option>
              </select>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Size</label>
              <div class="slider-wrap">
                <input type="range" min="10" max="60" step="1" v-model.number="wm.fontSize" />
                <span class="slider-val">{{ wm.fontSize }}px</span>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">Line Height</label>
              <div class="slider-wrap">
                <input type="range" min="1" max="3" step="0.1" v-model.number="wm.lineHeight" />
                <span class="slider-val">{{ wm.lineHeight }}</span>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">Rotation</label>
              <div class="slider-wrap">
                <input type="range" min="-180" max="180" step="1" v-model.number="wm.rotation" />
                <span class="slider-val">{{ wm.rotation }}&deg;</span>
              </div>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Render</label>
              <select v-model="wm.style">
                <option value="fill">Fill</option>
                <option value="stroke">Stroke</option>
                <option value="all">Fill + Stroke</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">Color</label>
              <div class="color-wrap">
                <input type="color" v-model="wm.fillStyleHex" />
                <code class="color-hex">{{ wm.fillStyleHex }}</code>
              </div>
            </div>
          </div>
          <div class="field-row">
            <label class="field-label">Opacity</label>
            <div class="slider-wrap">
              <input type="range" min="0.05" max="1" step="0.05" v-model.number="wm.opacity" />
              <span class="slider-val">{{ wm.opacity }}</span>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Align</label>
              <select v-model="wm.align">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="field-row">
              <label class="field-label">Baseline</label>
              <select v-model="wm.baseline">
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
                <option value="alphabetic">Alphabetic</option>
              </select>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">X</label>
              <div class="slider-wrap">
                <input type="range" min="0" max="400" step="5" v-model.number="wm.x" />
                <span class="slider-val">{{ wm.x }}</span>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">Y</label>
              <div class="slider-wrap">
                <input type="range" min="0" max="300" step="5" v-model.number="wm.y" />
                <span class="slider-val">{{ wm.y }}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" @click="handleWatermark">Apply Watermark</button>
        </div>
      </details>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
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

function handleTrim() {
  const result = sigRef.value?.trim({ padding: 10 })
  if (result) {
    previewUrl.value = result.dataUrl
  }
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
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Left column: toolbar + canvas + preview */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.3rem;
}

.toolbar-group + .toolbar-group {
  padding-left: 0.5rem;
  border-left: 1px solid #e8e8e8;
}

.canvas-wrapper {
  height: 320px;
  position: relative;
  margin: 0.75rem;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.canvas-wrapper:hover {
  border-color: #bbb;
}

.sig-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.disabled-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(1px);
  color: #888;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Preview below canvas */
.preview-section {
  flex-shrink: 0;
  border-top: 1px solid #f0f0f0;
  padding: 0.5rem 0.75rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-body {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  background: repeating-conic-gradient(#e8e8e8 0% 25%, #f5f5f5 0% 50%) 50% / 16px 16px;
  border-radius: 4px;
}

.preview-body img {
  max-width: 100%;
  max-height: 160px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
}

/* Right sidebar */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid #f0f0f0;
  overflow-y: auto;
  max-height: 580px;
}

.panel-collapsible {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.panel-collapsible summary {
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.panel-collapsible summary::-webkit-details-marker {
  display: none;
}

.panel-summary .panel-title {
  margin-bottom: 0;
}

.panel-arrow {
  font-size: 0.6rem;
  color: #bbb;
  transition: transform 0.2s;
}

.panel-collapsible[open] .panel-arrow {
  transform: rotate(180deg);
}

.panel-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 0.5rem;
}

.panel-body {
  padding-top: 0.35rem;
}

/* Form fields */
.field-row {
  margin-bottom: 0.5rem;
}

.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.15rem;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 0.5rem;
  margin-bottom: 0.5rem;
}

.field-grid > .field-row {
  margin-bottom: 0;
}

.color-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.color-wrap input[type="color"] {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.color-hex {
  font-size: 0.68rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #999;
}

.slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.slider-wrap input[type="range"] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e8e8e8;
  border-radius: 2px;
  outline: none;
}

.slider-wrap input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1a73e8;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.slider-val {
  font-size: 0.68rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: #888;
  min-width: 2rem;
  text-align: right;
}

select {
  width: 100%;
  padding: 0.2rem 0.3rem;
  font-size: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #333;
  outline: none;
  cursor: pointer;
}

select:focus {
  border-color: #1a73e8;
}

textarea {
  width: 100%;
  font-size: 0.75rem;
  padding: 0.25rem 0.35rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

textarea:focus {
  border-color: #1a73e8;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.3rem 0.55rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  color: #333;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.15s;
}

.btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-primary {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.btn-primary:hover:not(:disabled) {
  background: #1765cc;
  border-color: #1765cc;
}

.btn-outline {
  border-color: #bbb;
  background: transparent;
  color: #555;
}

.btn-outline:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn.active {
  background: #fef3e0;
  border-color: '#f5a623';
  color: #e67e00;
}

.btn-block {
  width: 100%;
  justify-content: center;
  margin-top: 0.25rem;
}

.btn-close {
  padding: 0.1rem 0.35rem;
  font-size: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  background: #f5f5f5;
}
</style>
