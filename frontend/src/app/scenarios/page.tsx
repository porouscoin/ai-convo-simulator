import { fetchScenarios } from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Scenario } from "@/lib/types";
import { TopBar, NavLink, SignOut, Eyebrow } from "@/components/ui";

const CATEGORY_LABELS: Record<string, string> = {
  career: "Career",
  sales: "Sales",
  conflict: "Conflict",
  social: "Social",
};

export default async function ScenariosPage() {
  let scenarios: Scenario[] = [];
  try {
    const res = await fetchScenarios();
    if (res.ok) scenarios = await res.json();
  } catch {
    // silently fail — show error state below
  }

  const byCategory = scenarios.reduce<Record<string, Scenario[]>>((acc, s) => {
    acc[s.category] = acc[s.category] ? [...acc[s.category], s] : [s];
    return acc;
  }, {});

  return (
    <div className="min-h-dvh">
      <TopBar home="/dashboard" width="max-w-5xl">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <SignOut />
      </TopBar>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Choose a scenario</h1>
        <p className="mt-2 text-[17px] text-ink-2">
          You&apos;ll set the context, your goal and the other person&apos;s personality next.
        </p>

        {scenarios.length === 0 ? (
          <p className="mt-10 rounded-xl border border-bad/40 px-6 py-5 text-[15px] text-bad">
            Scenarios couldn&apos;t be loaded. The server may be waking up, so try again in a
            minute.
          </p>
        ) : (
          <div className="mt-10 space-y-12">
            {Object.entries(byCategory).map(([category, items]) => (
              <section key={category}>
                <Eyebrow>{CATEGORY_LABELS[category] ?? category}</Eyebrow>
                <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                  {items.map((s) => (
                    <Link
                      key={s.id}
                      href={`/scenarios/${s.id}/configure`}
                      className="group flex items-center justify-between gap-6 px-5 py-5 transition-colors hover:bg-raised sm:px-6"
                    >
                      <div className="min-w-0">
                        <h2 className="text-lg font-medium">{s.title}</h2>
                        <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{s.description}</p>
                        {s.tags.length > 0 && (
                          <p className="mt-2 text-sm text-ink-3">{s.tags.join(" · ")}</p>
                        )}
                      </div>
                      <ArrowRight
                        size={20}
                        className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
