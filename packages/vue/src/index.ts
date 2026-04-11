export { default as SignatureCanvas } from './SignatureCanvas.vue'
export type { SignatureCanvasProps, SignatureCanvasEmits } from './types'

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
