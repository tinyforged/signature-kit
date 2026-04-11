[English](README.md) | 中文

# @tinyforged/signature-kit-vue

Vue 3 电子签名组件。

## 安装

```bash
npm install @tinyforged/signature-kit-vue
```

## 快速开始

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

查看[完整文档](https://github.com/TinyForged/signature-kit#vue-3)获取属性、事件和 ref 方法的说明。

## 许可证

MIT
