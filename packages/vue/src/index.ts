export { default as SignatureCanvas } from './SignatureCanvas.vue'
export type { SignatureCanvasProps, SignatureCanvasEmits } from './types'

// Re-export core types for consumer convenience
export type {
  WatermarkOptions,
  SignatureKitOptions,
  SignatureKitEventType,
  SignatureKitEventDetail,
} from '@tinyforged/signature-kit'
