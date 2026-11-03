import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared look for every page: one header, one set of buttons and fields. */

const btnBase =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg text-[15px] font-medium whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const btn = {
  primary: cn(btnBase, "bg-ink text-bg hover:bg-white"),
  secondary: cn(btnBase, "border border-line-strong text-ink hover:bg-raised"),
  ghost: cn(btnBase, "text-ink-2 hover:text-ink hover:bg-raised px-3"),
  small: "h-9 px-4 text-sm",
};

export const field =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 transition-colors focus:outline-none focus:border-accent";

export const label = "block text-sm font-medium text-ink mb-2";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 text-ink">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect width="26" height="26" rx="7" fill="var(--color-accent)" />
        <path
          d="M7 8.5h12M7 13h8M7 17.5h10"
          stroke="#0f0f0e"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">ConvoSim</span>
    </Link>
  );
}

export function TopBar({
  home = "/",
  width = "max-w-6xl",
  children,
}: {
  home?: string;
  width?: string;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className={cn("mx-auto flex h-16 items-center", width, "justify-between gap-4 px-5 sm:px-8")}>
        <Logo href={home} />
        <nav className="flex items-center gap-1 sm:gap-2">{children}</nav>
      </div>
    </header>
  );
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-[15px] text-ink-2 transition-colors hover:bg-raised hover:text-ink"
    >
      {children}
    </Link>
  );
}

export function SignOut() {
  return (
    <form action="/auth/signout" method="post">
      <button className="rounded-lg px-3 py-2 text-[15px] text-ink-2 transition-colors hover:bg-raised hover:text-ink">
        Sign out
      </button>
    </form>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-3">{children}</p>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface", className)}>
      {children}
    </section>
  );
}

export function CenterNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center text-ink-2">
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-accent"
      aria-hidden
    />
  );
}

/* Score helpers: green from 8, amber from 5, red below. */
export function scoreTone(v: number) {
  return v >= 8 ? "good" : v >= 5 ? "warn" : "bad";
}

export const toneText = { good: "text-good", warn: "text-warn", bad: "text-bad" } as const;
export const toneBg = { good: "bg-good", warn: "bg-warn", bad: "bg-bad" } as const;

export const LANGUAGE_LABEL: Record<string, string> = {
  english: "English",
  roman_urdu: "Roman Urdu",
};

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
