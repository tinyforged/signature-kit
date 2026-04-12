[English](README.md) | 中文

# @tinyforged/signature-kit-react

React 电子签名组件。

## 安装

```bash
npm install @tinyforged/signature-kit-react
```

## 快速开始

### 组件方式

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

### Hook 方式

如需更多控制，可使用 `useSignatureKit` Hook 直接管理你自己的 `<canvas>` 元素：

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

Hook 返回一个 `canvasRef` 绑定到你的 `<canvas>` 元素，响应式 `canUndo`/`canRedo` 状态，以及所有 SignatureKit 方法作为普通函数（无需 `ref.current`）。

## API

查看[完整文档](https://github.com/TinyForged/signature-kit#react)获取属性、事件、ref 方法和 Hook 用法的说明。

## 许可证

MIT
