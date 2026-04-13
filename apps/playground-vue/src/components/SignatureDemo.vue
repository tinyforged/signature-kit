<template>
  <div class="flex bg-white rounded-xl shadow overflow-hidden">
    <!-- Hidden file input -->
    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />

    <!-- Left: Canvas + Preview -->
    <div class="flex-1 flex flex-col min-w-0">
      <div class="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0 flex-wrap">
        <div class="flex gap-1.5">
          <button class="btn btn-primary" @click="handleSave('image/png')">PNG</button>
          <button class="btn btn-primary" @click="handleSave('image/jpeg')">JPEG</button>
          <button class="btn btn-primary" @click="handleSaveSVG">SVG</button>
          <button class="btn btn-outline" @click="handleSaveBlob">Blob</button>
          <button class="btn btn-outline" @click="handleSaveFile">File</button>
          <button class="btn btn-outline" @click="handleTrim">&#9986; Trim</button>
        </div>
        <div class="flex gap-1.5 pl-2 border-l border-gray-200">
          <button class="btn" :disabled="!activeCanUndo" @click="handleUndo">&#8617; Undo</button>
          <button class="btn" :disabled="!activeCanRedo" @click="handleRedo">&#8618; Redo</button>
          <button class="btn" @click="handleClear">&#128465; Clear</button>
          <button class="btn btn-danger" @click="handleReset">&#128260; Reset</button>
        </div>
        <div class="flex gap-1.5 pl-2 border-l border-gray-200">
          <button class="btn btn-outline" @click="handleLoadFile">&#128194; Load</button>
          <button class="btn" :class="isDisabled ? 'bg-amber-50 border-amber-500 text-amber-600' : ''" @click="isDisabled = !isDisabled">
            {{ isDisabled ? '&#9999; Edit' : '&#128274; Lock' }}
          </button>
        </div>
        <div class="flex items-center gap-1 ml-auto bg-gray-200 p-0.5 rounded-md border border-gray-300">
          <button
            class="px-2 py-0.5 text-xs font-semibold border border-gray-300 rounded bg-white text-gray-600 cursor-pointer"
            :class="apiMode === 'component' ? 'bg-blue-600 text-white border-blue-600' : ''"
            @click="apiMode = 'component'"
          >Component</button>
          <button
            class="px-2 py-0.5 text-xs font-semibold border border-gray-300 rounded bg-white text-gray-600 cursor-pointer"
            :class="apiMode === 'composable' ? 'bg-blue-600 text-white border-blue-600' : ''"
            @click="apiMode = 'composable'"
          >useSignatureKit</button>
        </div>
      </div>
      <div class="h-80 relative mx-3 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
        <SignatureCanvas
          v-if="apiMode === 'component'"
          ref="sigRef"
          :pen-color="penColor"
          :background-color="backgroundColor"
          :min-width="minWidth"
          :max-width="maxWidth"
          :dot-size="dotSize"
          :min-distance="minDistance"
          :velocity-filter-weight="velocityFilterWeight"
          :throttle="throttle"
          :clear-on-resize="clearOnResize"
          :scale-on-resize="scaleOnResize"
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
        <canvas
          v-show="apiMode === 'composable'"
          ref="hookCanvasRef"
          class="sig-canvas w-full h-full block"
        />
        <div v-if="isDisabled" class="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-sm text-gray-500 text-sm font-medium">
          <span>Read-only mode</span>
        </div>
      </div>
      <div v-if="previewUrl" class="shrink-0 border-t border-gray-200 px-3 py-2">
        <div class="flex items-center justify-between py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Preview</span>
          <button class="px-1.5 py-0.5 text-sm border border-gray-300 rounded bg-white text-gray-400 cursor-pointer leading-none" @click="previewUrl = ''">&#10005;</button>
        </div>
        <div class="p-2 flex justify-center bg-[repeating-conic-gradient(gray-200_0%_25%,gray-100_0%_50%)] bg-size-[16px_16px] bg-center rounded">
          <img :src="previewUrl" alt="Signature preview" class="max-w-full max-h-40 border border-gray-300 rounded bg-white" />
        </div>
      </div>
    </div>

    <!-- Right: Settings panel -->
    <aside class="w-70 shrink-0 border-l border-gray-200 overflow-y-auto max-h-155">
      <!-- Composable Info (only in hook mode) -->
      <details v-if="apiMode === 'composable'" open class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Composable Info</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <div class="text-[0.65rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 mt-1 leading-relaxed whitespace-pre-wrap">
            <code>useSignatureKit(options)</code>
            Returns: canvasRef, canUndo, canRedo, isEmpty, clear, reset,
            undo, redo, toDataURL, toBlob, toFile, toSVG, fromDataURL,
            fromFile, toData, fromData, addWatermark, clearWatermark, trim, getKit, getCanvas
          </div>
        </div>
      </details>

      <!-- Pen & Background -->
      <details open class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Pen &amp; Background</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Pen Color</label>
            <div class="flex items-center gap-1.5">
              <input type="color" v-model="penColor" class="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
              <code class="text-[0.68rem] font-mono text-gray-400">{{ penColor }}</code>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Background</label>
            <div class="flex items-center gap-1.5">
              <input type="color" v-model="backgroundColor" class="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
              <code class="text-[0.68rem] font-mono text-gray-400">{{ backgroundColor }}</code>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Min Width</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0.1" max="5" step="0.1" v-model.number="minWidth" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ minWidth }}</span>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Max Width</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0.5" max="10" step="0.5" v-model.number="maxWidth" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ maxWidth }}</span>
            </div>
          </div>
        </div>
      </details>

      <!-- Advanced Pen -->
      <details class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Advanced Pen</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Dot Size (single click)</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0" max="10" step="0.5" v-model.number="dotSize" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ dotSize }}</span>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Min Distance (px)</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="1" max="20" step="1" v-model.number="minDistance" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ minDistance }}</span>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Velocity Filter Weight</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0" max="1" step="0.05" v-model.number="velocityFilterWeight" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ velocityFilterWeight }}</span>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Throttle (ms)</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0" max="100" step="1" v-model.number="throttle" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ throttle }}</span>
            </div>
          </div>
        </div>
      </details>

      <!-- Resize Behavior -->
      <details class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Resize Behavior</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <div class="flex items-center gap-1.5 mb-2">
            <input type="checkbox" id="clearOnResize" v-model="clearOnResize" />
            <label for="clearOnResize" class="text-xs font-medium text-gray-600 cursor-pointer">Clear canvas on resize</label>
          </div>
          <div class="flex items-center gap-1.5 mb-2">
            <input type="checkbox" id="scaleOnResize" v-model="scaleOnResize" />
            <label for="scaleOnResize" class="text-xs font-medium text-gray-600 cursor-pointer">Scale strokes on resize</label>
          </div>
          <p class="text-[0.65rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">
            Try resizing your browser window to see the effect.
          </p>
        </div>
      </details>

      <!-- Watermark -->
      <details open class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Watermark</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Text</label>
            <textarea v-model="wm.text" rows="2" placeholder="Line 1&#10;Line 2" class="w-full text-xs px-1 py-0.5 border border-gray-300 rounded-md resize-y outline-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-x-2 mb-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Font</label>
              <select v-model="wm.fontFamily" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="cursive">Cursive</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Style</label>
              <select v-model="wm.fontStyle" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Weight</label>
              <select v-model="wm.fontWeight" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="100">100</option>
                <option value="300">300</option>
                <option value="900">900</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-2 mb-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Size</label>
              <div class="flex items-center gap-1.5">
                <input type="range" min="10" max="60" step="1" v-model.number="wm.fontSize" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.fontSize }}px</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Line Height</label>
              <div class="flex items-center gap-1.5">
                <input type="range" min="1" max="3" step="0.1" v-model.number="wm.lineHeight" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.lineHeight }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Rotation</label>
              <div class="flex items-center gap-1.5">
                <input type="range" min="-180" max="180" step="1" v-model.number="wm.rotation" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.rotation }}&deg;</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-2 mb-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Render</label>
              <select v-model="wm.style" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="fill">Fill</option>
                <option value="stroke">Stroke</option>
                <option value="all">Fill + Stroke</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Color</label>
              <div class="flex items-center gap-1.5">
                <input type="color" v-model="wm.fillStyleHex" class="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
                <code class="text-[0.68rem] font-mono text-gray-400">{{ wm.fillStyleHex }}</code>
              </div>
            </div>
          </div>
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-600 mb-0.5">Opacity</label>
            <div class="flex items-center gap-1.5">
              <input type="range" min="0.05" max="1" step="0.05" v-model.number="wm.opacity" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
              <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.opacity }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-2 mb-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Align</label>
              <select v-model="wm.align" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Baseline</label>
              <select v-model="wm.baseline" class="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer focus:border-blue-600">
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
                <option value="alphabetic">Alphabetic</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-x-2 mb-2">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">X</label>
              <div class="flex items-center gap-1.5">
                <input type="range" min="0" max="400" step="5" v-model.number="wm.x" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.x }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-0.5">Y</label>
              <div class="flex items-center gap-1.5">
                <input type="range" min="0" max="300" step="5" v-model.number="wm.y" class="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span class="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{{ wm.y }}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" @click="handleWatermark">Apply Watermark</button>
          <button class="btn btn-block" @click="handleClearWatermark">Clear Watermark</button>
        </div>
      </details>

      <!-- Data & Info -->
      <details class="px-3 py-2.5 border-b border-gray-200">
        <summary class="cursor-pointer list-none flex items-center justify-between select-none">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Data &amp; Info</h3>
          <span class="text-[0.6rem] text-gray-400 transition-transform duration-200">&#9662;</span>
        </summary>
        <div class="pt-1.5">
          <button class="btn btn-outline btn-block" @click="handleShowData">Show Stroke Data (toData)</button>
          <div v-if="dataInfo" class="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{{ dataInfo }}</div>
          <button class="btn btn-outline btn-block mt-2" @click="handleShowKitInfo">Show Kit Info (getKit/getCanvas)</button>
          <div v-if="kitInfo" class="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{{ kitInfo }}</div>
          <div v-if="saveCallbackUrl" class="mt-2">
            <div class="block text-xs font-medium text-gray-600">onSave callback received:</div>
            <div class="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{{ saveCallbackUrl }}</div>
          </div>
        </div>
      </details>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { SignatureCanvas } from '@tinyforged/signature-kit-vue'
