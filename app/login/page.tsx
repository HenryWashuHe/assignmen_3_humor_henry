import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-100 mb-4">
            <span className="text-2xl font-bold text-zinc-100 dark:text-zinc-900">M</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">The Matrix</h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Humor Flavor Management System
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Sign in to continue
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Access is restricted to authorized administrators only.
          </p>
          <LoginForm />
        </div>

        <p className="text-center mt-6 text-xs text-zinc-400 dark:text-zinc-600">
          Internal developer tool — unauthorized access prohibited
        </p>
      </div>
    </div>
  )
}
