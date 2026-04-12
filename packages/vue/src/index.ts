export { default as SignatureCanvas } from './SignatureCanvas.vue'
export { useSignatureKit } from './useSignatureKit'
export type { SignatureCanvasProps, SignatureCanvasEmits, UseSignatureKitOptions, UseSignatureKitReturn } from './types'

// Re-export core types for consumer convenience
export type {
  WatermarkOptions,
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
  TrimOptions,
  TrimResult,
} from '@tinyforged/signature-kit'
export type { PointGroup } from 'signature_pad'