import { useSignatureKit } from '@tinyforged/signature-kit-vue'

// API mode switching
const apiMode = ref<'component' | 'composable'>('component')

// Component ref
const sigRef = ref<InstanceType<typeof SignatureCanvas> | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Pen & Background
const penColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const minWidth = ref(0.5)
const maxWidth = ref(2.5)

// Advanced pen settings
const dotSize = ref(0)
const minDistance = ref(5)
const velocityFilterWeight = ref(0.7)
const throttle = ref(16)

// Resize settings
const clearOnResize = ref(false)
const scaleOnResize = ref(true)

// UI state
const isDisabled = ref(false)
const previewUrl = ref('')
const canUndoState = ref(false)
const canRedoState = ref(false)
const saveCallbackUrl = ref('')
const dataInfo = ref('')
const kitInfo = ref('')

// --- useSignatureKit composable ---
const {
  canvasRef: hookCanvasRef,
  canUndo: hookCanUndo,
  canRedo: hookCanRedo,
  clear: hookClear,
  reset: hookReset,
  undo: hookUndo,
  redo: hookRedo,
  toDataURL: hookToDataURL,
  toBlob: hookToBlob,
  toFile: hookToFile,
  toSVG: hookToSVG,
  fromFile: hookFromFile,
  toData: hookToData,
  addWatermark: hookAddWatermark,
  clearWatermark: hookClearWatermark,
  trim: hookTrim,
  getKit: hookGetKit,
  getCanvas: hookGetCanvas,
} = useSignatureKit({
  penColor,
  backgroundColor,
  minWidth,
  maxWidth,
  dotSize,
  minDistance,
  velocityFilterWeight,
  throttle,
  clearOnResize,
  scaleOnResize,
  disabled: isDisabled,
  onBegin: () => updateCanStates(),
  onEnd: () => updateCanStates(),
  onUndo: () => updateCanStates(),
  onRedo: () => updateCanStates(),
})

