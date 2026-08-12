import { supabase } from './supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, organization_id')
    .eq('auth_user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Children
export async function getChildren(orgId: string) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('organization_id', orgId)
    .order('first_name')
  
  if (error) throw error
  return data
}

export async function addChild(child: any) {
  const { data, error } = await supabase.from('children').insert(child).select()
  if (error) throw error
  return data
}

export async function updateChild(id: string, child: any) {
  const { data, error } = await supabase.from('children').update(child).eq('id', id).select()
  if (error) throw error
  return data
}

export async function deleteChild(id: string) {
  const { error } = await supabase.from('children').delete().eq('id', id)
  if (error) throw error
}

// Events
export async function getEvents(orgId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', orgId)
    .order('event_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function addEvent(event: any) {
  const { data, error } = await supabase.from('events').insert(event).select()
  if (error) throw error
  return data
}

export async function updateEvent(id: string, event: any) {
  const { data, error } = await supabase.from('events').update(event).eq('id', id).select()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

// Attendance
export async function getAttendance(eventId: string) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('event_id', eventId)
  
  if (error) throw error
  return data
}

export async function upsertAttendance(attendance: any) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(attendance, { onConflict: 'event_id, child_id' })
    .select()
  if (error) throw error
  return data
}

export async function deleteAttendance(eventId: string, childId: string) {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('event_id', eventId)
    .eq('child_id', childId)
  if (error) throw error
}

// Organizations
export async function getOrganization(orgId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateOrganization(orgId: string, updates: any) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
  if (error) throw error
  return data
}

export async function updateOrganizationByStripeId(stripeId: string, updates: any) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .or(`stripe_customer_id.eq.${stripeId},stripe_subscription_id.eq.${stripeId}`)
    .select()
  if (error) throw error
  return data
}
