export type StudentStage = 'niño' | 'adolescente' | 'adulto'

export const STAGE_LABELS: Record<StudentStage, string> = {
  niño: 'Niños',
  adolescente: 'Adolescentes',
  adulto: 'Adultos',
}

export const STAGE_SINGULAR: Record<StudentStage, string> = {
  niño: 'niño',
  adolescente: 'adolescente',
  adulto: 'adulto',
}

export const STAGE_RANGES: Record<StudentStage, string> = {
  niño: '0–11 años',
  adolescente: '12–17 años',
  adulto: '18+ años',
}

export const STAGES: StudentStage[] = ['niño', 'adolescente', 'adulto']

export interface Congregado {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  phone?: string | null
  is_student: boolean
  student_stage?: StudentStage | null
  guardian_name?: string | null
  guardian_phone?: string | null
  status: string
  qr_code?: string | null
  created_at?: string
}

export interface CongregadoInput {
  first_name: string
  last_name: string
  phone: string
  is_student: boolean
  student_stage: StudentStage
  guardian_name: string
  guardian_phone: string
}

export interface EventItem {
  id: string
  title: string
  event_date: string
}
