import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '3s' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s', animationDuration: '4s' }}
      />
      <div
        className="absolute top-3/4 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s', animationDuration: '5s' }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl shadow-black/50">
          {/* Logo with gradient ring */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-lg opacity-60" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <span className="text-2xl font-black text-white">M</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              The Matrix
            </h1>
            <p className="text-white/50 text-sm mt-2">Humor Flavor Management System</p>
          </div>

          <div className="border-t border-white/10 mb-6" />
          <p className="text-center text-white/40 text-xs uppercase tracking-widest mb-6">
            Sign in to continue
          </p>

          <LoginForm />

          <p className="text-center text-white/30 text-xs mt-6">
            Restricted to authorized administrators only
          </p>
        </div>
      </div>
    </div>
  )
}
