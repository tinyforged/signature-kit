[English](README.md) | 中文

# @tinyforged/signature-kit

一套与框架无关的电子签名库，支持 Vue 3 和 React。基于 [signature_pad](https://github.com/szimek/signature_pad) 构建。

## 特性

- 支持压感笔触宽度的流畅签名绘制
- 撤销/重做，支持 50 步历史记录栈
- 丰富的文本水印（多行、字体、旋转、透明度、对齐方式等）
- 导出为 PNG / JPEG / SVG / Blob / File
- 从 Data URL / File / Blob 导入
- 裁剪空白（自动裁剪至签名边界）
- 只读（禁用）模式
- 响应式调整大小，可选笔触缩放
- 感知 DPI 的画布渲染

## 包

| 包 | 描述 |
|---|---|
| [`@tinyforged/signature-kit`](#core) | 核心库，与框架无关 |
| [`@tinyforged/signature-kit-vue`](#vue-3) | Vue 3 组件 |
| [`@tinyforged/signature-kit-react`](#react) | React 组件 |

## 安装

```bash
# Core (framework-agnostic)
npm install @tinyforged/signature-kit

# Vue 3
npm install @tinyforged/signature-kit-vue

# React
npm install @tinyforged/signature-kit-react
```

> `signature_pad` 已作为依赖包含在内 -- 无需单独安装。

---

## Core

与框架无关的 `SignatureKit` 类，封装了 `<canvas>` 元素。

### 用法

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

### 构造函数选项

| 选项 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `penColor` | `string` | `'black'` | 笔触颜色 |
| `backgroundColor` | `string` | `'rgba(0,0,0,0)'` | 画布背景颜色 |
| `minWidth` | `number` | `0.5` | 最小笔触宽度 |
| `maxWidth` | `number` | `2.5` | 最大笔触宽度 |
| `minDistance` | `number` | `5` | 记录点之间的最小距离 |
| `dotSize` | `number` | `0` | 单个点的尺寸（点击不拖动时） |
| `velocityFilterWeight` | `number` | `0.7` | 基于速度的笔触宽度权重 |
| `throttle` | `number` | `16` | 绘制事件的节流间隔（毫秒） |
| `clearOnResize` | `boolean` | `false` | 容器调整大小时清空画布 |
| `scaleOnResize` | `boolean` | `true` | 调整大小时按比例缩放笔触 |
| `disabled` | `boolean` | `false` | 禁用绘制 |
| `onResize` | `(size) => void` | - | 画布调整大小时的回调函数 |

### API

#### 方法

| 方法 | 返回值 | 描述 |
|---|---|---|
| `clear()` | `void` | 清除笔触，保留水印和撤销/重做栈 |
| `reset()` | `void` | 清除一切：笔触、水印、撤销/重做栈 |
| `isEmpty()` | `boolean` | 画布是否为空 |
| `undo()` | `void` | 撤销最后一笔 |
| `redo()` | `void` | 重做最后一次撤销的笔触 |
| `toDataURL(type?, quality?)` | `string` | 导出为 base64 Data URL |
| `toBlob(type?, quality?)` | `Promise<Blob>` | 导出为 Blob |
| `toFile(filename?, type?, quality?)` | `Promise<File>` | 导出为 File 对象 |
| `toSVG(options?)` | `string` | 导出为 SVG 字符串 |
| `fromDataURL(url, options?)` | `Promise<void>` | 从 Data URL 加载 |
| `fromFile(file, options?)` | `Promise<void>` | 从 File 或 Blob 加载 |
| `fromData(data)` | `void` | 从 PointGroup 数组加载 |
| `toData()` | `PointGroup[]` | 获取笔触数据为 PointGroup 数组 |
| `addWatermark(options)` | `void` | 在画布上绘制文本水印 |
| `clearWatermark()` | `void` | 移除水印，保留笔触 |
| `trim(options?)` | `TrimResult \| null` | 自动裁剪至签名边界 |
| `updateOptions(options)` | `void` | 动态更新选项 |
| `on(event, handler)` | `void` | 订阅事件 |
| `off(event, handler)` | `void` | 取消订阅事件 |
| `offAll()` | `void` | 移除所有事件监听器 |
| `destroy()` | `void` | 清理观察器和监听器 |

#### 属性

| 属性 | 类型 | 描述 |
|---|---|---|
| `canUndo` | `boolean` | 是否可以撤销 |
| `canRedo` | `boolean` | 是否可以重做 |
| `disabled` | `boolean` | 获取/设置禁用状态 |
| `watermark` | `WatermarkOptions \| null` | 当前水印选项 |
| `signaturePad` | `SignaturePad` | 底层 SignaturePad 实例 |
| `canvas` | `HTMLCanvasElement` | 画布元素 |

#### 事件

| 事件 | 详情 | 描述 |
|---|---|---|
| `beginStroke` | `{ originalEvent }` | 笔触开始 |
| `endStroke` | `{ originalEvent }` | 笔触结束 |
| `beforeUpdateStroke` | `{}` | 笔触点添加之前 |
| `afterUpdateStroke` | `{}` | 笔触点添加之后 |
| `clear` | `{}` | 画布已清空（仅笔触，水印保留） |
| `reset` | `{}` | 全部重置（笔触、水印、撤销/重做栈） |
| `undo` | `{}` | 执行了撤销 |
| `redo` | `{}` | 执行了重做 |
| `resize` | `{}` | 画布已调整大小 |

### 水印选项

| 选项 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `text` | `string` | - | 水印文本（`\n` 表示多行） |
| `fontSize` | `number` | `20` | 字体大小（像素） |
| `fontFamily` | `string` | `'sans-serif'` | CSS 字体族 |
| `fontStyle` | `'normal' \| 'italic' \| 'oblique'` | `'normal'` | 字体样式 |
| `fontWeight` | `string \| number` | `'normal'` | 字体粗细 |
| `fontVariant` | `'normal' \| 'small-caps'` | `'normal'` | 字体变体 |
| `style` | `'fill' \| 'stroke' \| 'all'` | `'fill'` | 渲染模式 |
| `fillStyle` | `string` | `'rgba(0,0,0,0.15)'` | 填充颜色 |
| `strokeStyle` | `string` | `'rgba(0,0,0,0.15)'` | 描边颜色 |
| `opacity` | `number` | `1` | 全局透明度（0-1） |
| `lineWidth` | `number` | `1` | 描边线宽 |
| `x` | `number` | `20` | X 位置 |
| `y` | `number` | `20` | Y 位置 |
| `rotation` | `number` | `0` | 旋转角度（度） |
| `lineHeight` | `number` | `1.5` | 多行行高倍数 |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 文本对齐方式 |
| `baseline` | `'top' \| 'middle' \| 'bottom' \| 'alphabetic'` | `'top'` | 文本基线 |

### 裁剪选项

| 选项 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `padding` | `number` | `0` | 裁剪区域的内边距 |
| `format` | `string` | `'image/png'` | 输出图片格式 |
| `quality` | `number` | - | 编码质量（0-1） |
| `backgroundColor` | `string` | - | 覆盖背景颜色用于检测 |

---

## Vue 3

```bash
npm install @tinyforged/signature-kit-vue
```

### 用法

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

| Prop | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `penColor` | `string` | `'rgb(0, 0, 0)'` | 笔触颜色 |
| `backgroundColor` | `string` | `'rgb(255, 255, 255)'` | 画布背景颜色 |
| `minWidth` | `number` | - | 最小笔触宽度 |
| `maxWidth` | `number` | - | 最大笔触宽度 |
| `minDistance` | `number` | - | 记录点之间的最小距离 |
| `dotSize` | `number` | - | 单击时的点尺寸 |
| `velocityFilterWeight` | `number` | - | 速度过滤器权重 |
| `throttle` | `number` | - | 节流间隔（毫秒） |
| `width` | `string` | `'100%'` | 容器宽度 |
| `height` | `string` | `'100%'` | 容器高度 |
| `clearOnResize` | `boolean` | `false` | 调整大小时清空 |
| `scaleOnResize` | `boolean` | `true` | 调整大小时缩放笔触 |
| `disabled` | `boolean` | `false` | 禁用绘制 |
| `customClass` | `string` | - | 容器的自定义 CSS 类名 |
| `watermark` | `WatermarkOptions` | - | 初始水印选项 |
| `defaultUrl` | `string` | - | 挂载时从 URL 加载签名 |

### 事件

| 事件 | 载荷 | 描述 |
|---|---|---|
| `begin-stroke` | `MouseEvent \| TouchEvent` | 笔触开始 |
| `end-stroke` | `MouseEvent \| TouchEvent` | 笔触结束 |
| `save` | `string` | 由 `save()` 方法触发 |
| `clear` | - | 画布已清空 |
| `reset` | - | 全部重置 |
| `undo` | - | 执行了撤销 |
| `redo` | - | 执行了重做 |

### Ref 方法

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
sigRef.value?.toData(): PointGroup[]
sigRef.value?.fromData(data: PointGroup[]): void
sigRef.value?.getKit(): SignatureKit | null
sigRef.value?.getCanvas(): HTMLCanvasElement | null
```

---

## React

```bash
npm install @tinyforged/signature-kit-react
```

### 用法

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

| Prop | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `penColor` | `string` | `'black'` | 笔触颜色 |
| `backgroundColor` | `string` | `'rgba(0,0,0,0)'` | 画布背景颜色 |
| `minWidth` | `number` | - | 最小笔触宽度 |
| `maxWidth` | `number` | - | 最大笔触宽度 |
| `minDistance` | `number` | - | 记录点之间的最小距离 |
| `dotSize` | `number` | - | 单击时的点尺寸 |
| `velocityFilterWeight` | `number` | - | 速度过滤器权重 |
| `throttle` | `number` | - | 节流间隔（毫秒） |
| `clearOnResize` | `boolean` | `false` | 调整大小时清空 |
| `scaleOnResize` | `boolean` | `true` | 调整大小时缩放笔触 |
| `disabled` | `boolean` | `false` | 禁用绘制 |
| `canvasProps` | `CanvasHTMLAttributes` | - | 额外的画布属性 |
| `watermark` | `WatermarkOptions` | - | 初始水印选项 |
| `defaultUrl` | `string` | - | 挂载时从 URL 加载签名 |
| `onBegin` | `(event) => void` | - | 笔触开始 |
| `onEnd` | `(event) => void` | - | 笔触结束 |
| `onClear` | `() => void` | - | 画布已清空 |
| `onUndo` | `() => void` | - | 执行了撤销 |
| `onRedo` | `() => void` | - | 执行了重做 |
| `onSave` | `(dataUrl) => void` | - | 由 `save()` ref 方法触发 |

### Ref 方法

```ts
sigRef.current?.isEmpty(): boolean
sigRef.current?.clear(): void
sigRef.current?.reset(): void
sigRef.current?.save(type?: string): string
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

## 开发

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

## 许可证

MIT
