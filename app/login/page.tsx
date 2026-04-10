import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#33332e] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,0,35,0.12),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(230,0,35,0.06),transparent_24%),linear-gradient(180deg,#33332e_0%,#2a2a26_40%,#211922_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(145,145,140,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(145,145,140,0.06)_1px,transparent_1px)] bg-[size:30px_30px] opacity-35" />

      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[32px] border border-white/10 bg-white/5 p-10 text-white backdrop-blur-xl lg:block">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#e5e5e0]">
            Internal experimentation platform
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight">
            Build, test, and compare humor pipelines with full control.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/65">
            The Matrix is Crackd&apos;s internal environment for chaining model steps, evaluating
            image sets, and understanding caption behavior before a flavor ships wider.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Pipeline steps</p>
              <p className="mt-3 text-2xl font-semibold">Multi-step</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Testing</p>
              <p className="mt-3 text-2xl font-semibold">Study sets</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Access</p>
              <p className="mt-3 text-2xl font-semibold">Approved only</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/8 p-8 backdrop-blur-2xl sm:p-10">
          <div className="flex flex-col items-start">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-[#e60023] blur-lg opacity-50" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e60023]">
                <span className="text-2xl font-black text-white">M</span>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Secure access</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to The Matrix</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Use your approved Google account to access flavor authoring, evaluation, and caption inspection tools.
            </p>
          </div>

          <div className="my-8 h-px bg-white/10" />

          <LoginForm />

          <p className="mt-6 text-center text-xs text-white/35">
            Restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  )
}
