import { createClient } from "@/lib/supabase/server";
import { fetchUserSessions } from "@/lib/api";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Session } from "@/lib/types";

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-4">{value}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let sessions: Session[] = [];
  try {
    const res = await fetchUserSessions(user.id);
    if (res.ok) sessions = await res.json();
  } catch {
    // silently fail — show empty state
  }

  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-white text-lg">ConvoSim</span>
        <div className="flex items-center gap-4">
          <Link
            href="/scenarios"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Scenarios
          </Link>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              {completedSessions.length === 0
                ? "You haven't completed any sessions yet."
                : `${completedSessions.length} session${completedSessions.length !== 1 ? "s" : ""} completed.`}
            </p>
          </div>
          <Link
            href="/scenarios"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            + New Session
          </Link>
        </div>

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center space-y-4">
            <div className="text-4xl">🎙️</div>
            <h2 className="text-xl font-semibold text-white">Start your first simulation</h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Pick a scenario, configure the personality, and start practicing.
            </p>
            <Link
              href="/scenarios"
              className="inline-block mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Browse Scenarios
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      {session.scenarios?.title ?? "Custom Scenario"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        session.status === "completed"
                          ? "bg-green-900/50 text-green-400"
                          : session.status === "active"
                          ? "bg-yellow-900/50 text-yellow-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {session.personality_type} · {session.difficulty} ·{" "}
                    {new Date(session.started_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {session.status === "active" && (
                    <Link
                      href={`/session/${session.id}`}
                      className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                    >
                      Resume
                    </Link>
                  )}
                  {session.status === "completed" && (
                    <Link
                      href={`/feedback/${session.id}`}
                      className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      View Feedback
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
