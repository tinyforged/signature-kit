import { useRef, useState, useCallback } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import type { SignatureCanvasRef, WatermarkOptions } from '@tinyforged/signature-kit-react'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const css = {
  demo: { display: 'flex', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden' as const },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0 },
  toolbar: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderBottom: '1px solid #f0f0f0', background: '#fafbfc', flexShrink: 0, flexWrap: 'wrap' as const },
  toolbarGroup: { display: 'flex', gap: '0.3rem' },
  toolbarSep: { paddingLeft: '0.5rem', borderLeft: '1px solid #e8e8e8' },
  canvasWrapper: { height: 320, position: 'relative' as const, margin: '0.75rem', border: '2px dashed #e0e0e0', borderRadius: 8, overflow: 'hidden' },
  disabledOverlay: { position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(1px)', color: '#888', fontSize: '0.85rem', fontWeight: 500 },
  previewSection: { flexShrink: 0, borderTop: '1px solid #f0f0f0', padding: '0.5rem 0.75rem' },
  previewHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.78rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  previewBody: { padding: '0.5rem', display: 'flex', justifyContent: 'center', background: "repeating-conic-gradient(#e8e8e8 0% 25%, #f5f5f5 0% 50%) 50% / 16px 16px", borderRadius: 4 },
  previewImg: { maxWidth: '100%', maxHeight: 160, border: '1px solid #e0e0e0', borderRadius: 4, background: 'white' },
  sidebar: { width: 280, flexShrink: 0, borderLeft: '1px solid #f0f0f0', overflowY: 'auto' as const, maxHeight: 620 },
  panelCollapsible: { padding: '0.6rem 0.75rem', borderBottom: '1px solid #f0f0f0' },
  panelSummary: { cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' as const },
  panelArrow: { fontSize: '0.6rem', color: '#bbb', transition: 'transform 0.2s' },
  panelTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '0 0 0.5rem' },
  panelBody: { paddingTop: '0.35rem' },
  fieldRow: { marginBottom: '0.5rem' },
  fieldLabel: { display: 'block', fontSize: '0.72rem', fontWeight: 500, color: '#555', marginBottom: '0.15rem' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.5rem', marginBottom: '0.5rem' },
  colorWrap: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  colorInput: { width: 26, height: 26, padding: 0, border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', background: 'none' },
  colorHex: { fontSize: '0.68rem', fontFamily: "'SF Mono','Fira Code','Consolas',monospace", color: '#999' },
  sliderWrap: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
  rangeInput: { flex: 1, height: 4, WebkitAppearance: 'none' as any, appearance: 'none' as any, background: '#e8e8e8', borderRadius: 2, outline: 'none' },
  sliderVal: { fontSize: '0.68rem', fontFamily: "'SF Mono','Fira Code','Consolas',monospace", color: '#888', minWidth: '2rem', textAlign: 'right' as const },
  select: { width: '100%', padding: '0.2rem 0.3rem', fontSize: '0.75rem', border: '1px solid #e0e0e0', borderRadius: 6, background: 'white', color: '#333', outline: 'none', cursor: 'pointer' },
  textarea: { width: '100%', fontSize: '0.75rem', padding: '0.25rem 0.35rem', border: '1px solid #e0e0e0', borderRadius: 6, resize: 'vertical' as any, outline: 'none', fontFamily: 'inherit' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.55rem', border: '1px solid #e0e0e0', borderRadius: 6, background: 'white', color: '#333', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' as const, transition: 'all 0.15s' },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  btnActive: { background: '#fef3e0', borderColor: '#f5a623', color: '#e67e00' },
  btnDanger: { background: '#fff0f0', borderColor: '#e8a0a0', color: '#c53030' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.55rem', border: '1px solid #1a73e8', borderRadius: 6, background: '#1a73e8', color: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' as const, transition: 'all 0.15s' },
  btnOutline: { display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.55rem', border: '1px solid #bbb', borderRadius: 6, background: 'transparent', color: '#555', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, whiteSpace: 'nowrap' as const, transition: 'all 0.15s' },
  btnBlock: { width: '100%', justifyContent: 'center', marginTop: '0.25rem' },
  btnClose: { padding: '0.1rem 0.35rem', fontSize: '0.8rem', border: '1px solid #e0e0e0', borderRadius: 4, background: 'white', color: '#999', cursor: 'pointer', lineHeight: 1 },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' },
  checkboxLabel: { fontSize: '0.72rem', fontWeight: 500, color: '#555', cursor: 'pointer' },
  infoBox: { fontSize: '0.68rem', fontFamily: "'SF Mono','Fira Code','Consolas',monospace", color: '#666', background: '#f8f9fa', padding: '0.3rem 0.4rem', borderRadius: 4, border: '1px solid #eee', wordBreak: 'break-all' as const, marginTop: '0.25rem' },
  fileInput: { display: 'none' },
}

export default function SignatureDemo() {
  const sigRef = useRef<SignatureCanvasRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pen & Background
  const [penColor, setPenColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [minWidth, setMinWidth] = useState(0.5)
  const [maxWidth, setMaxWidth] = useState(2.5)

  // Advanced pen settings
  const [dotSize, setDotSize] = useState(0)
  const [minDistance, setMinDistance] = useState(5)
  const [velocityFilterWeight, setVelocityFilterWeight] = useState(0.7)
  const [throttle, setThrottle] = useState(16)

  // Resize settings
  const [clearOnResize, setClearOnResize] = useState(false)
  const [scaleOnResize, setScaleOnResize] = useState(true)

  // UI state
  const [isDisabled, setIsDisabled] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [canUndoState, setCanUndoState] = useState(false)
  const [canRedoState, setCanRedoState] = useState(false)
  const [saveCallbackUrl, setSaveCallbackUrl] = useState('')
  const [dataInfo, setDataInfo] = useState('')
  const [kitInfo, setKitInfo] = useState('')

  // Watermark
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

  const updateWm = useCallback((patch: Partial<typeof wm>) => {
    setWm((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateCanStates = useCallback(() => {
    setCanUndoState(sigRef.current?.canUndo() ?? false)
    setCanRedoState(sigRef.current?.canRedo() ?? false)
  }, [])

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

  function handleSaveBlob() {
    sigRef.current?.toBlob('image/png').then((blob) => {
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = 'signature.png'
      a.click()
    })
  }

  function handleSaveFile() {
    sigRef.current?.toFile('signature.png', 'image/png').then((file) => {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
    })
  }

  function handleSaveSVG() {
    const svg = sigRef.current?.toSVG()
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
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

  function handleReset() {
    sigRef.current?.reset()
    setPreviewUrl('')
    updateCanStates()
  }

  function handleClearWatermark() {
    sigRef.current?.clearWatermark()
  }

  function handleUndo() {
    sigRef.current?.undo()
    updateCanStates()
  }

  function handleRedo() {
    sigRef.current?.redo()
    updateCanStates()
  }

  function handleTrim() {
    const result = sigRef.current?.trim({ padding: 10 })
    if (result) setPreviewUrl(result.dataUrl)
  }

  function handleWatermark() {
    const opts: WatermarkOptions = {
      text: wm.text, fontSize: wm.fontSize, fontFamily: wm.fontFamily,
      fontStyle: wm.fontStyle, fontWeight: wm.fontWeight, style: wm.style,
      fillStyle: hexToRgba(wm.fillStyleHex, 1), strokeStyle: hexToRgba(wm.fillStyleHex, 1),
      opacity: wm.opacity, lineWidth: wm.lineWidth, x: wm.x, y: wm.y,
      rotation: wm.rotation, lineHeight: wm.lineHeight, align: wm.align, baseline: wm.baseline,
    }
    sigRef.current?.addWatermark(opts)
  }

  function handleLoadFile() {
    fileInputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    sigRef.current?.fromFile(file).then(() => updateCanStates())
    e.target.value = ''
  }

  function handleShowData() {
    const data = sigRef.current?.toData()
    setDataInfo(`${data?.length ?? 0} stroke(s), ${data?.reduce((acc, g) => acc + g.points.length, 0) ?? 0} point(s)`)
  }

  function handleShowKitInfo() {
    const kit = sigRef.current?.getKit()
    const canvas = sigRef.current?.getCanvas()
    if (kit && canvas) {
      setKitInfo(`canvas: ${canvas.width}x${canvas.height}, disabled: ${kit.disabled}, watermark: ${kit.watermark ? 'yes' : 'no'}`)
    }
  }

  return (
    <div style={css.demo}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={css.fileInput} onChange={onFileChange} />

      {/* Left: Canvas + Preview */}
      <div style={css.mainArea}>
        <div style={css.toolbar}>
          <div style={css.toolbarGroup}>
            <button style={css.btnPrimary} onClick={() => handleSave('image/png')}>PNG</button>
            <button style={css.btnPrimary} onClick={() => handleSave('image/jpeg')}>JPEG</button>
            <button style={css.btnPrimary} onClick={handleSaveSVG}>SVG</button>
            <button style={css.btnOutline} onClick={handleSaveBlob}>Blob</button>
            <button style={css.btnOutline} onClick={handleSaveFile}>File</button>
            <button style={css.btnOutline} onClick={handleTrim}>&#9986; Trim</button>
          </div>
          <div style={{ ...css.toolbarGroup, ...css.toolbarSep }}>
            <button style={{ ...css.btn, ...(canUndoState ? {} : css.btnDisabled) }} disabled={!canUndoState} onClick={handleUndo}>&#8617; Undo</button>
            <button style={{ ...css.btn, ...(canRedoState ? {} : css.btnDisabled) }} disabled={!canRedoState} onClick={handleRedo}>&#8618; Redo</button>
            <button style={css.btn} onClick={handleClear}>&#128465; Clear</button>
            <button style={{ ...css.btn, ...css.btnDanger }} onClick={handleReset}>&#128260; Reset</button>
          </div>
          <div style={{ ...css.toolbarGroup, ...css.toolbarSep }}>
            <button style={css.btnOutline} onClick={handleLoadFile}>&#128194; Load</button>
            <button style={{ ...css.btn, ...(isDisabled ? css.btnActive : {}) }} onClick={() => setIsDisabled(!isDisabled)}>
              {isDisabled ? '\u270F Edit' : '\uD83D\uDD12 Lock'}
            </button>
          </div>
        </div>
        <div style={css.canvasWrapper}>
          <SignatureCanvas
            ref={sigRef}
            penColor={penColor}
            backgroundColor={backgroundColor}
            minWidth={minWidth}
            maxWidth={maxWidth}
            dotSize={dotSize}
            minDistance={minDistance}
            velocityFilterWeight={velocityFilterWeight}
            throttle={throttle}
            clearOnResize={clearOnResize}
            scaleOnResize={scaleOnResize}
            disabled={isDisabled}
            onBegin={() => updateCanStates()}
            onEnd={() => updateCanStates()}
            onUndo={() => updateCanStates()}
            onRedo={() => updateCanStates()}
            onSave={(url) => setSaveCallbackUrl(url.slice(0, 60) + '...')}
          />
          {isDisabled && <div style={css.disabledOverlay}><span>Read-only mode</span></div>}
        </div>
        {previewUrl && (
          <div style={css.previewSection}>
            <div style={css.previewHeader}>
              <span>Preview</span>
              <button style={css.btnClose} onClick={() => setPreviewUrl('')}>&#10005;</button>
            </div>
            <div style={css.previewBody}>
              <img src={previewUrl} alt="Signature preview" style={css.previewImg} />
            </div>
          </div>
        )}
      </div>

      {/* Right: Settings panel */}
      <aside style={css.sidebar}>
        {/* Pen & Background */}
        <details open style={css.panelCollapsible}>
          <summary style={css.panelSummary}>
            <h3 style={css.panelTitle}>Pen &amp; Background</h3>
            <span style={css.panelArrow}>{'\u25BE'}</span>
          </summary>
          <div style={css.panelBody}>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Pen Color</label>
              <div style={css.colorWrap}>
                <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} style={css.colorInput} />
                <code style={css.colorHex}>{penColor}</code>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Background</label>
              <div style={css.colorWrap}>
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} style={css.colorInput} />
                <code style={css.colorHex}>{backgroundColor}</code>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Min Width</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0.1" max="5" step="0.1" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{minWidth}</span>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Max Width</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0.5" max="10" step="0.5" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{maxWidth}</span>
              </div>
            </div>
          </div>
        </details>

        {/* Advanced Pen */}
        <details style={css.panelCollapsible}>
          <summary style={css.panelSummary}>
            <h3 style={css.panelTitle}>Advanced Pen</h3>
            <span style={css.panelArrow}>{'\u25BE'}</span>
          </summary>
          <div style={css.panelBody}>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Dot Size (single click)</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0" max="10" step="0.5" value={dotSize} onChange={(e) => setDotSize(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{dotSize}</span>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Min Distance (px)</label>
              <div style={css.sliderWrap}>
                <input type="range" min="1" max="20" step="1" value={minDistance} onChange={(e) => setMinDistance(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{minDistance}</span>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Velocity Filter Weight</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0" max="1" step="0.05" value={velocityFilterWeight} onChange={(e) => setVelocityFilterWeight(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{velocityFilterWeight}</span>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Throttle (ms)</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0" max="100" step="1" value={throttle} onChange={(e) => setThrottle(Number(e.target.value))} style={css.rangeInput} />
                <span style={css.sliderVal}>{throttle}</span>
              </div>
            </div>
          </div>
        </details>

        {/* Resize Behavior */}
        <details style={css.panelCollapsible}>
          <summary style={css.panelSummary}>
            <h3 style={css.panelTitle}>Resize Behavior</h3>
            <span style={css.panelArrow}>{'\u25BE'}</span>
          </summary>
          <div style={css.panelBody}>
            <div style={css.checkboxRow}>
              <input type="checkbox" id="clearOnResize" checked={clearOnResize} onChange={(e) => setClearOnResize(e.target.checked)} />
              <label htmlFor="clearOnResize" style={css.checkboxLabel}>Clear canvas on resize</label>
            </div>
            <div style={css.checkboxRow}>
              <input type="checkbox" id="scaleOnResize" checked={scaleOnResize} onChange={(e) => setScaleOnResize(e.target.checked)} />
              <label htmlFor="scaleOnResize" style={css.checkboxLabel}>Scale strokes on resize</label>
            </div>
            <p style={{ ...css.infoBox, fontSize: '0.65rem' }}>
              Try resizing your browser window to see the effect.
            </p>
          </div>
        </details>

        {/* Watermark */}
        <details open style={css.panelCollapsible}>
          <summary style={css.panelSummary}>
            <h3 style={css.panelTitle}>Watermark</h3>
            <span style={css.panelArrow}>{'\u25BE'}</span>
          </summary>
          <div style={css.panelBody}>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Text</label>
              <textarea value={wm.text} onChange={(e) => updateWm({ text: e.target.value })} rows={2} placeholder={"Line 1\nLine 2"} style={css.textarea} />
            </div>
            <div style={css.fieldGrid}>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Font</label>
                <select value={wm.fontFamily} onChange={(e) => updateWm({ fontFamily: e.target.value })} style={css.select}>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Style</label>
                <select value={wm.fontStyle} onChange={(e) => updateWm({ fontStyle: e.target.value as any })} style={css.select}>
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Weight</label>
                <select value={String(wm.fontWeight)} onChange={(e) => updateWm({ fontWeight: e.target.value })} style={css.select}>
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Lighter</option>
                  <option value="100">100</option>
                  <option value="300">300</option>
                  <option value="900">900</option>
                </select>
              </div>
            </div>
            <div style={css.fieldGrid}>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Size</label>
                <div style={css.sliderWrap}>
                  <input type="range" min="10" max="60" step="1" value={wm.fontSize} onChange={(e) => updateWm({ fontSize: Number(e.target.value) })} style={css.rangeInput} />
                  <span style={css.sliderVal}>{wm.fontSize}px</span>
                </div>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Line Height</label>
                <div style={css.sliderWrap}>
                  <input type="range" min="1" max="3" step="0.1" value={wm.lineHeight} onChange={(e) => updateWm({ lineHeight: Number(e.target.value) })} style={css.rangeInput} />
                  <span style={css.sliderVal}>{wm.lineHeight}</span>
                </div>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Rotation</label>
                <div style={css.sliderWrap}>
                  <input type="range" min="-180" max="180" step="1" value={wm.rotation} onChange={(e) => updateWm({ rotation: Number(e.target.value) })} style={css.rangeInput} />
                  <span style={css.sliderVal}>{wm.rotation}&deg;</span>
                </div>
              </div>
            </div>
            <div style={css.fieldGrid}>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Render</label>
                <select value={wm.style} onChange={(e) => updateWm({ style: e.target.value as any })} style={css.select}>
                  <option value="fill">Fill</option>
                  <option value="stroke">Stroke</option>
                  <option value="all">Fill + Stroke</option>
                </select>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Color</label>
                <div style={css.colorWrap}>
                  <input type="color" value={wm.fillStyleHex} onChange={(e) => updateWm({ fillStyleHex: e.target.value })} style={css.colorInput} />
                  <code style={css.colorHex}>{wm.fillStyleHex}</code>
                </div>
              </div>
            </div>
            <div style={css.fieldRow}>
              <label style={css.fieldLabel}>Opacity</label>
              <div style={css.sliderWrap}>
                <input type="range" min="0.05" max="1" step="0.05" value={wm.opacity} onChange={(e) => updateWm({ opacity: Number(e.target.value) })} style={css.rangeInput} />
                <span style={css.sliderVal}>{wm.opacity}</span>
              </div>
            </div>
            <div style={css.fieldGrid}>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Align</label>
                <select value={wm.align} onChange={(e) => updateWm({ align: e.target.value as any })} style={css.select}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Baseline</label>
                <select value={wm.baseline} onChange={(e) => updateWm({ baseline: e.target.value as any })} style={css.select}>
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                  <option value="alphabetic">Alphabetic</option>
                </select>
              </div>
            </div>
            <div style={css.fieldGrid}>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>X</label>
                <div style={css.sliderWrap}>
                  <input type="range" min="0" max="400" step="5" value={wm.x} onChange={(e) => updateWm({ x: Number(e.target.value) })} style={css.rangeInput} />
                  <span style={css.sliderVal}>{wm.x}</span>
                </div>
              </div>
              <div style={css.fieldRow}>
                <label style={css.fieldLabel}>Y</label>
                <div style={css.sliderWrap}>
                  <input type="range" min="0" max="300" step="5" value={wm.y} onChange={(e) => updateWm({ y: Number(e.target.value) })} style={css.rangeInput} />
                  <span style={css.sliderVal}>{wm.y}</span>
                </div>
              </div>
            </div>
            <button style={{ ...css.btnPrimary, ...css.btnBlock }} onClick={handleWatermark}>Apply Watermark</button>
            <button style={{ ...css.btn, ...css.btnBlock }} onClick={handleClearWatermark}>Clear Watermark</button>
          </div>
        </details>

        {/* Data & Info */}
        <details style={css.panelCollapsible}>
          <summary style={css.panelSummary}>
            <h3 style={css.panelTitle}>Data &amp; Info</h3>
            <span style={css.panelArrow}>{'\u25BE'}</span>
          </summary>
          <div style={css.panelBody}>
            <button style={{ ...css.btnOutline, ...css.btnBlock }} onClick={handleShowData}>Show Stroke Data (toData)</button>
            {dataInfo && <div style={css.infoBox}>{dataInfo}</div>}
            <button style={{ ...css.btnOutline, ...css.btnBlock, marginTop: '0.5rem' }} onClick={handleShowKitInfo}>Show Kit Info (getKit/getCanvas)</button>
            {kitInfo && <div style={css.infoBox}>{kitInfo}</div>}
            {saveCallbackUrl && (
              <>
                <div style={{ ...css.fieldLabel, marginTop: '0.5rem' }}>onSave callback received:</div>
                <div style={css.infoBox}>{saveCallbackUrl}</div>
              </>
            )}
          </div>
        </details>
      </aside>
    </div>
  )
}
