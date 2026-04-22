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
  PointGroup,
} from '@tinyforged/signature-kit'
