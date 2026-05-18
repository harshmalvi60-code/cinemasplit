'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import { trackSignup, trackLogin, trackSupabaseEvent } from '@/lib/analytics'

type View = 'landing' | 'email-signup' | 'email-login' | 'forgot-password' | 'check-email'

export default function AuthModal() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [view, setView] = useState<View>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Auto-show after delay
  useEffect(() => {
    if (user) return
    if (typeof window !== 'undefined') {
      const alreadyDismissed = localStorage.getItem('cs_auth_dismissed')
      if (alreadyDismissed) return
    }

    const delay = Math.floor(Math.random() * 5000) + 5000 // 5–10 seconds
    const timer = setTimeout(() => {
      setVisible(true)
      setTimeout(() => setAnimating(true), 50)
    }, delay)

    return () => clearTimeout(timer)
  }, [user])

  // Listen for manual trigger from Nav "Sign In" button
  useEffect(() => {
    function handleShowAuth() {
      setDismissed(false)
      setView('landing')
      setError('')
      setVisible(true)
      setTimeout(() => setAnimating(true), 50)
    }
    window.addEventListener('cs:show-auth', handleShowAuth)
    return () => window.removeEventListener('cs:show-auth', handleShowAuth)
  }, [])

  const dismiss = useCallback(() => {
    setAnimating(false)
    setTimeout(() => {
      setVisible(false)
      setDismissed(true)
      localStorage.setItem('cs_auth_dismissed', '1')
    }, 400)
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Store in leads table
    await supabase.from('leads').insert({ email }).then(() => {})

    trackSignup('email')
    await trackSupabaseEvent('signup', { provider: 'email' })
    setView('check-email')
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    trackLogin('email')
    await trackSupabaseEvent('login', { provider: 'email' })
    dismiss()
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) setError(error.message)
    else setView('check-email')
    setLoading(false)
  }

  if (!visible || user || dismissed) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backdropFilter: animating ? 'blur(12px)' : 'blur(0px)',
        background: animating ? 'rgba(6,7,10,0.85)' : 'rgba(6,7,10,0)',
        transition: 'all 0.4s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      <div
        style={{
          opacity: animating ? 1 : 0,
          transform: animating ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d12] shadow-2xl"
      >
        {/* Glow top */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(19,237,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        {/* Grain overlay */}
        <div aria-hidden className="grain absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-all hover:border-white/30 hover:text-ink text-sm"
          >
            ✕
          </button>

          {/* Logo + tagline */}
          {view !== 'check-email' && (
            <div className="mb-7 text-center">
              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="text-[22px] font-bold tracking-[-0.04em] text-ink">Cinema</span>
                <span className="text-[22px] font-bold tracking-[-0.04em] text-accent">split</span>
              </div>
              <p className="text-[12px] uppercase tracking-[0.3em] text-ink-muted">
                {view === 'landing' && 'Your emotional film universe'}
                {view === 'email-signup' && 'Create your account'}
                {view === 'email-login' && 'Welcome back'}
                {view === 'forgot-password' && 'Reset your password'}
              </p>
            </div>
          )}

          {/* ── LANDING VIEW ── */}
          {view === 'landing' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-[13px] font-semibold text-ink transition-all hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-1">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">or</span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <button
                onClick={() => setView('email-signup')}
                className="w-full rounded-xl border border-accent/40 bg-accent/10 px-4 py-3.5 text-[13px] font-semibold text-accent transition-all hover:bg-accent hover:text-black"
              >
                Continue with Email
              </button>

              <button
                onClick={() => setView('email-login')}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-[12px] font-medium text-ink-muted transition-all hover:border-white/20 hover:text-ink-soft"
              >
                Already have an account? Sign in
              </button>

              <button
                onClick={dismiss}
                className="mt-1 w-full text-center text-[11px] uppercase tracking-[0.2em] text-ink-faint hover:text-ink-muted transition-colors"
              >
                Maybe later
              </button>
            </div>
          )}

          {/* ── EMAIL SIGNUP ── */}
          {view === 'email-signup' && (
            <form onSubmit={handleEmailSignup} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {error && <p className="text-[12px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent px-4 py-3.5 text-[13px] font-bold text-black transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => { setView('landing'); setError('') }}
                className="text-[11px] text-center text-ink-faint hover:text-ink-muted transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          {/* ── EMAIL LOGIN ── */}
          {view === 'email-login' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {error && <p className="text-[12px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent px-4 py-3.5 text-[13px] font-bold text-black transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setView('forgot-password'); setError('') }}
                className="text-[12px] text-center text-accent/70 hover:text-accent transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => { setView('landing'); setError('') }}
                className="text-[11px] text-center text-ink-faint hover:text-ink-muted transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {error && <p className="text-[12px] text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-accent px-4 py-3.5 text-[13px] font-bold text-black transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => { setView('email-login'); setError('') }}
                className="text-[11px] text-center text-ink-faint hover:text-ink-muted transition-colors"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {/* ── CHECK EMAIL ── */}
          {view === 'check-email' && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-2xl">
                ✉
              </div>
              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="text-[22px] font-bold tracking-[-0.04em] text-ink">Cinema</span>
                <span className="text-[22px] font-bold tracking-[-0.04em] text-accent">split</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">Check your email</h3>
              <p className="max-w-[280px] text-[13px] leading-relaxed text-ink-soft">
                We sent a link to <span className="text-accent">{email}</span>. Click it to continue.
              </p>
              <button
                onClick={dismiss}
                className="mt-2 rounded-xl border border-white/10 px-5 py-2.5 text-[12px] font-medium text-ink-muted transition-all hover:border-white/20 hover:text-ink"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
