English | [中文](README_zh-CN.md)

# @tinyforged/signature-kit

Framework-agnostic electronic signature core with undo, watermark, and resize support. Powered by [signature_pad](https://github.com/szimek/signature_pad).

## Installation

```bash
npm install @tinyforged/signature-kit
```

## Quick Start

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
kit.on('endStroke', (detail) => console.log('signed'))
kit.on('resize', () => console.log('canvas resized'))

// Export
const dataUrl = kit.toDataURL('image/png')
const blob = await kit.toBlob('image/png')
const svg = kit.toSVG()

// Undo / Redo
kit.undo()
kit.redo()

// Watermark
kit.addWatermark({
  text: 'CONFIDENTIAL',
  fontSize: 20,
  opacity: 0.15,
  rotation: -25,
})
kit.clearWatermark()

// Trim whitespace
const result = kit.trim({ padding: 10 })

// clear() removes strokes but keeps watermark and undo/redo history
kit.clear()

// reset() removes everything: strokes, watermark, undo/redo stacks
kit.reset()

// Import
await kit.fromDataURL(dataUrl)
await kit.fromFile(file)

// Cleanup
kit.destroy()
```

## API

See the [full documentation](https://github.com/TinyForged/signature-kit#core) for complete API reference.

## License

MIT
