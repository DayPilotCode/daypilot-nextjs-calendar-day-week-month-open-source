'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = searchParams.get('from') || '/';

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/check')
      .then(res => {
        if (res.ok) {
          router.push(from);
        }
      })
      .catch(() => {
        // Not authenticated, stay on login page
      });
  }, [from, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Redirect to original page or home
      router.push(from);
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-shift-border bg-[#0d1629] p-8 shadow-card">
        <div className="mb-6 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Access</p>
          <h1 className="text-xl font-semibold text-slate-50">ShiftAware Login</h1>
          <p className="text-sm text-slate-400">
            Single shared password, session cookie, no PII stored.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-shift-border bg-slate-900 px-3 py-2 text-slate-50 outline-none ring-0 transition focus:border-shift-accent focus:ring-2 focus:ring-shift-accent/30 disabled:opacity-60"
              placeholder="Enter shared password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-shift-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

