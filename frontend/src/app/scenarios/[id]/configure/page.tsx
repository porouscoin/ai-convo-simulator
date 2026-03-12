"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchScenario, createSession } from "@/lib/api";
import { PERSONALITY_TYPES, DIFFICULTY_LEVELS, CONVERSATION_LANGUAGES } from "@/lib/types";
import type { Scenario, ConversationLanguage } from "@/lib/types";

export default function ConfigurePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();

  const [scenarioId, setScenarioId] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [personalityType, setPersonalityType] = useState("INTJ");
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState<ConversationLanguage>("english");
  const [context, setContext] = useState("");
  const [userGoal, setUserGoal] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setScenarioId(id);
      fetchScenario(id)
        .then((res) => res.json())
        .then((data) => {
          setScenario(data);
          setContext(data.default_context ?? "");
          setUserGoal(data.default_goal ?? "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!scenario) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const res = await createSession(
      {
        scenario_id: scenarioId,
        personality_type: personalityType,
        difficulty,
        context,
        user_goal: userGoal,
      },
      user.id
    );

    if (res.ok) {
      const session = await res.json();
      router.push(`/session/${session.id}?lang=${language}`);
    } else {
      setSubmitting(false);
      alert("Failed to create session. Make sure the backend is running.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Scenario not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-white text-lg">ConvoSim</span>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="space-y-2 mb-8">
          <p className="text-sm text-indigo-400 font-medium uppercase tracking-wider">
            Configure Simulation
          </p>
          <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
          <p className="text-gray-400">{scenario.description}</p>
        </div>

        <form onSubmit={handleStart} className="space-y-7">
          {/* Context */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Context
              <span className="ml-1 text-xs text-gray-500">(who you are and the situation)</span>
            </label>
            <textarea
              required
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              placeholder="e.g. I have been in this role for 2 years and have exceeded my targets every quarter."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Your Goal
              <span className="ml-1 text-xs text-gray-500">(what you want to achieve)</span>
            </label>
            <textarea
              required
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              rows={2}
              placeholder="e.g. Get a 20% salary increase approved."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Personality */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Other Person&apos;s Personality
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {PERSONALITY_TYPES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPersonalityType(p.value)}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    personalityType === p.value
                      ? "bg-indigo-900/50 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <div className="font-medium text-sm">{p.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_LEVELS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    difficulty === d.value
                      ? "bg-indigo-900/50 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <div className="font-semibold text-sm">{d.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{d.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Language</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONVERSATION_LANGUAGES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    language === option.value
                      ? "bg-indigo-900/50 border-indigo-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {submitting ? "Starting..." : "Start Simulation →"}
          </button>
        </form>
      </div>
    </div>
  );
}
