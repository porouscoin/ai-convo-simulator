"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFeedback, fetchSession } from "@/lib/api";
import type { FeedbackData, Session } from "@/lib/types";
import Link from "next/link";

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 8 ? "bg-green-500" : value >= 6 ? "bg-indigo-500" : value >= 4 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">{value}/10</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
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
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Analyzing your conversation...</p>
        <p className="text-gray-600 text-sm">This takes about 10–15 seconds</p>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">Failed to load feedback.</p>
        <button
          onClick={() => { setError(false); setGenerating(true); poll(sessionId); }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const scenarioTitle =
    (session as (Session & { scenarios?: { title: string } }) | null)?.scenarios?.title ?? "Conversation";
  const selectedLanguage = session?.language === "roman_urdu" ? "Roman Urdu" : "English";

  const scoreColor =
    feedback.overall_score >= 8 ? "text-green-400"
    : feedback.overall_score >= 6 ? "text-indigo-400"
    : feedback.overall_score >= 4 ? "text-yellow-400"
    : "text-red-400";

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-white text-lg">ConvoSim</span>
        <Link href="/scenarios" className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
          Practice Again
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-1">
          <p className="text-sm text-indigo-400 font-medium uppercase tracking-wider">Session Feedback</p>
          <h1 className="text-2xl font-bold text-white">{scenarioTitle}</h1>
          {session && (
            <p className="text-gray-400 text-sm">{session.personality_type} · {session.difficulty} difficulty · {selectedLanguage}</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center space-y-2">
          <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Overall Score</p>
          <p className={`text-7xl font-bold ${scoreColor}`}>{feedback.overall_score}</p>
          <p className="text-gray-500 text-sm">out of 10</p>
        </div>

        {feedback.scores && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Skill Breakdown</h2>
            <ScoreBar label="Clarity" value={feedback.scores.clarity} />
            <ScoreBar label="Persuasion" value={feedback.scores.persuasion} />
            <ScoreBar label="Emotional Control" value={feedback.scores.emotional_control} />
            <ScoreBar label="Adaptability" value={feedback.scores.adaptability} />
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-3">
          <h2 className="font-semibold text-white">Analysis</h2>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{feedback.full_analysis}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-3">
            <h2 className="font-semibold text-green-400">Strengths</h2>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-3">
            <h2 className="font-semibold text-red-400">Weaknesses</h2>
            <ul className="space-y-2">
              {feedback.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {feedback.personality_insight && (
          <div className="bg-indigo-950/40 rounded-2xl border border-indigo-800/50 p-6 space-y-2">
            <h2 className="font-semibold text-indigo-300">Personality Insight</h2>
            <p className="text-sm text-gray-300 leading-relaxed">{feedback.personality_insight}</p>
          </div>
        )}

        {feedback.key_moments?.length > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Key Moments</h2>
            <div className="space-y-4">
              {feedback.key_moments.map((moment, i) => (
                <div key={i} className="border-l-2 border-gray-700 pl-4 space-y-1">
                  <p className="text-sm text-gray-400 italic">&ldquo;{moment.quote}&rdquo;</p>
                  <p className="text-sm text-gray-300">{moment.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedback.better_responses?.length > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h2 className="font-semibold text-white">Better Responses</h2>
            <div className="space-y-5">
              {feedback.better_responses.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3">
                    <p className="text-xs text-red-400 font-medium mb-1 uppercase tracking-wide">You said</p>
                    <p className="text-sm text-gray-300">{item.original}</p>
                  </div>
                  <div className="bg-green-950/30 border border-green-900/40 rounded-xl p-3">
                    <p className="text-xs text-green-400 font-medium mb-1 uppercase tracking-wide">Try instead</p>
                    <p className="text-sm text-gray-300">{item.suggested}</p>
                  </div>
                  <p className="text-xs text-gray-500 px-1">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pb-8">
          <Link href="/scenarios" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-center transition-colors">
            Practice Again
          </Link>
          <Link href="/dashboard" className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl text-center transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}