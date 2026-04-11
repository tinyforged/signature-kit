[English](README.md) | 中文

# @tinyforged/signature-kit

与框架无关的电子签名核心库，支持撤销、水印和画布缩放。基于 [signature_pad](https://github.com/szimek/signature_pad) 构建。

## 安装

```bash
npm install @tinyforged/signature-kit
```

## 快速开始

```ts
import { SignatureKit } from '@tinyforged/signature-kit'

const canvas = document.querySelector('#canvas')!
const kit = new SignatureKit(canvas, {
  penColor: '#000',
  backgroundColor: '#fff',
  minWidth: 0.5,
  maxWidth: 2.5,
})

// 事件
kit.on('endStroke', (detail) => console.log('signed'))
kit.on('resize', () => console.log('canvas resized'))

// 导出
const dataUrl = kit.toDataURL('image/png')
const blob = await kit.toBlob('image/png')
const svg = kit.toSVG()

// 撤销 / 重做
kit.undo()
kit.redo()

// 水印
kit.addWatermark({
  text: 'CONFIDENTIAL',
  fontSize: 20,
  opacity: 0.15,
  rotation: -25,
})
kit.clearWatermark()

// 裁剪空白区域
const result = kit.trim({ padding: 10 })

// 导入
await kit.fromDataURL(dataUrl)
await kit.fromFile(file)

// 清理
kit.destroy()
```

## API

查看[完整文档](https://github.com/TinyForged/signature-kit#core)获取完整的 API 参考。

## 许可证

MIT
