"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFeedback, fetchSession } from "@/lib/api";
import type { FeedbackData, Session } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  TopBar,
  NavLink,
  Panel,
  Eyebrow,
  CenterNote,
  Spinner,
  btn,
  scoreTone,
  toneText,
  toneBg,
  DIFFICULTY_LABEL,
  LANGUAGE_LABEL,
} from "@/components/ui";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const tone = scoreTone(value);
  return (
    <div>
      <div className="flex items-baseline justify-between text-[15px]">
        <span className="text-ink-2">{label}</span>
        <span className="font-medium tabular-nums">{value}<span className="text-ink-3"> / 10</span></span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
        <div
          className={`h-full rounded-full transition-all duration-700 ${toneBg[tone]}`}
          style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }}
        />
      </div>
    </div>
  );
}

function List({ title, dot, items }: { title: string; dot: string; items: string[] }) {
  return (
    <Panel className="p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((s, i) => (
          <li key={i} className="border-t border-line pt-3 text-[15px] leading-relaxed text-ink-2 first:border-0 first:pt-0">
            {s}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState(false);

  const poll = useCallback(async (id: string) => {
    try {
      const res = await fetchFeedback(id);
      if (res.status === 202) {
        setTimeout(() => poll(id), 2500);
        return;
      }
      if (!res.ok) {
        setError(true);
        setGenerating(false);
        return;
      }
      const data = await res.json();
      if (data.key_moments) {
        data.key_moments = data.key_moments.map((m: string | object) =>
          typeof m === "string" ? JSON.parse(m) : m
        );
      }
      setFeedback(data);
      setGenerating(false);
    } catch {
      setError(true);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    params.then(({ id }) => {
      setSessionId(id);
      poll(id);
      fetchSession(id)
        .then((r) => r.json())
        .then(setSession)
        .catch(() => {});
    });
  }, [params, poll]);

  if (generating) {
    return (
      <CenterNote>
        <Spinner />
        <p className="text-lg text-ink">Reading your conversation...</p>
        <p className="text-[15px] text-ink-3">This usually takes 10 to 15 seconds.</p>
      </CenterNote>
    );
  }

  if (error || !feedback) {
    return (
      <CenterNote>
        <p className="text-bad">The feedback couldn&apos;t be loaded.</p>
        <button
          onClick={() => {
            setError(false);
            setGenerating(true);
            poll(sessionId);
          }}
          className={btn.secondary}
        >
          Try again
        </button>
      </CenterNote>
    );
  }

  const scenarioTitle =
    (session as (Session & { scenarios?: { title: string } }) | null)?.scenarios?.title ?? "Conversation";
  const tone = scoreTone(feedback.overall_score);
  const verdict =
    feedback.overall_score >= 8
      ? "Strong conversation."
      : feedback.overall_score >= 5
        ? "Solid, with room to improve."
        : "Worth another try.";

  return (
    <div className="min-h-dvh">
      <TopBar home="/dashboard" width="max-w-5xl">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <Link href="/scenarios" className={cn(btn.primary, btn.small, "ml-1")}>
          Practice again
        </Link>
      </TopBar>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
        <div className="pb-4">
          <Eyebrow>Session feedback</Eyebrow>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{scenarioTitle}</h1>
          {session && (
            <p className="mt-2 text-[17px] text-ink-2">
              {session.personality_type} · {DIFFICULTY_LABEL[session.difficulty] ?? session.difficulty} ·{" "}
              {LANGUAGE_LABEL[session.language] ?? "English"}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Panel className="flex flex-col justify-between p-6">
            <p className="text-[15px] text-ink-3">Overall score</p>
            <p className="mt-4 text-7xl font-semibold tracking-tight tabular-nums">
              <span className={toneText[tone]}>{feedback.overall_score}</span>
              <span className="text-2xl font-normal text-ink-3"> / 10</span>
            </p>
            <p className="mt-4 text-[17px] text-ink-2">{verdict}</p>
          </Panel>
          {feedback.scores && (
            <Panel className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">Skill breakdown</h2>
              <ScoreBar label="Clarity" value={feedback.scores.clarity} />
              <ScoreBar label="Persuasion" value={feedback.scores.persuasion} />
              <ScoreBar label="Emotional control" value={feedback.scores.emotional_control} />
              <ScoreBar label="Adaptability" value={feedback.scores.adaptability} />
            </Panel>
          )}
        </div>

        <Panel className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Analysis</h2>
          <p className="mt-3 max-w-3xl whitespace-pre-line text-[16px] leading-[1.75] text-ink-2">
            {feedback.full_analysis}
          </p>
        </Panel>

        <div className="grid gap-6 md:grid-cols-2">
          <List title="What worked" dot="bg-good" items={feedback.strengths ?? []} />
          <List title="What to work on" dot="bg-bad" items={feedback.weaknesses ?? []} />
        </div>

        {feedback.personality_insight && (
          <Panel className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">
              Dealing with {session?.personality_type ? `an ${session.personality_type}` : "this personality"}
            </h2>
            <p className="mt-3 max-w-3xl text-[16px] leading-[1.75] text-ink-2">{feedback.personality_insight}</p>
          </Panel>
        )}

        {feedback.key_moments?.length > 0 && (
          <Panel className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Key moments</h2>
            <div className="mt-5 space-y-5">
              {feedback.key_moments.map((m, i) => (
                <div key={i} className="border-l-2 border-line-strong pl-5">
                  <p className="text-[16px] italic leading-relaxed text-ink">&ldquo;{m.quote}&rdquo;</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{m.impact}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {feedback.better_responses?.length > 0 && (
          <Panel className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Better responses</h2>
            <div className="mt-5 divide-y divide-line">
              {feedback.better_responses.map((item, i) => (
                <div key={i} className="py-5 first:pt-0 last:pb-0">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-ink-3">You said</p>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{item.original}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-good">Try instead</p>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.suggested}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-3">{item.reason}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/scenarios" className={btn.primary}>
            Practice again
          </Link>
          <Link href="/dashboard" className={btn.secondary}>
            Back to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
