// Inclusion types (DUA y PIAR)
export type Modalidad = 'presencial' | 'virtual' | 'hibrida'

export type NecesidadEducativa =
  | 'dificultad_lectura'
  | 'dificultad_escritura'
  | 'dificultad_calculo'
  | 'tdah'
  | 'tea'
  | 'discapacidad_intelectual_leve'
  | 'discapacidad_visual'
  | 'discapacidad_auditiva'
  | 'barreras_socioemocionales'

// Opciones de necesidades educativas para UI
export const NECESIDADES_EDUCATIVAS_OPTIONS: { label: string; value: NecesidadEducativa; descripcion: string }[] = [
  { label: 'Dificultad de lectura', value: 'dificultad_lectura', descripcion: 'Textos cortos, pictogramas, apoyo de audio' },
  { label: 'Dificultad de escritura', value: 'dificultad_escritura', descripcion: 'Respuesta oral, dibujo, seleccion multiple' },
  { label: 'Dificultad de calculo', value: 'dificultad_calculo', descripcion: 'Ejemplos visuales, manipulativos, calculadora' },
  { label: 'TDAH', value: 'tdah', descripcion: 'Actividades cortas, descansos, instrucciones paso a paso' },
  { label: 'TEA (Espectro Autista)', value: 'tea', descripcion: 'Rutinas claras, anticipar cambios, evitar sobrecarga' },
  { label: 'Discapacidad intelectual leve', value: 'discapacidad_intelectual_leve', descripcion: 'Lenguaje simple, mas ejemplos, repeticion' },
  { label: 'Discapacidad visual', value: 'discapacidad_visual', descripcion: 'Descripcion detallada, alto contraste' },
  { label: 'Discapacidad auditiva', value: 'discapacidad_auditiva', descripcion: 'Informacion visual, texto escrito' },
  { label: 'Barreras socioemocionales', value: 'barreras_socioemocionales', descripcion: 'Actividades de eleccion, apoyo emocional' }
]

export const MODALIDAD_OPTIONS: { label: string; value: Modalidad }[] = [
  { label: 'Presencial', value: 'presencial' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Hibrida', value: 'hibrida' }
]

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  rol: 'student' | 'teacher'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  nombre: string
  apellido?: string | ""
  email: string
  rol: 'student' | 'teacher' | 'admin'
  createdAt: string
}

// IA Query types
export interface CreateIaQueryRequest {
  prompt: string
}

export interface IaQuery {
  id: string
  userId: string
  prompt: string
  response: string | null
  tokensUsed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export interface IaQueryResponse {
  iaQueryId: string
  material: Material
}

// Material types
export interface Material {
  id: string
  userId: string
  iaQueryId: string
  content: string
  title?: string
  type?: string
  claseId?: string
  // Campos de inclusion
  modalidad?: Modalidad | null
  necesidadesPIAR?: NecesidadEducativa[]
  duaAplicado?: boolean
  createdAt: string
}

// Clase types
export interface Clase {
  id: string
  userId: string
  nombre: string
  descripcion?: string
  materia: string
  grado: GradoEducativo
  estado?: 'activa' | 'archivada' | 'pausada'
  // Campos de inclusion (DUA y PIAR)
  modalidad?: Modalidad
  necesidadesPIAR?: NecesidadEducativa[]
  createdAt: string
  updatedAt: string
}

export type GradoEducativo =
  | 'grado_0' | 'grado_1' | 'grado_2' | 'grado_3' | 'grado_4' | 'grado_5'
  | 'grado_6' | 'grado_7' | 'grado_8' | 'grado_9' | 'grado_10' | 'grado_11'
  | 'universitario'

export interface ClaseWithMaterials extends Clase {
  materiales: Material[]
}

// Plan types
export type PlanDuration = 'monthly' | 'yearly'

export interface Plan {
  id: string
  nombre: string
  descripcion?: string | null
  descripciones: DescripcionesPlan[]
  precio: number
  currency: string
  aiQueriesLimit: number
  duration: PlanDuration
  estado: number
  created_at: string
  update_at?: string | null
}

export interface DescripcionesPlan {
  id: string
  idPlan: string
  descripcion: string
}

// Suscripcion types
export interface Suscripcion {
  id: string
  userId: string
  planId: string
  fechaInicio: string
  fechaFin: string
  estado: 'activa' | 'cancelada' | 'expirada'
  createdAt: string
}

// Pago/Payment types
export type EstadoPago = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export interface WompiConfig {
  publicKey: string
  widgetUrl: string
  checkoutUrl: string
  isSandbox: boolean
  currency: string
  minAmount: number
}

export interface IniciarPagoRequest {
  planId: string
  suscripcionId?: string
  monto: number
  descripcion?: string
  customerEmail?: string
  customerFullName?: string
  redirectUrl?: string
}

export interface WompiData {
  publicKey: string
  amountInCents: number
  currency: string
  reference: string
  signature: string
  redirectUrl?: string
  widgetUrl: string
  isSandbox: boolean
}

export interface IniciarPagoResponse {
  success: boolean
  data: {
    pagoId: string
    reference: string
    monto: number
    montoFormateado: string
    wompi: WompiData
  }
}

export interface Pago {
  id: string
  reference: string
  transactionId?: string
  estado: EstadoPago
  monto: number
  montoFormateado?: string
  metodoPago?: string
  descripcion?: string
  createdAt: string
  completedAt?: string
}

export interface VerificarPagoResponse {
  success: boolean
  data: {
    pago: Pago
    verified: boolean
    statusChanged: boolean
  }
}

export interface UsageStatus {
  canUseAI: boolean
  usage: {
    current: number
    limit: number
    remaining: number
    percentage: number
  }
  period: string
  plan: string
  message?: string
}
