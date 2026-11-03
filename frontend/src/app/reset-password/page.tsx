"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopBar, NavLink, btn, field, label } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setReady(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted && (event === "PASSWORD_RECOVERY" || !!session)) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?message=password_reset");
    router.refresh();
  }

  return (
    <div className="min-h-dvh">
      <TopBar>
        <NavLink href="/login">Sign in</NavLink>
      </TopBar>
      <main className="mx-auto w-full max-w-md px-5 py-14 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-[17px] text-ink-2">Choose the password you&apos;ll sign in with from now on.</p>

        {!ready && (
          <p className="mt-8 rounded-lg border border-warn/40 px-4 py-3 text-[15px] text-warn">
            Open this page from the reset link in your email. If you came here directly, request a new link
            from the sign-in page.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className={label}>
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={field}
            />
          </div>
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

          {error && <p className="rounded-lg border border-bad/40 px-4 py-3 text-[15px] text-bad">{error}</p>}

          <button type="submit" disabled={loading || !ready} className={`${btn.primary} w-full`}>
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>
      </main>
    </div>
  );
}
