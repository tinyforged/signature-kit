# @tinyforged/signature-kit-vue

Vue 3 electronic signature component.

## Installation

```bash
npm install @tinyforged/signature-kit-vue
```

## Quick Start

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

## API

See the [full documentation](https://github.com/TinyForged/signature-kit#vue-3) for props, events, and ref methods.

## License

MIT
