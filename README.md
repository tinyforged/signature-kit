English | [中文](README_zh-CN.md)

# @tinyforged/signature-kit

A set of framework-agnostic electronic signature libraries for Vue 3 and React. Powered by [signature_pad](https://github.com/szimek/signature_pad).

## Features

- Smooth signature drawing with pressure-sensitive stroke width
- Undo / Redo with 50-state history stack
- Rich text watermark (multi-line, font, rotation, opacity, alignment, etc.)
- Export as PNG / JPEG / SVG / Blob / File
- Import from Data URL / File / Blob
- Trim whitespace (auto-crop to signature bounds)
- Read-only (disabled) mode
- Responsive resize with optional stroke scaling
- DPI-aware canvas rendering

## Packages

| Package | Description |
|---|---|
| [`@tinyforged/signature-kit`](#core) | Core library, framework-agnostic |
| [`@tinyforged/signature-kit-vue`](#vue-3) | Vue 3 component |
| [`@tinyforged/signature-kit-react`](#react) | React component |

## Installation

```bash
# Core (framework-agnostic)
npm install @tinyforged/signature-kit

# Vue 3
npm install @tinyforged/signature-kit-vue

# React
npm install @tinyforged/signature-kit-react
```

> `signature_pad` is included as a dependency — no need to install it separately.

---

## Core

Framework-agnostic `SignatureKit` class wrapping a `<canvas>` element.

### Usage

```ts
import { SignatureKit } from '@tinyforged/signature-kit'

const canvas = document.querySelector('#canvas')!
const kit = new SignatureKit(canvas, {
  penColor: '#000',
  backgroundColor: '#fff',
  minWidth: 0.5,
  maxWidth: 2.5,
})

// Events
kit.on('beginStroke', (detail) => console.log('started', detail.originalEvent))
kit.on('endStroke', (detail) => console.log('ended', detail.originalEvent))
kit.on('resize', () => console.log('canvas resized'))

// Export
const dataUrl = kit.toDataURL('image/png')
const blob = await kit.toBlob('image/png')
const file = await kit.toFile('signature.png')
const svg = kit.toSVG()

// Import
await kit.fromDataURL(dataUrl)
await kit.fromFile(file)

// Undo / Redo
kit.undo()
kit.redo()
console.log(kit.canUndo, kit.canRedo)

// Watermark
kit.addWatermark({
  text: 'CONFIDENTIAL',
  fontSize: 20,
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 'bold',
  opacity: 0.15,
  rotation: -25,
  lineHeight: 1.5,
  align: 'center',
  baseline: 'middle',
  x: 100,
  y: 100,
})
kit.clearWatermark()

// Trim whitespace
const result = kit.trim({ padding: 10 })
// result.dataUrl, result.canvas, result.bounds

// Update options dynamically
kit.updateOptions({ penColor: 'red', maxWidth: 3 })

// clear() removes strokes but keeps watermark and undo/redo history
kit.clear()

// reset() removes everything: strokes, watermark, undo/redo stacks
kit.reset()

// Disable drawing
kit.disabled = true

// Cleanup
kit.destroy()
```

### Constructor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `penColor` | `string` | `'black'` | Stroke color |
| `backgroundColor` | `string` | `'rgba(0,0,0,0)'` | Canvas background color |
| `minWidth` | `number` | `0.5` | Minimum stroke width |
| `maxWidth` | `number` | `2.5` | Maximum stroke width |
| `minDistance` | `number` | `5` | Minimum distance between recorded points |
| `dotSize` | `number` | `0` | Size of a single dot (click without drag) |
| `velocityFilterWeight` | `number` | `0.7` | Weight for velocity-based stroke width |
| `throttle` | `number` | `16` | Throttle interval (ms) between draw events |
| `clearOnResize` | `boolean` | `false` | Clear canvas on container resize |
| `scaleOnResize` | `boolean` | `true` | Scale strokes proportionally on resize |
| `disabled` | `boolean` | `false` | Disable drawing |
| `onResize` | `(size) => void` | - | Callback when the canvas resizes |

### API

#### Methods

| Method | Returns | Description |
|---|---|---|
| `clear()` | `void` | Clear strokes, keep watermark and undo/redo stacks |
| `reset()` | `void` | Clear everything: strokes, watermark, undo/redo stacks |
| `isEmpty()` | `boolean` | Whether the canvas is empty |
| `undo()` | `void` | Undo the last stroke |
| `redo()` | `void` | Redo the last undone stroke |
| `toDataURL(type?, quality?)` | `string` | Export as base64 Data URL |
| `toBlob(type?, quality?)` | `Promise<Blob>` | Export as Blob |
| `toFile(filename?, type?, quality?)` | `Promise<File>` | Export as File object |
| `toSVG(options?)` | `string` | Export as SVG string |
| `fromDataURL(url, options?)` | `Promise<void>` | Load from Data URL |
| `fromFile(file, options?)` | `Promise<void>` | Load from File or Blob |
| `fromData(data)` | `void` | Load from PointGroup array |
| `toData()` | `PointGroup[]` | Get stroke data as PointGroup array |
| `addWatermark(options)` | `void` | Draw text watermark on canvas |
| `clearWatermark()` | `void` | Remove watermark, keep strokes |
| `trim(options?)` | `TrimResult \| null` | Auto-crop to signature bounds |
| `updateOptions(options)` | `void` | Update options dynamically |
| `on(event, handler)` | `void` | Subscribe to event |
| `off(event, handler)` | `void` | Unsubscribe from event |
| `offAll()` | `void` | Remove all event listeners |
| `destroy()` | `void` | Cleanup observer and listeners |

#### Properties

| Property | Type | Description |
|---|---|---|
| `canUndo` | `boolean` | Whether undo is available |
| `canRedo` | `boolean` | Whether redo is available |
| `disabled` | `boolean` | Get/set disabled state |
| `watermark` | `WatermarkOptions \| null` | Current watermark options |
| `signaturePad` | `SignaturePad` | Underlying SignaturePad instance |
| `canvas` | `HTMLCanvasElement` | The canvas element |

#### Events

| Event | Detail | Description |
|---|---|---|
| `beginStroke` | `{ originalEvent }` | Stroke started |
| `endStroke` | `{ originalEvent }` | Stroke ended |
| `beforeUpdateStroke` | `{}` | Before stroke point is added |
| `afterUpdateStroke` | `{}` | After stroke point is added |
| `clear` | `{}` | Canvas cleared (strokes only, watermark preserved) |
| `reset` | `{}` | Everything reset (strokes, watermark, undo/redo stacks) |
| `undo` | `{}` | Undo performed |
| `redo` | `{}` | Redo performed |
| `resize` | `{}` | Canvas resized |

### Watermark Options

| Option | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | - | Watermark text (`\n` for multi-line) |
| `fontSize` | `number` | `20` | Font size in px |
| `fontFamily` | `string` | `'sans-serif'` | CSS font family |
| `fontStyle` | `'normal' \| 'italic' \| 'oblique'` | `'normal'` | Font style |
| `fontWeight` | `string \| number` | `'normal'` | Font weight |
| `fontVariant` | `'normal' \| 'small-caps'` | `'normal'` | Font variant |
| `style` | `'fill' \| 'stroke' \| 'all'` | `'fill'` | Render mode |
| `fillStyle` | `string` | `'rgba(0,0,0,0.15)'` | Fill color |
| `strokeStyle` | `string` | `'rgba(0,0,0,0.15)'` | Stroke color |
| `opacity` | `number` | `1` | Global opacity (0-1) |
| `lineWidth` | `number` | `1` | Stroke line width |
| `x` | `number` | `20` | X position |
| `y` | `number` | `20` | Y position |
| `rotation` | `number` | `0` | Rotation in degrees |
| `lineHeight` | `number` | `1.5` | Multi-line line height multiplier |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `baseline` | `'top' \| 'middle' \| 'bottom' \| 'alphabetic'` | `'top'` | Text baseline |

### Trim Options

| Option | Type | Default | Description |
|---|---|---|---|
| `padding` | `number` | `0` | Padding around cropped area |
| `format` | `string` | `'image/png'` | Output image format |
| `quality` | `number` | - | Encoder quality (0-1) |
| `backgroundColor` | `string` | - | Override background color for detection |

---

## Vue 3

```bash
npm install @tinyforged/signature-kit-vue
```

### Usage

```vue
<template>
  <SignatureCanvas
    ref="sigRef"
    pen-color="#000"
    background-color="#fff"
    :min-width="0.5"
    :max-width="2.5"
    width="600px"
    height="300px"
    @begin-stroke="onBegin"
    @end-stroke="onEnd"
  />
  <button @click="handleSave">Save PNG</button>
  <button @click="handleUndo">Undo</button>
  <button @click="handleClear">Clear</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SignatureCanvas } from '@tinyforged/signature-kit-vue'

const sigRef = ref<InstanceType<typeof SignatureCanvas> | null>(null)

function handleSave() {
  const url = sigRef.value?.save('image/png')
  // download or upload url
}

function handleUndo() {
  sigRef.value?.undo()
}

function handleClear() {
  sigRef.value?.clear()
}

function onBegin(e: MouseEvent | TouchEvent) {}
function onEnd(e: MouseEvent | TouchEvent) {}
</script>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `penColor` | `string` | `'rgb(0, 0, 0)'` | Stroke color |
| `backgroundColor` | `string` | `'rgb(255, 255, 255)'` | Canvas background color |
| `minWidth` | `number` | - | Minimum stroke width |
| `maxWidth` | `number` | - | Maximum stroke width |
| `minDistance` | `number` | - | Minimum distance between points |
| `dotSize` | `number` | - | Dot size for single clicks |
| `velocityFilterWeight` | `number` | - | Velocity filter weight |
| `throttle` | `number` | - | Throttle interval (ms) |
| `width` | `string` | `'100%'` | Container width |
| `height` | `string` | `'100%'` | Container height |
| `clearOnResize` | `boolean` | `false` | Clear on resize |
| `scaleOnResize` | `boolean` | `true` | Scale strokes on resize |
| `disabled` | `boolean` | `false` | Disable drawing |
| `customClass` | `string` | - | Custom CSS class for container |
| `watermark` | `WatermarkOptions` | - | Initial watermark options |
| `defaultUrl` | `string` | - | Load signature from URL on mount |

### Events

| Event | Payload | Description |
|---|---|---|
| `begin-stroke` | `MouseEvent \| TouchEvent` | Stroke started |
| `end-stroke` | `MouseEvent \| TouchEvent` | Stroke ended |
| `save` | `string` | Triggered by `save()` method |
| `clear` | - | Canvas cleared |
| `reset` | - | Everything reset |
| `undo` | - | Undo performed |
| `redo` | - | Redo performed |

### Ref Methods

```ts
sigRef.value?.save(type?: string): string
sigRef.value?.clear(): void
sigRef.value?.reset(): void
sigRef.value?.isEmpty(): boolean
sigRef.value?.undo(): void
sigRef.value?.redo(): void
sigRef.value?.canUndo(): boolean
sigRef.value?.canRedo(): boolean
sigRef.value?.addWatermark(options: WatermarkOptions): void
sigRef.value?.clearWatermark(): void
sigRef.value?.fromDataURL(url: string): Promise<void>
sigRef.value?.fromFile(file: File | Blob): Promise<void>
sigRef.value?.toDataURL(type?, quality?): string
sigRef.value?.toBlob(type?, quality?): Promise<Blob>
sigRef.value?.toFile(filename?, type?, quality?): Promise<File>
sigRef.value?.toSVG(): string
sigRef.value?.trim(options?): TrimResult | null
sigRef.value?.getKit(): SignatureKit | null
```

---

## React

```bash
npm install @tinyforged/signature-kit-react
```

### Usage

```tsx
import { useRef } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import type { SignatureCanvasRef } from '@tinyforged/signature-kit-react'

function App() {
  const sigRef = useRef<SignatureCanvasRef>(null)

  function handleSave() {
    const url = sigRef.current?.toDataURL('image/png')
    // download or upload url
  }

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="#000"
        backgroundColor="#fff"
        minWidth={0.5}
        maxWidth={2.5}
        onBegin={(e) => console.log('started', e)}
        onEnd={(e) => console.log('ended', e)}
      />
      <button onClick={handleSave}>Save PNG</button>
      <button onClick={() => sigRef.current?.undo()}>Undo</button>
      <button onClick={() => sigRef.current?.clear()}>Clear</button>
    </div>
  )
}
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `penColor` | `string` | `'black'` | Stroke color |
| `backgroundColor` | `string` | `'rgba(0,0,0,0)'` | Canvas background color |
| `minWidth` | `number` | - | Minimum stroke width |
| `maxWidth` | `number` | - | Maximum stroke width |
| `minDistance` | `number` | - | Minimum distance between points |
| `dotSize` | `number` | - | Dot size for single clicks |
| `velocityFilterWeight` | `number` | - | Velocity filter weight |
| `throttle` | `number` | - | Throttle interval (ms) |
| `clearOnResize` | `boolean` | `false` | Clear on resize |
| `scaleOnResize` | `boolean` | `true` | Scale strokes on resize |
| `disabled` | `boolean` | `false` | Disable drawing |
| `canvasProps` | `CanvasHTMLAttributes` | - | Additional canvas attributes |
| `watermark` | `WatermarkOptions` | - | Initial watermark options |
| `defaultUrl` | `string` | - | Load signature from URL on mount |
| `onBegin` | `(event) => void` | - | Stroke started |
| `onEnd` | `(event) => void` | - | Stroke ended |
| `onClear` | `() => void` | - | Canvas cleared |
| `onUndo` | `() => void` | - | Undo performed |
| `onRedo` | `() => void` | - | Redo performed |
| `onRedo` | `() => void` | - | Redo performed |
| `onSave` | `(dataUrl) => void` | - | Triggered by `save()` ref method |

### Ref Methods

```ts
sigRef.current?.isEmpty(): boolean
sigRef.current?.clear(): void
sigRef.current?.reset(): void
sigRef.current?.undo(): void
sigRef.current?.redo(): void
sigRef.current?.canUndo(): boolean
sigRef.current?.canRedo(): boolean
sigRef.current?.toDataURL(type?, quality?): string
sigRef.current?.toBlob(type?, quality?): Promise<Blob>
sigRef.current?.toFile(filename?, type?, quality?): Promise<File>
sigRef.current?.toSVG(): string
sigRef.current?.fromDataURL(url: string): Promise<void>
sigRef.current?.fromFile(file: File | Blob): Promise<void>
sigRef.current?.toData(): PointGroup[]
sigRef.current?.fromData(data: PointGroup[]): void
sigRef.current?.addWatermark(options: WatermarkOptions): void
sigRef.current?.clearWatermark(): void
sigRef.current?.trim(options?): TrimResult | null
sigRef.current?.getKit(): SignatureKit | null
sigRef.current?.getCanvas(): HTMLCanvasElement | null
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type check
pnpm typecheck

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format

# Start playgrounds
pnpm dev:vue
pnpm dev:react
```

## License

MIT
