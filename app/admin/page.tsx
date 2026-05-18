import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Lead { id: string; email: string; created_at: string }
interface EventRow { event_type: string; created_at: string }
interface AggEvent { event_type: string; count: number; last_seen: string }
interface AuthUser {
  id: string
  email?: string
  app_metadata?: { provider?: string }
  created_at: string
  last_sign_in_at?: string
}

async function getStats() {
  const adminSupabase = createAdminClient()

  const [
    { data: { users } = { users: [] as AuthUser[] } },
    { data: leads },
    { data: rawEvents },
  ] = await Promise.all([
    adminSupabase.auth.admin.listUsers(),
    adminSupabase.from('leads').select('*').order('created_at', { ascending: false }).limit(100),
    adminSupabase.from('site_events').select('event_type, created_at').order('created_at', { ascending: false }),
  ])

  const eventMap = new Map<string, { count: number; last_seen: string }>()
  for (const ev of (rawEvents ?? []) as EventRow[]) {
    const existing = eventMap.get(ev.event_type)
    if (!existing) {
      eventMap.set(ev.event_type, { count: 1, last_seen: ev.created_at })
    } else {
      existing.count++
    }
  }

  const eventStats: AggEvent[] = Array.from(eventMap.entries()).map(([event_type, val]) => ({
    event_type,
    count: val.count,
    last_seen: val.last_seen,
  }))

  return {
    users: (users ?? []) as AuthUser[],
    leads: (leads ?? []) as Lead[],
    eventStats,
    totalSessions: eventMap.get('session_start')?.count ?? 0,
    totalPageViews: eventMap.get('page_view')?.count ?? 0,
    movieClicks: eventMap.get('movie_click')?.count ?? 0,
    emotionClicks: eventMap.get('emotion_category_click')?.count ?? 0,
    ottClicks: eventMap.get('ott_redirect_click')?.count ?? 0,
  }
}

function StatCard({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/8 bg-[#0b0d12] p-5">
      <span className={`text-3xl font-bold tracking-tight ${accent ? 'text-[#13edff]' : 'text-white'}`}>
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a8d96]">{label}</span>
    </div>
  )
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?signin=1')

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []
  const isAdmin = adminEmails.length === 0 || adminEmails.includes(user.email ?? '')

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
        <p className="text-[#8a8d96] text-sm">Access denied.</p>
      </div>
    )
  }

  const stats = await getStats()

  return (
    <div className="min-h-screen bg-[#06070a] text-white">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#06070a]/80 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-[-0.04em]">
              Cinema<span className="text-[#13edff]">split</span>
            </span>
            <span className="rounded-full border border-[#13edff]/30 bg-[#13edff]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#13edff]">
              Admin
            </span>
          </div>
          <p className="text-[12px] text-[#8a8d96]">{user.email}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10 space-y-12">

        {/* Stats */}
        <section>
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8d96]">Overview</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            <StatCard label="Registered Users" value={stats.users.length} accent />
            <StatCard label="Collected Leads" value={stats.leads.length} />
            <StatCard label="Total Sessions" value={stats.totalSessions} />
            <StatCard label="Page Views" value={stats.totalPageViews} />
            <StatCard label="Movie Clicks" value={stats.movieClicks} />
            <StatCard label="Emotion Clicks" value={stats.emotionClicks} />
            <StatCard label="OTT Redirects" value={stats.ottClicks} />
          </div>
        </section>

        {/* Registered Users */}
        <section>
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8d96]">
            Registered Users ({stats.users.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0b0d12]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Email', 'Provider', 'Signed Up', 'Last Active'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.2em] text-[#8a8d96] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.users.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-[#8a8d96] text-sm">No users yet</td></tr>
                  ) : stats.users.slice(0, 100).map((u) => (
                    <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5 text-[13px] text-white">{u.email ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#8a8d96]">
                          {u.app_metadata?.provider ?? 'email'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8a8d96]">{fmt(u.created_at)}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8a8d96]">{u.last_sign_in_at ? fmt(u.last_sign_in_at) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Leads */}
        <section>
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8d96]">
            Collected Leads ({stats.leads.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0b0d12]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Email', 'Captured At'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.2em] text-[#8a8d96] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.leads.length === 0 ? (
                    <tr><td colSpan={2} className="px-5 py-8 text-center text-[#8a8d96] text-sm">No leads yet</td></tr>
                  ) : stats.leads.map((l) => (
                    <tr key={l.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5 text-[13px] text-[#13edff]">{l.email}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8a8d96]">{fmt(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Event Analytics */}
        <section>
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a8d96]">
            Event Analytics
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/8 bg-[#0b0d12]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Event Type', 'Count', 'Last Seen'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.2em] text-[#8a8d96] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.eventStats.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[#8a8d96] text-sm">No events yet</td></tr>
                  ) : stats.eventStats.sort((a, b) => b.count - a.count).map((ev) => (
                    <tr key={ev.event_type} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5">
                        <span className="rounded-full border border-[#13edff]/20 bg-[#13edff]/8 px-3 py-1 text-[11px] font-mono text-[#13edff]/80">
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[18px] font-bold text-white">{ev.count}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#8a8d96]">{fmt(ev.last_seen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <footer className="pb-10 text-center text-[11px] uppercase tracking-[0.2em] text-[#4d505a]">
          CinemaSplit Admin · Data from Supabase
        </footer>
      </main>
    </div>
  )
}
