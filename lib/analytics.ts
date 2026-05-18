declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-53ZZTQRTPN'

export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters)
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: url })
  }
}

export function trackMovieClick(filmTitle: string, filmYear: number) {
  trackEvent('movie_click', { film_title: filmTitle, film_year: filmYear })
}

export function trackEmotionClick(emotion: string, world: string) {
  trackEvent('emotion_category_click', { emotion, world })
}

export function trackOttRedirect(filmTitle: string, provider: string) {
  trackEvent('ott_redirect_click', { film_title: filmTitle, provider })
}

export function trackSignup(provider: 'email' | 'google') {
  trackEvent('sign_up', { method: provider })
}

export function trackLogin(provider: 'email' | 'google') {
  trackEvent('login', { method: provider })
}

// Supabase event tracking
import { createClient } from '@/lib/supabase/client'

export async function trackSupabaseEvent(
  eventType: string,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('cs_session_id') || (() => {
          const id = crypto.randomUUID()
          sessionStorage.setItem('cs_session_id', id)
          return id
        })()
      : undefined

    await supabase.from('site_events').insert({
      event_type: eventType,
      user_id: user?.id ?? null,
      session_id: sessionId,
      metadata: metadata ?? {},
    })
  } catch {}
}
