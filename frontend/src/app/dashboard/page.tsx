import { createClient } from "@/lib/supabase/server";
import { fetchUserSessions } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import type { Session } from "@/lib/types";
import {
  TopBar,
  NavLink,
  SignOut,
  Panel,
  btn,
  DIFFICULTY_LABEL,
  LANGUAGE_LABEL,
} from "@/components/ui";

const STATUS: Record<Session["status"], { text: string; dot: string }> = {
  completed: { text: "Completed", dot: "bg-good" },
  active: { text: "In progress", dot: "bg-warn" },
  abandoned: { text: "Abandoned", dot: "bg-ink-3" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let sessions: Session[] = [];
  try {
    const res = await fetchUserSessions(user.id);
    if (res.ok) sessions = await res.json();
  } catch {
    // silently fail — show empty state
  }

  const completed = sessions.filter((s) => s.status === "completed").length;
  const active = sessions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-dvh">
      <TopBar home="/dashboard" width="max-w-5xl">
        <NavLink href="/scenarios">Scenarios</NavLink>
        <SignOut />
      </TopBar>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your sessions</h1>
            <p className="mt-2 text-[17px] text-ink-2">
              {sessions.length === 0
                ? "Nothing yet. Your practice history will show up here."
                : `${completed} completed${active ? `, ${active} in progress` : ""}.`}
            </p>
          </div>
          <Link href="/scenarios" className={btn.primary}>
            <Plus size={17} /> New session
          </Link>
        </div>

        {sessions.length === 0 ? (
          <Panel className="mt-10 px-6 py-14 text-center sm:px-10">
            <h2 className="text-xl font-semibold">Start your first conversation</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-2">
              Pick a scenario, choose who you&apos;re talking to and how tough they are, then
              start talking.
            </p>
            <Link href="/scenarios" className={`${btn.secondary} mt-7`}>
              Browse scenarios <ArrowRight size={17} />
            </Link>
          </Panel>
        ) : (
          <Panel className="mt-10 divide-y divide-line">
            {sessions.map((s) => {
              const st = STATUS[s.status] ?? STATUS.abandoned;
              const href =
                s.status === "active"
                  ? `/session/${s.id}`
                  : s.status === "completed"
                    ? `/feedback/${s.id}`
                    : null;
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[17px] font-medium">
                      {s.scenarios?.title ?? "Custom scenario"}
                    </p>
                    <p className="mt-1 text-[15px] text-ink-3">
                      {s.personality_type} · {DIFFICULTY_LABEL[s.difficulty] ?? s.difficulty} ·{" "}
                      {LANGUAGE_LABEL[s.language] ?? "English"} · {formatDate(s.started_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-5">
                    <span className="flex items-center gap-2 text-sm text-ink-2">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} aria-hidden />
                      {st.text}
                    </span>
                    {href && (
                      <Link
                        href={href}
                        className={cn(btn.secondary, btn.small, "min-w-[128px]")}
                      >
                        {s.status === "active" ? "Resume" : "View feedback"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </Panel>
        )}
      </main>
    </div>
  );
}
