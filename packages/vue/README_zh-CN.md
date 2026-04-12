[English](README.md) | 中文

# @tinyforged/signature-kit-vue

Vue 3 电子签名组件。

## 安装

```bash
npm install @tinyforged/signature-kit-vue
```

## 快速开始

### 组件方式

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

### Composable 方式

如需更多控制，可使用 `useSignatureKit` 组合式函数直接管理你自己的 `<canvas>` 元素：

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

组合式函数返回一个 `canvasRef` 绑定到你的 `<canvas>` 元素，响应式 `canUndo`/`canRedo` 状态，以及所有 SignatureKit 方法作为普通函数（无需 `ref.value`）。

## API

查看[完整文档](https://github.com/TinyForged/signature-kit#vue-3)获取属性、事件、ref 方法和组合式函数用法的说明。

## 许可证

MIT
