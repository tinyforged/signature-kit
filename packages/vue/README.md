English | [中文](README_zh-CN.md)

# @tinyforged/signature-kit-vue

Vue 3 electronic signature component.

## Installation

```bash
npm install @tinyforged/signature-kit-vue
```

## Quick Start

### Component

```vue
<template>
  <SignatureCanvas
    ref="sigRef"
    pen-color="#000"
    background-color="#fff"
    width="600px"
    height="300px"
    @end-stroke="onEnd"
  />
  <button @click="handleSave">Save</button>
  <button @click="sigRef?.undo()">Undo</button>
  <button @click="sigRef?.clear()">Clear</button>
  <button @click="sigRef?.reset()">Reset</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SignatureCanvas } from '@tinyforged/signature-kit-vue'

const sigRef = ref<InstanceType<typeof SignatureCanvas> | null>(null)

function handleSave() {
  const url = sigRef.value?.save('image/png')
}

function onEnd() {
  console.log('canUndo:', sigRef.value?.canUndo())
}
</script>
```

### Composable

For more control, use the `useSignatureKit` composable to manage your own `<canvas>` element directly:

```vue
<template>
  <canvas ref="canvasRef" />
  <button @click="undo" :disabled="!canUndo">Undo</button>
</template>

<script setup lang="ts">
import { useSignatureKit } from '@tinyforged/signature-kit-vue'

const { canvasRef, canUndo, canRedo, undo, redo, clear, reset, ... } = useSignatureKit({
  penColor: '#000',
  backgroundColor: '#fff',
})
</script>
```

The composable returns a `canvasRef` to bind to your `<canvas>` element, reactive `canUndo`/`canRedo` state, and all SignatureKit methods as plain functions (no `ref.value` needed).

## API

See the [full documentation](https://github.com/TinyForged/signature-kit#vue-3) for props, events, ref methods, and composable usage.

## License

MIT