// Sync composable reactive state for display
const activeCanUndo = computed(() =>
  apiMode.value === 'composable' ? hookCanUndo.value : canUndoState.value,
)
const activeCanRedo = computed(() =>
  apiMode.value === 'composable' ? hookCanRedo.value : canRedoState.value,
)

// Watermark
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
  const url = apiMode.value === 'composable'
    ? hookToDataURL(type)
    : sigRef.value?.save(type)
  if (url) {
    previewUrl.value = url
    const a = document.createElement('a')
    a.href = url
    a.download = `signature.${type === 'image/png' ? 'png' : 'jpg'}`
    a.click()
  }
}

function handleSaveBlob() {
  const blob = apiMode.value === 'composable'
    ? hookToBlob('image/png')
    : sigRef.value?.toBlob('image/png')
  if (!blob) return
  blob.then((b) => {
    const url = URL.createObjectURL(b)
    previewUrl.value = url
    const a = document.createElement('a')
    a.href = url
    a.download = 'signature.png'
    a.click()
  })
}

function handleSaveFile() {
  const file = apiMode.value === 'composable'
    ? hookToFile('signature.png', 'image/png')
    : sigRef.value?.toFile('signature.png', 'image/png')
  if (!file) return
  file.then((f) => {
    const url = URL.createObjectURL(f)
    previewUrl.value = url
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    a.click()
  })
}

