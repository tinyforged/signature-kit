[English](README.md) | 中文

# @tinyforged/signature-kit-react

React 电子签名组件。

## 安装

```bash
npm install @tinyforged/signature-kit-react
```

## 快速开始

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

## API

查看[完整文档](https://github.com/TinyForged/signature-kit#react)获取属性、事件和 ref 方法的说明。

## 许可证

MIT
