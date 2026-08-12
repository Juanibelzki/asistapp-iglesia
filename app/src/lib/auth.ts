import { supabase } from './supabase'

export const handleSocialLogin = async (provider: 'google' | 'apple') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) console.error('Error en social login:', error.message)
}
