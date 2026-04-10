import { useRef, useState } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import type { SignatureCanvasRef } from '@tinyforged/signature-kit-react'

export default function SignatureDemo() {
  const sigRef = useRef<SignatureCanvasRef>(null)

  const [penColor, setPenColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [minWidth, setMinWidth] = useState(0.5)
  const [maxWidth, setMaxWidth] = useState(2.5)
  const [isDisabled, setIsDisabled] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  function handleSave(type: string) {
    const url = sigRef.current?.toDataURL(type)
    if (url) {
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = `signature.${type === 'image/png' ? 'png' : 'jpg'}`
      a.click()
    }
  }

  function handleSaveSVG() {
    const svg = sigRef.current?.toSVG()
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      setPreviewUrl(URL.createObjectURL(blob))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'signature.svg'
      a.click()
    }
  }

  function handleClear() {
    sigRef.current?.clear()
    setPreviewUrl('')
  }

  function handleUndo() {
    sigRef.current?.undo()
  }

  function handleWatermark() {
    sigRef.current?.addWatermark({ text: 'Signature Kit', style: 'all' })
  }

  return (
    <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            Pen Color:
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            Background:
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            Min Width: {minWidth}
            <input type="range" min="0.1" max="5" step="0.1" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            Max Width: {maxWidth}
            <input type="range" min="0.5" max="10" step="0.5" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
          <button onClick={() => handleSave('image/png')}>Save PNG</button>
          <button onClick={() => handleSave('image/jpeg')}>Save JPEG</button>
          <button onClick={handleSaveSVG}>Save SVG</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleUndo}>Undo</button>
          <button onClick={handleWatermark}>Add Watermark</button>
          <button onClick={() => setIsDisabled(!isDisabled)}>
            {isDisabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden', height: 300 }}>
        <SignatureCanvas
          ref={sigRef}
          penColor={penColor}
          backgroundColor={backgroundColor}
          minWidth={minWidth}
          maxWidth={maxWidth}
          disabled={isDisabled}
          onBegin={() => console.log('Stroke began')}
          onEnd={() => console.log('Stroke ended')}
        />
      </div>

      {previewUrl && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Preview:</h3>
          <img src={previewUrl} alt="Signature preview" style={{ maxWidth: '100%', border: '1px solid #eee', borderRadius: 4 }} />
        </div>
      )}
    </div>
  )
}
