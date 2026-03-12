"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const queryMessage = searchParams.get("message");
  const queryError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
      setLoading(false);
      return;
    }

    if (mode === "sign-up") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Account created. If email confirmation is enabled in Supabase, confirm your email and then sign in with your password.");
        setMode("sign-in");
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset email sent. Use the link once to set your password.");
    }
    setLoading(false);
  }

  const title = mode === "sign-up" ? "Create your account" : mode === "forgot-password" ? "Reset your password" : "Welcome back";
  const subtitle = mode === "sign-up"
    ? "Create an account to start practicing conversations."
    : mode === "forgot-password"
      ? "Enter your email and we will send a password reset link."
      : "Sign in to start practicing conversations.";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-6">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setError(null);
                setMessage(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "sign-in" ? "bg-indigo-600 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("sign-up");
                setError(null);
                setMessage(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "sign-up" ? "bg-indigo-600 text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {mode !== "forgot-password" && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {mode === "sign-up" && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}

            {(queryError || error) && (
              <p className="text-red-400 text-sm">{error ?? (queryError === "auth_callback_failed" ? "Authentication failed. Try again." : queryError)}</p>
            )}

            {(queryMessage || message) && (
              <p className="text-green-400 text-sm">{message ?? (queryMessage === "password_reset" ? "Password updated. Sign in with your new password." : queryMessage)}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading
                ? "Working..."
                : mode === "sign-up"
                  ? "Create Account"
                  : mode === "forgot-password"
                    ? "Send Reset Link"
                    : "Sign In"}
            </button>
          </form>

          {mode !== "forgot-password" ? (
            <button
              type="button"
              onClick={() => {
                setMode("forgot-password");
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot your password?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Back to sign in
            </button>
          )}

          <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-sm text-gray-400">
            If you previously used a magic-link account, use "Forgot your password?" with the same email once. Your existing sessions and feedback stay attached to that account.
          </div>
        </div>
      </div>
    </main>
  );
}
