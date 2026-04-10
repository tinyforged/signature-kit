# @tinyforged/signature-kit-react

React electronic signature component.

## Installation

```bash
npm install @tinyforged/signature-kit-react react react-dom signature_pad
```

## Quick Start

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
    </div>
  )
}
```

## API

See the [full documentation](https://github.com/TinyForged/signature-kit#react) for props, events, and ref methods.

## License

MIT
