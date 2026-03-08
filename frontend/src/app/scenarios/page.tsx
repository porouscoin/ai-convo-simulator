import { fetchScenarios } from "@/lib/api";
import Link from "next/link";
import type { Scenario } from "@/lib/types";

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
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-white text-lg">
          ConvoSim
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Choose a Scenario</h1>
          <p className="text-gray-400 mt-1">
            Select the conversation you want to practice.
          </p>
        </div>

        {scenarios.length === 0 ? (
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-8 text-center">
            <p className="text-red-400">
              Could not load scenarios. Make sure the backend is running and your database is seeded.
            </p>
          </div>
        ) : (
          Object.entries(byCategory).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((scenario) => (
                  <Link
                    key={scenario.id}
                    href={`/scenarios/${scenario.id}/configure`}
                    className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-700 rounded-2xl p-6 block transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {scenario.title}
                        </h3>
                        <p className="text-sm text-gray-400">{scenario.description}</p>
                        {scenario.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {scenario.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-600 group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
