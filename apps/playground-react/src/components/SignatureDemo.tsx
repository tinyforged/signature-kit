import { useRef, useState, useCallback, useEffect } from 'react'
import { SignatureCanvas } from '@tinyforged/signature-kit-react'
import { useSignatureKit } from '@tinyforged/signature-kit-react'
import type { WatermarkOptions, SignatureCanvasRef } from '@tinyforged/signature-kit-react'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function SignatureDemo() {
  const sigRef = useRef<SignatureCanvasRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [apiMode, setApiMode] = useState<'component' | 'hook'>('component')

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

  // --- Shared handlers (used by both modes) ---
  function handleSave(type: string) {
    const url = apiMode === 'hook'
      ? hookToDataURL(type)
      : sigRef.current?.toDataURL(type)
    if (url) {
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = `signature.${type === 'image/png' ? 'png' : 'jpg'}`
      a.click()
    }
  }

  function handleSaveBlob() {
    const blob = apiMode === 'hook'
      ? hookToBlob()
      : sigRef.current?.toBlob('image/png')
    if (!blob) return
    blob.then((b) => {
      const url = URL.createObjectURL(b)
      setPreviewUrl(url)
      const a = document.createElement('a')
      a.href = url
      a.download = 'signature.png'
      a.click()
    })
  }

  function handleSaveSVG() {
    const svg = apiMode === 'hook'
      ? hookToSVG()
      : sigRef.current?.toSVG()
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
    apiMode === 'hook' ? hookClear() : sigRef.current?.clear()
    setPreviewUrl('')
    updateCanStates()
  }

  function handleReset() {
    apiMode === 'hook' ? hookReset() : sigRef.current?.reset()
    setPreviewUrl('')
    updateCanStates()
  }

  function handleClearWatermark() {
    apiMode === 'hook' ? hookClearWatermark() : sigRef.current?.clearWatermark()
  }

  function handleUndo() {
    apiMode === 'hook' ? hookUndo() : sigRef.current?.undo()
    updateCanStates()
  }

  function handleRedo() {
    apiMode === 'hook' ? hookRedo() : sigRef.current?.redo()
    updateCanStates()
  }

  function handleTrim() {
    const result = apiMode === 'hook'
      ? hookTrim({ padding: 10 })
      : sigRef.current?.trim({ padding: 10 })
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
    apiMode === 'hook' ? hookAddWatermark(opts) : sigRef.current?.addWatermark(opts)
  }

  function handleLoadFile() {
    fileInputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const promise = apiMode === 'hook' ? hookFromFile(file) : sigRef.current?.fromFile(file)
    promise?.then(() => updateCanStates())
    e.target.value = ''
  }

  function handleShowData() {
    const data = apiMode === 'hook' ? hookToData() : sigRef.current?.toData()
    setDataInfo(`${data?.length ?? 0} stroke(s), ${data?.reduce((acc, g) => acc + g.points.length, 0) ?? 0} point(s)`)
  }

  function handleShowKitInfo() {
    const kit = apiMode === 'hook' ? hookGetKit() : sigRef.current?.getKit()
    const canvas = apiMode === 'hook' ? hookGetCanvas() : sigRef.current?.getCanvas()
    if (kit && canvas) {
      setKitInfo(`canvas: ${canvas.width}x${canvas.height}, disabled: ${kit.disabled}, watermark: ${kit.watermark ? 'yes' : 'no'}`)
    }
  }

  // --- useSignatureKit hook ---
  const {
    canvasRef: hookCanvasRef,
    canUndo: hookCanUndo,
    canRedo: hookCanRedo,
    clear: hookClear,
    reset: hookReset,
    undo: hookUndo,
    redo: hookRedo,
    toDataURL: hookToDataURL,
    toBlob: hookToBlob,
    toSVG: hookToSVG,
    fromFile: hookFromFile,
    toData: hookToData,
    addWatermark: hookAddWatermark,
    clearWatermark: hookClearWatermark,
    trim: hookTrim,
    getKit: hookGetKit,
  } = useSignatureKit({
    penColor,
    backgroundColor,
    minWidth,
    maxWidth,
    dotSize,
    minDistance,
    velocityFilterWeight,
    throttle,
    clearOnResize,
    scaleOnResize,
    disabled: isDisabled,
    onBegin: () => updateCanStates(),
    onEnd: () => updateCanStates(),
    onUndo: () => updateCanStates(),
    onRedo: () => updateCanStates(),
  })

  const hookGetCanvas = useCallback(() => {
    return hookCanvasRef.current ?? null
  }, [hookCanvasRef])

  // Sync hook state for display
  useEffect(() => {
    if (apiMode !== 'hook') return
    setCanUndoState(hookCanUndo)
    setCanRedoState(hookCanRedo)
  }, [apiMode, hookCanUndo, hookCanRedo])

  const activeCanUndo = apiMode === 'hook' ? hookCanUndo : canUndoState
  const activeCanRedo = apiMode === 'hook' ? hookCanRedo : canRedoState

  return (
    <div className="flex bg-white rounded-xl shadow overflow-hidden">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Left: Canvas + Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0 flex-wrap">
          <div className="flex gap-1.5">
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={() => handleSave('image/png')}>PNG</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={() => handleSave('image/jpeg')}>JPEG</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleSaveSVG}>SVG</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-400 rounded-md bg-transparent text-gray-600 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleSaveBlob}>Blob</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-400 rounded-md bg-transparent text-gray-600 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleTrim}>&#9986; Trim</button>
          </div>
          <div className="flex gap-1.5 pl-2 border-l border-gray-200">
            <button className={`inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all ${activeCanUndo ? '' : 'opacity-35 cursor-not-allowed'}`} disabled={!activeCanUndo} onClick={handleUndo}>&#8617; Undo</button>
            <button className={`inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all ${activeCanRedo ? '' : 'opacity-35 cursor-not-allowed'}`} disabled={!activeCanRedo} onClick={handleRedo}>&#8618; Redo</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleClear}>&#128465; Clear</button>
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-red-200 rounded-md bg-red-50 text-red-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleReset}>&#128260; Reset</button>
          </div>
          <div className="flex gap-1.5 pl-2 border-l border-gray-200">
            <button className="inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-400 rounded-md bg-transparent text-gray-600 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleLoadFile}>&#128194; Load</button>
            <button className={`inline-flex items-center gap-0.5 px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all ${isDisabled ? 'bg-amber-50 border-amber-500 text-amber-600' : ''}`} onClick={() => setIsDisabled(!isDisabled)}>
              {isDisabled ? '\u270F Edit' : '\uD83D\uDD12 Lock'}
            </button>
          </div>
          <div className="flex items-center gap-1 ml-auto bg-gray-200 p-0.5 rounded-md border border-gray-300">
            <button className={`px-2 py-0.5 text-xs font-semibold border border-gray-300 rounded bg-white text-gray-600 cursor-pointer ${apiMode === 'component' ? 'bg-blue-600 text-white border-blue-600' : ''}`} onClick={() => setApiMode('component')}>Component</button>
            <button className={`px-2 py-0.5 text-xs font-semibold border border-gray-300 rounded bg-white text-gray-600 cursor-pointer ${apiMode === 'hook' ? 'bg-blue-600 text-white border-blue-600' : ''}`} onClick={() => setApiMode('hook')}>useSignatureKit</button>
          </div>
        </div>
        <div className="h-80 relative mx-3 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <div style={{ display: apiMode === 'component' ? 'block' : 'none' }}>
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
          </div>
          <div style={{ display: apiMode === 'hook' ? 'block' : 'none' }}>
            <canvas ref={hookCanvasRef} className="w-full h-full" />
          </div>
          {isDisabled && <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-sm text-gray-500 text-sm font-medium"><span>Read-only mode</span></div>}
        </div>
        {previewUrl && (
          <div className="shrink-0 border-t border-gray-200 px-3 py-2">
            <div className="flex items-center justify-between py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Preview</span>
              <button className="px-1.5 py-0.5 text-sm border border-gray-300 rounded bg-white text-gray-400 cursor-pointer leading-none" onClick={() => setPreviewUrl('')}>&#10005;</button>
            </div>
            <div className="p-2 flex justify-center bg-[repeating-conic-gradient(gray-200_0%_25%,gray-100_0%_50%)] bg-size-[16px_16px] bg-center rounded">
              <img src={previewUrl} alt="Signature preview" className="max-w-full max-h-40 border border-gray-300 rounded bg-white" />
            </div>
          </div>
        )}
      </div>

      {/* Right: Settings panel */}
      <aside className="w-70 shrink-0 border-l border-gray-200 overflow-y-auto max-h-155">
        {apiMode === 'hook' && (
          <details open className="px-3 py-2.5 border-b border-gray-200">
            <summary className="cursor-pointer list-none flex items-center justify-between select-none">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Hook Info</h3>
              <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
            </summary>
            <div className="pt-1.5">
              <div className="text-[0.65rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 mt-1 leading-relaxed whitespace-pre-wrap">
                <code>useSignatureKit(options)</code>{'\n'}
                Returns: canvasRef, canUndo, canRedo, isEmpty, clear, reset,
                undo, redo, toDataURL, toBlob, toFile, toSVG, fromDataURL,
                fromFile, toData, fromData, addWatermark, clearWatermark, trim, getKit
              </div>
            </div>
          </details>
        )}

        <details open className="px-3 py-2.5 border-b border-gray-200">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Pen &amp; Background</h3>
            <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
          </summary>
          <div className="pt-1.5">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Pen Color</label>
              <div className="flex items-center gap-1.5">
                <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
                <code className="text-[0.68rem] font-mono text-gray-400">{penColor}</code>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Background</label>
              <div className="flex items-center gap-1.5">
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
                <code className="text-[0.68rem] font-mono text-gray-400">{backgroundColor}</code>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Min Width</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0.1" max="5" step="0.1" value={minWidth} onChange={(e) => setMinWidth(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{minWidth}</span>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Max Width</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0.5" max="10" step="0.5" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{maxWidth}</span>
              </div>
            </div>
          </div>
        </details>

        <details className="px-3 py-2.5 border-b border-gray-200">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Advanced Pen</h3>
            <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
          </summary>
          <div className="pt-1.5">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Dot Size (single click)</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0" max="10" step="0.5" value={dotSize} onChange={(e) => setDotSize(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{dotSize}</span>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Min Distance (px)</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="1" max="20" step="1" value={minDistance} onChange={(e) => setMinDistance(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{minDistance}</span>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Velocity Filter Weight</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0" max="1" step="0.05" value={velocityFilterWeight} onChange={(e) => setVelocityFilterWeight(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{velocityFilterWeight}</span>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Throttle (ms)</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0" max="100" step="1" value={throttle} onChange={(e) => setThrottle(Number(e.target.value))} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{throttle}</span>
              </div>
            </div>
          </div>
        </details>

        <details className="px-3 py-2.5 border-b border-gray-200">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Resize Behavior</h3>
            <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
          </summary>
          <div className="pt-1.5">
            <div className="flex items-center gap-1.5 mb-2">
              <input type="checkbox" id="clearOnResize" checked={clearOnResize} onChange={(e) => setClearOnResize(e.target.checked)} />
              <label htmlFor="clearOnResize" className="text-xs font-medium text-gray-600 cursor-pointer">Clear canvas on resize</label>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              <input type="checkbox" id="scaleOnResize" checked={scaleOnResize} onChange={(e) => setScaleOnResize(e.target.checked)} />
              <label htmlFor="scaleOnResize" className="text-xs font-medium text-gray-600 cursor-pointer">Scale strokes on resize</label>
            </div>
            <p className="text-[0.65rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">
              Try resizing your browser window to see the effect.
            </p>
          </div>
        </details>

        <details open className="px-3 py-2.5 border-b border-gray-200">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Watermark</h3>
            <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
          </summary>
          <div className="pt-1.5">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Text</label>
              <textarea value={wm.text} onChange={(e) => updateWm({ text: e.target.value })} rows={2} placeholder={"Line 1\nLine 2"} className="w-full text-xs px-1 py-0.5 border border-gray-300 rounded-md resize-y outline-none font-[inherit]" />
            </div>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Font</label>
                <select value={wm.fontFamily} onChange={(e) => updateWm({ fontFamily: e.target.value })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Style</label>
                <select value={wm.fontStyle} onChange={(e) => updateWm({ fontStyle: e.target.value as any })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Weight</label>
                <select value={String(wm.fontWeight)} onChange={(e) => updateWm({ fontWeight: e.target.value })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Lighter</option>
                  <option value="100">100</option>
                  <option value="300">300</option>
                  <option value="900">900</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Size</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min="10" max="60" step="1" value={wm.fontSize} onChange={(e) => updateWm({ fontSize: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                  <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.fontSize}px</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Line Height</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min="1" max="3" step="0.1" value={wm.lineHeight} onChange={(e) => updateWm({ lineHeight: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                  <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.lineHeight}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Rotation</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min="-180" max="180" step="1" value={wm.rotation} onChange={(e) => updateWm({ rotation: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                  <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.rotation}&deg;</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Render</label>
                <select value={wm.style} onChange={(e) => updateWm({ style: e.target.value as any })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="fill">Fill</option>
                  <option value="stroke">Stroke</option>
                  <option value="all">Fill + Stroke</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Color</label>
                <div className="flex items-center gap-1.5">
                  <input type="color" value={wm.fillStyleHex} onChange={(e) => updateWm({ fillStyleHex: e.target.value })} className="w-6.5 h-6.5 p-0 border border-gray-300 rounded-md cursor-pointer bg-none" />
                  <code className="text-[0.68rem] font-mono text-gray-400">{wm.fillStyleHex}</code>
                </div>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Opacity</label>
              <div className="flex items-center gap-1.5">
                <input type="range" min="0.05" max="1" step="0.05" value={wm.opacity} onChange={(e) => updateWm({ opacity: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.opacity}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Align</label>
                <select value={wm.align} onChange={(e) => updateWm({ align: e.target.value as any })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Baseline</label>
                <select value={wm.baseline} onChange={(e) => updateWm({ baseline: e.target.value as any })} className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded-md bg-white text-gray-700 outline-none cursor-pointer">
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                  <option value="alphabetic">Alphabetic</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">X</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min="0" max="400" step="5" value={wm.x} onChange={(e) => updateWm({ x: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                  <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.x}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Y</label>
                <div className="flex items-center gap-1.5">
                  <input type="range" min="0" max="300" step="5" value={wm.y} onChange={(e) => updateWm({ y: Number(e.target.value) })} className="flex-1 h-1 bg-gray-200 rounded-sm outline-none" />
                  <span className="text-[0.68rem] font-mono text-gray-500 min-w-8 text-right">{wm.y}</span>
                </div>
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-0.5 w-full px-2.5 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white cursor-pointer text-xs font-medium whitespace-nowrap transition-all mt-1" onClick={handleWatermark}>Apply Watermark</button>
            <button className="inline-flex items-center justify-center gap-0.5 w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer text-xs font-medium whitespace-nowrap transition-all mt-1" onClick={handleClearWatermark}>Clear Watermark</button>
          </div>
        </details>

        <details className="px-3 py-2.5 border-b border-gray-200">
          <summary className="cursor-pointer list-none flex items-center justify-between select-none">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0">Data &amp; Info</h3>
            <span className="text-[0.6rem] text-gray-400 transition-transform duration-200">{'\u25BE'}</span>
          </summary>
          <div className="pt-1.5">
            <button className="inline-flex items-center justify-center gap-0.5 w-full px-2.5 py-1.5 border border-gray-400 rounded-md bg-transparent text-gray-600 cursor-pointer text-xs font-medium whitespace-nowrap transition-all" onClick={handleShowData}>Show Stroke Data (toData)</button>
            {dataInfo && <div className="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{dataInfo}</div>}
            <button className="inline-flex items-center justify-center gap-0.5 w-full px-2.5 py-1.5 border border-gray-400 rounded-md bg-transparent text-gray-600 cursor-pointer text-xs font-medium whitespace-nowrap transition-all mt-2" onClick={handleShowKitInfo}>Show Kit Info (getKit/getCanvas)</button>
            {kitInfo && <div className="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{kitInfo}</div>}
            {saveCallbackUrl && (
              <>
                <div className="block text-xs font-medium text-gray-600 mt-2">onSave callback received:</div>
                <div className="text-[0.68rem] font-mono text-gray-500 bg-gray-100 px-1.5 py-1 rounded border border-gray-200 break-all mt-1">{saveCallbackUrl}</div>
              </>
            )}
          </div>
        </details>
      </aside>
    </div>
  )
}

export default SignatureDemo
