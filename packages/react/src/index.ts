export { SignatureCanvas } from './SignatureCanvas'
export { useSignatureKit } from './useSignatureKit'
export type { SignatureCanvasProps, SignatureCanvasRef, UseSignatureKitOptions, UseSignatureKitReturn } from './types'

// Re-export core types for convenience
export type {
  WatermarkOptions,
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
  TrimOptions,
  TrimResult,
} from '@tinyforged/signature-kit'
export type { PointGroup } from 'signature_pad'
