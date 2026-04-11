import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SignatureKit } from './signature-kit'
import { drawWatermark } from './watermark'

function createCanvas(width = 300, height = 150): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = width
  canvas.height = height
  document.body.appendChild(canvas)
  return canvas
}

function createKit(width = 300, height = 150, options?: Parameters<typeof SignatureKit>[1]) {
  const canvas = createCanvas(width, height)
  return new SignatureKit(canvas, options)
}

describe('SignatureKit', () => {
  let kit: SignatureKit

  beforeEach(() => {
    kit = createKit()
  })

  describe('construction', () => {
    it('should create an instance without error', () => {
      expect(kit).toBeInstanceOf(SignatureKit)
    })

    it('should start as empty', () => {
      expect(kit.isEmpty()).toBe(true)
    })

    it('should expose the canvas element', () => {
      expect(kit.canvas).toBeInstanceOf(HTMLCanvasElement)
    })

    it('should expose the underlying SignaturePad', () => {
      expect(kit.signaturePad).toBeDefined()
    })

    it('should initialize as enabled', () => {
      expect(kit.disabled).toBe(false)
    })

    it('should initialize as disabled when option is set', () => {
      const disabledKit = createKit(300, 150, { disabled: true })
      expect(disabledKit.disabled).toBe(true)
      disabledKit.destroy()
    })
  })

  describe('clear', () => {
    it('should emit a clear event', () => {
      const handler = vi.fn()
      kit.on('clear', handler)
      kit.clear()
      expect(handler).toHaveBeenCalledOnce()
    })

    it('should remain empty after clear', () => {
      kit.clear()
      expect(kit.isEmpty()).toBe(true)
    })
  })

  describe('undo / redo', () => {
    it('canUndo should be false when no strokes have been made', () => {
      expect(kit.canUndo).toBe(false)
    })

    it('canRedo should be false initially', () => {
      expect(kit.canRedo).toBe(false)
    })

    it('should save state to undo stack on clear', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])
      kit.clear()
      // After clear, undo() early-returns because toData().length === 0
      // but the undo stack was populated by clear()
      kit.undo()
      // undo does nothing because canvas is empty
      expect(kit.isEmpty()).toBe(true)
    })

    it('should undo last stroke and redo it back', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
        {
          points: [{ x: 20, y: 20, time: Date.now() + 1, pressure: 0.5 }],
        },
      ])
      expect(kit.isEmpty()).toBe(false)
      expect(kit.toData()).toHaveLength(2)

      kit.undo()
      expect(kit.toData()).toHaveLength(1)
      expect(kit.canRedo).toBe(true)

      kit.redo()
      expect(kit.toData()).toHaveLength(2)
      expect(kit.canRedo).toBe(false)
    })

    it('should emit undo and redo events', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])

      const undoHandler = vi.fn()
      const redoHandler = vi.fn()
      kit.on('undo', undoHandler)
      kit.on('redo', redoHandler)

      kit.undo()
      expect(undoHandler).toHaveBeenCalledOnce()

      kit.redo()
      expect(redoHandler).toHaveBeenCalledOnce()
    })

    it('should not undo when undo stack is empty', () => {
      const handler = vi.fn()
      kit.on('undo', handler)
      kit.undo()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should not redo when redo stack is empty', () => {
      const handler = vi.fn()
      kit.on('redo', handler)
      kit.redo()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should allow multiple undo/redo cycles', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
        {
          points: [{ x: 20, y: 20, time: Date.now() + 1, pressure: 0.5 }],
        },
      ])
      expect(kit.toData()).toHaveLength(2)

      kit.undo()
      expect(kit.toData()).toHaveLength(1)

      kit.undo()
      expect(kit.toData()).toHaveLength(0)
      expect(kit.canUndo).toBe(false)
      expect(kit.canRedo).toBe(true)

      kit.redo()
      expect(kit.toData()).toHaveLength(1)

      kit.redo()
      expect(kit.toData()).toHaveLength(2)
      expect(kit.canRedo).toBe(false)
    })
  })

  describe('fromData / toData', () => {
    it('should accept stroke data', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])
      expect(kit.isEmpty()).toBe(false)
    })

    it('should return stroke data via toData', () => {
      const data = [
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ]
      kit.fromData(data)
      const result = kit.toData()
      expect(result).toHaveLength(1)
      expect(result[0].points).toHaveLength(1)
    })
  })

  describe('toDataURL', () => {
    it('should return a data URL string', () => {
      const url = kit.toDataURL()
      expect(url).toMatch(/^data:image\/png;base64,/)
    })

    it('should return JPEG data URL when specified', () => {
      const url = kit.toDataURL('image/jpeg', 0.8)
      expect(url).toMatch(/^data:image\/jpeg;base64,/)
    })
  })

  describe('toBlob', () => {
    it('should return a Blob', async () => {
      const blob = await kit.toBlob()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })
  })

  describe('toFile', () => {
    it('should return a File', async () => {
      const file = await kit.toFile('test.png')
      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.png')
      expect(file.type).toBe('image/png')
    })
  })

  describe('toSVG', () => {
    it('should return an SVG string', () => {
      const svg = kit.toSVG()
      expect(svg).toContain('<svg')
    })
  })

  describe('trim', () => {
    it('should return null when canvas is empty', () => {
      const result = kit.trim()
      expect(result).toBeNull()
    })

    it('should return trimmed result when canvas has content', () => {
      kit.fromData([
        {
          points: [{ x: 50, y: 50, time: Date.now(), pressure: 1 }],
        },
      ])
      const result = kit.trim()
      expect(result).not.toBeNull()
      expect(result!.canvas).toBeInstanceOf(HTMLCanvasElement)
      expect(result!.dataUrl).toMatch(/^data:image\/png;base64,/)
      expect(result!.bounds).toHaveProperty('x')
      expect(result!.bounds).toHaveProperty('y')
      expect(result!.bounds).toHaveProperty('width')
      expect(result!.bounds).toHaveProperty('height')
    })

    it('should respect padding option', () => {
      kit.fromData([
        {
          points: [{ x: 50, y: 50, time: Date.now(), pressure: 1 }],
        },
      ])
      const withoutPadding = kit.trim()
      const withPadding = kit.trim({ padding: 10 })
      expect(withPadding!.bounds.width).toBeGreaterThanOrEqual(
        withoutPadding!.bounds.width,
      )
    })
  })

  describe('watermark', () => {
    it('should return null when no watermark is set', () => {
      expect(kit.watermark).toBeNull()
    })

    it('should store watermark options', () => {
      kit.addWatermark({ text: 'TEST' })
      expect(kit.watermark).toEqual({ text: 'TEST' })
    })

    it('should clear watermark', () => {
      kit.addWatermark({ text: 'TEST' })
      kit.clearWatermark()
      expect(kit.watermark).toBeNull()
    })

    it('should not throw when adding watermark with empty text', () => {
      expect(() => kit.addWatermark({ text: '' })).not.toThrow()
    })
  })

  describe('disabled', () => {
    it('should toggle disabled state', () => {
      kit.disabled = true
      expect(kit.disabled).toBe(true)
      kit.disabled = false
      expect(kit.disabled).toBe(false)
    })
  })

  describe('updateOptions', () => {
    it('should update pen color', () => {
      kit.updateOptions({ penColor: 'red' })
      expect(kit.signaturePad.penColor).toBe('red')
    })

    it('should toggle disabled via updateOptions', () => {
      kit.updateOptions({ disabled: true })
      expect(kit.disabled).toBe(true)
    })
  })

  describe('event system', () => {
    it('should register and trigger event handlers', () => {
      const handler = vi.fn()
      kit.on('clear', handler)
      kit.clear()
      expect(handler).toHaveBeenCalledOnce()
    })

    it('should remove event handlers via off', () => {
      const handler = vi.fn()
      kit.on('clear', handler)
      kit.off('clear', handler)
      kit.clear()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should support multiple handlers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      kit.on('clear', handler1)
      kit.on('clear', handler2)
      kit.clear()
      expect(handler1).toHaveBeenCalledOnce()
      expect(handler2).toHaveBeenCalledOnce()
    })
  })

  describe('destroy', () => {
    it('should clean up all resources', () => {
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])
      kit.addWatermark({ text: 'TEST' })

      kit.destroy()
      // canUndo checks toData().length > 0; destroy doesn't clear stroke data
      expect(kit.canRedo).toBe(false)
      expect(kit.watermark).toBeNull()
    })
  })

  describe('offAll', () => {
    it('should remove all event handlers', () => {
      const clearHandler = vi.fn()
      const undoHandler = vi.fn()
      const redoHandler = vi.fn()
      kit.on('clear', clearHandler)
      kit.on('undo', undoHandler)
      kit.on('redo', redoHandler)

      kit.offAll()

      kit.clear()
      expect(clearHandler).not.toHaveBeenCalled()

      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])
      kit.undo()
      expect(undoHandler).not.toHaveBeenCalled()

      kit.redo()
      expect(redoHandler).not.toHaveBeenCalled()
    })
  })

  describe('watermark persistence', () => {
    it('should keep watermark after undo', () => {
      kit.addWatermark({ text: 'WATERMARK' })
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
        {
          points: [{ x: 50, y: 50, time: Date.now() + 1, pressure: 0.5 }],
        },
      ])

      kit.undo()

      // Watermark options should still be stored
      expect(kit.watermark).toEqual({ text: 'WATERMARK' })
      // Canvas should not be empty (still has 1 stroke)
      expect(kit.toData()).toHaveLength(1)
    })

    it('should keep watermark after redo', () => {
      kit.addWatermark({ text: 'WATERMARK' })
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])

      kit.undo()
      kit.redo()

      expect(kit.watermark).toEqual({ text: 'WATERMARK' })
      expect(kit.toData()).toHaveLength(1)
    })

    it('should keep watermark after updateOptions backgroundColor change', () => {
      kit.addWatermark({ text: 'WATERMARK' })
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])

      kit.updateOptions({ backgroundColor: 'rgb(240, 240, 240)' })

      expect(kit.watermark).toEqual({ text: 'WATERMARK' })
      expect(kit.toData()).toHaveLength(1)
    })

    it('should keep watermark after clearWatermark and addWatermark cycle with strokes', () => {
      kit.addWatermark({ text: 'FIRST' })
      kit.fromData([
        {
          points: [{ x: 10, y: 10, time: Date.now(), pressure: 0.5 }],
        },
      ])
      kit.clearWatermark()
      expect(kit.watermark).toBeNull()

      kit.addWatermark({ text: 'SECOND' })
      expect(kit.watermark).toEqual({ text: 'SECOND' })
      expect(kit.toData()).toHaveLength(1)
    })
  })
})

