"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome to ConvoSim</h1>
          <p className="text-gray-400">Sign in to start practicing conversations.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <p className="text-white font-medium">Check your inbox</p>
              <p className="text-gray-400 text-sm">
                We sent a magic link to <strong>{email}</strong>. Click it to
                sign in.
              </p>
            </div>
          ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
          )}
        </div>
      </div>
    </main>
  );
}
