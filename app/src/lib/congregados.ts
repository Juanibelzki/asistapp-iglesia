import { supabase } from './supabase'
import type { Congregado, CongregadoInput } from './types'

/**
 * Acceso a datos de `congregados`.
 * Esquema real: id, organization_id, first_name, last_name, phone, is_student,
 * student_stage, guardian_name, guardian_phone, status, qr_code, created_at.
 */

export const needsGuardian = (f: Pick<CongregadoInput, 'is_student' | 'student_stage'>) =>
  f.is_student && (f.student_stage === 'niño' || f.student_stage === 'adolescente')

export const EMPTY_MEMBER: CongregadoInput = {
  first_name: '',
  last_name: '',
  phone: '',
  is_student: false,
  student_stage: 'niño',
  guardian_name: '',
  guardian_phone: '',
}

export function memberToInput(m: Congregado): CongregadoInput {
  return {
    first_name: m.first_name,
    last_name: m.last_name,
    phone: m.phone || '',
    is_student: m.is_student,
    student_stage: m.student_stage || 'niño',
    guardian_name: m.guardian_name || '',
    guardian_phone: m.guardian_phone || '',
  }
}

function toRow(f: CongregadoInput) {
  const guardian = needsGuardian(f)
  return {
    first_name: f.first_name.trim(),
    last_name: f.last_name.trim(),
    phone: f.phone.trim() || null,
    is_student: f.is_student,
    student_stage: f.is_student ? f.student_stage : null,
    guardian_name: guardian ? f.guardian_name.trim() || null : null,
    guardian_phone: guardian ? f.guardian_phone.trim() || null : null,
  }
}

export function validateMember(f: CongregadoInput): string | null {
  if (!f.first_name.trim() || !f.last_name.trim()) return 'Nombre y apellido son obligatorios.'
  return null
}

export async function listCongregados(orgId: string): Promise<Congregado[]> {
  const { data, error } = await supabase
    .from('congregados')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Congregado[]
}

export async function createCongregado(orgId: string, f: CongregadoInput): Promise<void> {
  const { error } = await supabase.from('congregados').insert({
    organization_id: orgId,
    ...toRow(f),
    qr_code: crypto.randomUUID(),
    status: 'activo',
  })
  if (error) throw error
}

export async function updateCongregado(orgId: string, id: string, f: CongregadoInput): Promise<void> {
  const { error } = await supabase
    .from('congregados')
    .update(toRow(f))
    .eq('id', id)
    .eq('organization_id', orgId)
  if (error) throw error
}

export async function deleteCongregado(orgId: string, id: string): Promise<void> {
  const { error } = await supabase.from('congregados').delete().eq('id', id).eq('organization_id', orgId)
  if (error) throw error
}