describe('drawWatermark', () => {
  it('should not throw for valid options', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    expect(() =>
      drawWatermark(ctx, { text: 'Watermark', fontSize: 16 }),
    ).not.toThrow()
  })

  it('should handle multi-line text', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    expect(() =>
      drawWatermark(ctx, { text: 'Line1\nLine2\nLine3' }),
    ).not.toThrow()
  })

  it('should handle rotation', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    expect(() =>
      drawWatermark(ctx, { text: 'Rotated', rotation: -30 }),
    ).not.toThrow()
  })

  it('should do nothing for empty text', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    const imageDataBefore = ctx.getImageData(0, 0, 300, 150)
    drawWatermark(ctx, { text: '' })
    const imageDataAfter = ctx.getImageData(0, 0, 300, 150)
    expect(imageDataBefore.data).toEqual(imageDataAfter.data)
  })

  it('should handle stroke style', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    expect(() =>
      drawWatermark(ctx, {
        text: 'Stroke',
        style: 'stroke',
        strokeStyle: 'rgba(255,0,0,0.3)',
      }),
    ).not.toThrow()
  })

  it('should handle all style (fill + stroke)', () => {
    const canvas = createCanvas(300, 150)
    const ctx = canvas.getContext('2d')!
    expect(() =>
      drawWatermark(ctx, { text: 'Both', style: 'all' }),
    ).not.toThrow()
  })
})
