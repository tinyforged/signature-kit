import { useRef, useState } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import type { SignatureCanvasRef, WatermarkOptions } from '@tinyforged/signature-kit-react'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function SignatureDemo() {
  const sigRef = useRef<SignatureCanvasRef>(null)

  const [penColor, setPenColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [minWidth, setMinWidth] = useState(0.5)
  const [maxWidth, setMaxWidth] = useState(2.5)
  const [isDisabled, setIsDisabled] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [canUndoState, setCanUndoState] = useState(false)
  const [canRedoState, setCanRedoState] = useState(false)
  const [wmOpen, setWmOpen] = useState(false)

  const [wm, setWm] = useState({
    text: 'Signature Kit\nTinyForged',
    fontSize: 24,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic' as const,
    fontWeight: 'bold' as string | number,
    style: 'fill' as const,
    fillStyleHex: '#000000',
    opacity: 0.15,
    lineWidth: 1,
    x: 20,
    y: 20,
    rotation: -25,
    lineHeight: 1.6,
    align: 'left' as const,
    baseline: 'top' as const,
  })

  function updateWm(patch: Partial<typeof wm>) {
    setWm((prev) => ({ ...prev, ...patch }))
  }

  function updateCanStates() {
    setCanUndoState(sigRef.current?.canUndo() ?? false)
    setCanRedoState(sigRef.current?.canRedo() ?? false)
  }

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
    updateCanStates()
  }

  function handleUndo() {
    sigRef.current?.undo()
    updateCanStates()
  }

  function handleRedo() {
    sigRef.current?.redo()
    updateCanStates()
  }

  function handleWatermark() {
    const opts: WatermarkOptions = {
      text: wm.text,
      fontSize: wm.fontSize,
      fontFamily: wm.fontFamily,
      fontStyle: wm.fontStyle,
      fontWeight: wm.fontWeight,
      style: wm.style,
      fillStyle: hexToRgba(wm.fillStyleHex, 1),
      strokeStyle: hexToRgba(wm.fillStyleHex, 1),
      opacity: wm.opacity,
      lineWidth: wm.lineWidth,
      x: wm.x,
      y: wm.y,
      rotation: wm.rotation,
      lineHeight: wm.lineHeight,
      align: wm.align,
      baseline: wm.baseline,
    }
    sigRef.current?.addWatermark(opts)
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap' as const,
  }

  const btnStyle = (disabled = false): React.CSSProperties => ({
    padding: '0.4rem 0.8rem',
    border: '1px solid #ddd',
    borderRadius: 4,
    background: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.85rem',
    opacity: disabled ? 0.4 : 1,
  })

  return (
    <div style={{ background: 'white', borderRadius: 8, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Signature controls */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={rowStyle}>
          <label style={labelStyle}>
            Pen Color:
            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
          </label>
          <label style={labelStyle}>
            Background:
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </label>
        </div>
        <div style={rowStyle}>
          <label style={labelStyle}>
            Min Width: {minWidth}
            <input type="range" min="0.1" max="5" step="0.1" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} />
          </label>
          <label style={labelStyle}>
            Max Width: {maxWidth}
            <input type="range" min="0.5" max="10" step="0.5" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
          <button onClick={() => handleSave('image/png')}>Save PNG</button>
          <button onClick={() => handleSave('image/jpeg')}>Save JPEG</button>
          <button onClick={handleSaveSVG}>Save SVG</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={handleUndo} disabled={!canUndoState} style={btnStyle(!canUndoState)}>Undo</button>
          <button onClick={handleRedo} disabled={!canRedoState} style={btnStyle(!canRedoState)}>Redo</button>
          <button onClick={() => setIsDisabled(!isDisabled)}>
            {isDisabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>

      {/* Watermark controls */}
      <details open={wmOpen} onToggle={() => setWmOpen(!wmOpen)} style={{ marginBottom: '1rem', border: '1px solid #eee', borderRadius: 6, padding: '0.75rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Watermark Settings</summary>
        <div style={{ paddingTop: '0.5rem' }}>
          <div style={rowStyle}>
            <label style={{ ...labelStyle, alignItems: 'flex-start' }}>
              Text:
              <textarea
                value={wm.text}
                onChange={(e) => updateWm({ text: e.target.value })}
                rows={2}
                style={{ width: 200, fontSize: '0.85rem', padding: '0.25rem 0.4rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </label>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>
              Font Size: {wm.fontSize}
              <input type="range" min="10" max="60" step="1" value={wm.fontSize} onChange={(e) => updateWm({ fontSize: Number(e.target.value) })} />
            </label>
            <label style={labelStyle}>
              Line Height: {wm.lineHeight}
              <input type="range" min="1" max="3" step="0.1" value={wm.lineHeight} onChange={(e) => updateWm({ lineHeight: Number(e.target.value) })} />
            </label>
            <label style={labelStyle}>
              Rotation: {wm.rotation}°
              <input type="range" min="-180" max="180" step="1" value={wm.rotation} onChange={(e) => updateWm({ rotation: Number(e.target.value) })} />
            </label>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>
              Font:
              <select value={wm.fontFamily} onChange={(e) => updateWm({ fontFamily: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="cursive">Cursive</option>
              </select>
            </label>
            <label style={labelStyle}>
              Style:
              <select value={wm.fontStyle} onChange={(e) => updateWm({ fontStyle: e.target.value as any })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
                <option value="oblique">Oblique</option>
              </select>
            </label>
            <label style={labelStyle}>
              Weight:
              <select value={String(wm.fontWeight)} onChange={(e) => updateWm({ fontWeight: e.target.value })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="100">100</option>
                <option value="300">300</option>
                <option value="900">900</option>
              </select>
            </label>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>
              Render:
              <select value={wm.style} onChange={(e) => updateWm({ style: e.target.value as any })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="fill">Fill</option>
                <option value="stroke">Stroke</option>
                <option value="all">Fill + Stroke</option>
              </select>
            </label>
            <label style={labelStyle}>
              Color:
              <input type="color" value={wm.fillStyleHex} onChange={(e) => updateWm({ fillStyleHex: e.target.value })} />
            </label>
            <label style={labelStyle}>
              Opacity: {wm.opacity}
              <input type="range" min="0.05" max="1" step="0.05" value={wm.opacity} onChange={(e) => updateWm({ opacity: Number(e.target.value) })} />
            </label>
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>
              Align:
              <select value={wm.align} onChange={(e) => updateWm({ align: e.target.value as any })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label style={labelStyle}>
              Baseline:
              <select value={wm.baseline} onChange={(e) => updateWm({ baseline: e.target.value as any })} style={{ fontSize: '0.85rem', padding: '0.2rem', border: '1px solid #ddd', borderRadius: 4 }}>
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
                <option value="alphabetic">Alphabetic</option>
              </select>
            </label>
            <label style={labelStyle}>
              X: {wm.x}
              <input type="range" min="0" max="400" step="5" value={wm.x} onChange={(e) => updateWm({ x: Number(e.target.value) })} />
            </label>
            <label style={labelStyle}>
              Y: {wm.y}
              <input type="range" min="0" max="300" step="5" value={wm.y} onChange={(e) => updateWm({ y: Number(e.target.value) })} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleWatermark}>Apply Watermark</button>
          </div>
        </div>
      </details>

      <div style={{ border: '1px solid #ddd', borderRadius: 4, overflow: 'hidden', height: 300 }}>
        <SignatureCanvas
          ref={sigRef}
          penColor={penColor}
          backgroundColor={backgroundColor}
          minWidth={minWidth}
          maxWidth={maxWidth}
          disabled={isDisabled}
          onBegin={() => updateCanStates()}
          onEnd={() => updateCanStates()}
          onUndo={() => updateCanStates()}
          onRedo={() => updateCanStates()}
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
