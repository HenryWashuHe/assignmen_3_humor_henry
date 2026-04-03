import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#14070a] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.25),transparent_22%),linear-gradient(180deg,#14070a_0%,#11060b_45%,#050306_100%)]" />

      <div className="relative z-10 max-w-md rounded-[32px] border border-red-400/15 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/15">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <p className="text-xs uppercase tracking-[0.24em] text-red-200/50">Restricted area</p>
        <h1 className="mb-3 mt-3 text-3xl font-semibold text-white">Access Denied</h1>
        <p className="mb-8 text-sm leading-7 text-white/55">
          You don&apos;t have permission to access The Matrix. This tool is restricted to
          superadmins and matrix admins only.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-white/30 hover:bg-white/15"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Login
        </Link>
      </div>
    </div>
  )
}
