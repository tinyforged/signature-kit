export { SignatureKit } from './signature-kit'
export { drawWatermark } from './watermark'
export type {
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
  SignatureKitEventHandler,
  WatermarkOptions,
} from './types'

// Re-export useful types from signature_pad for convenience
export type { PointGroup, Options } from 'signature_pad'
