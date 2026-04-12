English | [中文](README_zh-CN.md)

# @tinyforged/signature-kit-react

React electronic signature component.

## Installation

```bash
npm install @tinyforged/signature-kit-react
```

## Quick Start

### Component

```tsx
import { useRef } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import type { SignatureCanvasRef } from '@tinyforged/signature-kit-react'

function App() {
  const sigRef = useRef<SignatureCanvasRef>(null)

  return (
    <div>
      <SignatureCanvas
        ref={sigRef}
        penColor="#000"
        backgroundColor="#fff"
        onEnd={() => console.log('signed')}
      />
      <button onClick={() => alert(sigRef.current?.toDataURL())}>Save</button>
      <button onClick={() => sigRef.current?.undo()}>Undo</button>
      <button onClick={() => sigRef.current?.clear()}>Clear</button>
      <button onClick={() => sigRef.current?.reset()}>Reset</button>
    </div>
  )
}
```

### Hook

For more control, use the `useSignatureKit` hook to manage your own `<canvas>` element directly:

```tsx
import { useSignatureKit } from '@tinyforged/signature-kit-react'

function App() {
  const { canvasRef, canUndo, canRedo, undo, redo, clear, reset, ... } = useSignatureKit({
    penColor: '#000',
    backgroundColor: '#fff',
  })

  return (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={clear}>Clear</button>
    </div>
  )
}
```

The hook returns a `canvasRef` to attach to your `<canvas>` element, reactive `canUndo`/`canRedo` state, and all SignatureKit methods as plain functions (no `ref.current` needed).

## API

See the [full documentation](https://github.com/TinyForged/signature-kit#react) for props, events, ref methods, and hook usage.

## License

MIT