function handleSaveSVG() {
  const svg = apiMode.value === 'composable'
    ? hookToSVG()
    : sigRef.value?.toSVG()
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
  apiMode.value === 'composable' ? hookClear() : sigRef.value?.clear()
  previewUrl.value = ''
  updateCanStates()
}

function handleReset() {
  apiMode.value === 'composable' ? hookReset() : sigRef.value?.reset()
  previewUrl.value = ''
  updateCanStates()
}

function handleUndo() {
  apiMode.value === 'composable' ? hookUndo() : sigRef.value?.undo()
  updateCanStates()
}

function handleRedo() {
  apiMode.value === 'composable' ? hookRedo() : sigRef.value?.redo()
  updateCanStates()
}

function handleTrim() {
  const result = apiMode.value === 'composable'
    ? hookTrim({ padding: 10 })
    : sigRef.value?.trim({ padding: 10 })
  if (result) {
    previewUrl.value = result.dataUrl
  }
}

function handleWatermark() {
  const opts = {
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
  }
  apiMode.value === 'composable'
    ? hookAddWatermark(opts)
    : sigRef.value?.addWatermark(opts)
}

function handleClearWatermark() {
  apiMode.value === 'composable'
    ? hookClearWatermark()
    : sigRef.value?.clearWatermark()
}

function handleLoadFile() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const promise = apiMode.value === 'composable'
    ? hookFromFile(file)
    : sigRef.value?.fromFile(file)
  promise?.then(() => updateCanStates())
  input.value = ''
}

function handleShowData() {
  const data = apiMode.value === 'composable'
    ? hookToData()
    : sigRef.value?.toData()
  const strokes = data?.length ?? 0
  const points = data?.reduce((acc, g) => acc + g.points.length, 0) ?? 0
  dataInfo.value = `${strokes} stroke(s), ${points} point(s)`
}

function handleShowKitInfo() {
  const kit = apiMode.value === 'composable'
    ? hookGetKit()
    : sigRef.value?.getKit()
  const canvas = apiMode.value === 'composable'
    ? hookGetCanvas()
    : sigRef.value?.getCanvas()
  if (kit && canvas) {
    kitInfo.value = `canvas: ${canvas.width}x${canvas.height}, disabled: ${kit.disabled}, watermark: ${kit.watermark ? 'yes' : 'no'}`
  }
}

function onBegin() { updateCanStates() }
function onEnd() { updateCanStates() }
function onUndo() { updateCanStates() }
function onRedo() { updateCanStates() }
function onSave(url: string) {
  saveCallbackUrl.value = url.slice(0, 60) + '...'
}

function updateCanStates() {
  canUndoState.value = sigRef.value?.canUndo() ?? false
  canRedoState.value = sigRef.value?.canRedo() ?? false
}
</script>
