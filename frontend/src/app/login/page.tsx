"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopBar, NavLink, btn, field, label } from "@/components/ui";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [queryMessage, setQueryMessage] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryMessage(params.get("message"));
    setQueryError(params.get("error"));
  }, []);

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
    ? "It's free. You only need an email."
    : mode === "forgot-password"
      ? "Enter your email and we'll send you a reset link."
      : "Pick up where you left off.";

  const tab = (m: AuthMode, text: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setError(null);
        setMessage(null);
      }}
      className={`h-10 rounded-md text-[15px] font-medium transition-colors ${
        mode === m ? "bg-raised text-ink" : "text-ink-3 hover:text-ink"
      }`}
    >
      {text}
    </button>
  );

  const shownError =
    error ?? (queryError === "auth_callback_failed" ? "Authentication failed. Try again." : queryError);
  const shownMessage =
    message ??
    (queryMessage === "password_reset" ? "Password updated. Sign in with your new password." : queryMessage);

  return (
    <div className="min-h-dvh">
      <TopBar>
        <NavLink href="/">Home</NavLink>
      </TopBar>
      <main className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-[17px] text-ink-2">{subtitle}</p>

        <div className="mt-8 space-y-6">
          {mode !== "forgot-password" && (
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-surface p-1">
              {tab("sign-in", "Sign in")}
              {tab("sign-up", "Create account")}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={field}
              />
            </div>

            {mode !== "forgot-password" && (
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="password" className={label}>
                    Password
                  </label>
                  {mode === "sign-in" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot-password");
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-sm text-ink-3 hover:text-ink"
                    >
                      Forgot it?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "sign-up" ? "At least 6 characters" : "Your password"}
                  className={field}
                />
              </div>
            )}

            {mode === "sign-up" && (
              <div>
                <label htmlFor="confirm-password" className={label}>
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type it again"
                  className={field}
                />
              </div>
            )}

            {shownError && (
              <p className="rounded-lg border border-bad/40 px-4 py-3 text-[15px] text-bad">{shownError}</p>
            )}
            {shownMessage && (
              <p className="rounded-lg border border-good/40 px-4 py-3 text-[15px] text-good">{shownMessage}</p>
            )}

            <button type="submit" disabled={loading} className={`${btn.primary} w-full`}>
              {loading
                ? "Working..."
                : mode === "sign-up"
                  ? "Create account"
                  : mode === "forgot-password"
                    ? "Send reset link"
                    : "Sign in"}
            </button>
          </form>

          {mode === "forgot-password" && (
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setError(null);
                setMessage(null);
              }}
              className="text-[15px] text-ink-2 hover:text-ink"
            >
              Back to sign in
            </button>
          )}

          <p className="border-t border-line pt-6 text-sm leading-relaxed text-ink-3">
            Used a magic link before? Choose &ldquo;Forgot it?&rdquo; once with the same email to set a
            password. Your past sessions and feedback stay on that account.
          </p>
        </div>
      </main>
    </div>
  );
}
