"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchScenario, createSession } from "@/lib/api";
import { PERSONALITY_TYPES, DIFFICULTY_LEVELS, CONVERSATION_LANGUAGES } from "@/lib/types";
import type { Scenario, ConversationLanguage } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  TopBar,
  NavLink,
  Panel,
  Eyebrow,
  CenterNote,
  Spinner,
  btn,
  field,
  label,
  DIFFICULTY_LABEL,
  LANGUAGE_LABEL,
} from "@/components/ui";

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
  const [startError, setStartError] = useState("");

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
    setStartError("");

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
        language,
        context,
        user_goal: userGoal,
      },
      user.id
    );

    if (res.ok) {
      const session = await res.json();
      router.push(`/session/${session.id}`);
    } else {
      setSubmitting(false);
      setStartError("The session couldn't be started. The server may be waking up, so try again in a minute.");
    }
  }

  if (loading) {
    return (
      <CenterNote>
        <Spinner />
        <p>Loading scenario...</p>
      </CenterNote>
    );
  }

  if (!scenario) {
    return (
      <CenterNote>
        <p className="text-bad">This scenario couldn&apos;t be found.</p>
        <button onClick={() => router.push("/scenarios")} className={btn.secondary}>
          Back to scenarios
        </button>
      </CenterNote>
    );
  }

  const persona = PERSONALITY_TYPES.find((p) => p.value === personalityType);
  const choice = (selected: boolean) =>
    `flex flex-col items-start rounded-lg border text-left transition-colors ${
      selected
        ? "border-accent bg-raised"
        : "border-line bg-surface hover:border-line-strong"
    }`;

  return (
    <div className="min-h-dvh">
      <TopBar home="/dashboard">
        <NavLink href="/scenarios">Scenarios</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </TopBar>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-[15px] text-ink-3 hover:text-ink"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <Eyebrow>Set up the conversation</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{scenario.title}</h1>
        <p className="mt-2 max-w-2xl text-[17px] text-ink-2">{scenario.description}</p>

        <form
          onSubmit={handleStart}
          className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12"
        >
          <div className="space-y-10">
            <div className="space-y-6">
              <div>
                <label htmlFor="context" className={label}>
                  Context
                </label>
                <p className="-mt-1 mb-2.5 text-sm text-ink-3">Who you are and what&apos;s going on.</p>
                <textarea
                  id="context"
                  required
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  placeholder="I have been in this role for 2 years and have exceeded my targets every quarter."
                  className={`${field} resize-none`}
                />
              </div>
              <div>
                <label htmlFor="goal" className={label}>
                  Your goal
                </label>
                <p className="-mt-1 mb-2.5 text-sm text-ink-3">What a good outcome looks like.</p>
                <textarea
                  id="goal"
                  required
                  value={userGoal}
                  onChange={(e) => setUserGoal(e.target.value)}
                  rows={2}
                  placeholder="Get a 20% salary increase approved."
                  className={`${field} resize-none`}
                />
              </div>
            </div>

            <fieldset>
              <legend className={label}>The other person&apos;s personality</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {PERSONALITY_TYPES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    aria-pressed={personalityType === p.value}
                    onClick={() => setPersonalityType(p.value)}
                    className={`${choice(personalityType === p.value)} !flex-row gap-3.5 px-4 py-3.5`}
                  >
                    <span className="w-11 shrink-0 pt-px font-mono text-sm font-medium text-ink">
                      {p.value}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{p.label.split("— ")[1]}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-3">{p.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={label}>Difficulty</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-3">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={difficulty === d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`${choice(difficulty === d.value)} px-4 py-3.5`}
                  >
                    <span className="block text-[15px] font-medium">{d.label}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-3">{d.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={label}>Language</legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {CONVERSATION_LANGUAGES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={language === o.value}
                    onClick={() => setLanguage(o.value)}
                    className={`${choice(language === o.value)} px-4 py-3.5`}
                  >
                    <span className="block text-[15px] font-medium">{o.label}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink-3">{o.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Panel className="p-6">
              <p className="text-sm text-ink-3">You&apos;ll be talking to</p>
              <p className="mt-1 text-xl font-semibold">
                {persona?.value}{" "}
                <span className="font-normal text-ink-2">{persona?.label.split("— ")[1]}</span>
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{persona?.description}</p>
              <dl className="mt-5 space-y-2 border-t border-line pt-5 text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-ink-3">Difficulty</dt>
                  <dd>{DIFFICULTY_LABEL[difficulty]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-3">Language</dt>
                  <dd>{LANGUAGE_LABEL[language]}</dd>
                </div>
              </dl>
              <button type="submit" disabled={submitting} className={`${btn.primary} mt-6 w-full`}>
                {submitting ? "Starting..." : "Start conversation"}
                {!submitting && <ArrowRight size={17} />}
              </button>
              {startError && <p className="mt-3 text-sm text-bad">{startError}</p>}
            </Panel>
          </aside>
        </form>
      </main>
    </div>
  );
}
