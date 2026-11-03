import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopBar, NavLink, btn, Eyebrow } from "@/components/ui";

const PREVIEW = [
  {
    who: "you",
    text: "I've closed every quarterly target for two years, and I took on the Lahore accounts when Sara left. I'd like to talk about moving my salary up by 20%.",
  },
  {
    who: "them",
    text: "Targets are the job. Twenty percent is a big number. What changed in your role that the budget should reflect?",
  },
  {
    who: "you",
    text: "I now cover two territories with the same hours. Here's the revenue from the second one since March.",
  },
];

const PRACTICE = [
  { group: "Career", items: ["Salary negotiation", "Job interview", "Asking for a promotion"] },
  { group: "Sales", items: ["Sales call with a sceptical client", "An angry customer who wants a refund"] },
  { group: "Conflict", items: ["A coworker who misses deadlines and blames others"] },
];

const STEPS = [
  ["Pick a situation", "Start from a scenario and add your own context and goal."],
  ["Choose who you face", "One of 16 personalities, a difficulty, English or Roman Urdu."],
  ["Talk it through", "The AI stays in character and pushes back on weak points."],
  ["Read your feedback", "A score, what worked, and better lines for the moments that didn't."],
];

function Preview() {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div>
          <p className="text-[15px] font-medium">Salary negotiation</p>
          <p className="text-sm text-ink-3">INTJ manager · Hard · English</p>
        </div>
        <span className="rounded-md border border-line-strong px-2.5 py-1 font-mono text-xs text-ink-2">
          Sample
        </span>
      </div>
      <div className="space-y-4 px-5 py-5">
        {PREVIEW.map((m, i) =>
          m.who === "you" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-xl rounded-br-sm bg-raised px-4 py-3 text-[15px] leading-relaxed">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-line-strong font-mono text-[11px] text-ink-2">
                INTJ
              </span>
              <p className="max-w-[85%] text-[15px] leading-relaxed text-ink-2">{m.text}</p>
            </div>
          ),
        )}
      </div>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-1 border-t border-line px-5 py-4">
        <div className="row-span-2">
          <p className="text-xs text-ink-3">Feedback</p>
          <p className="text-3xl font-semibold tracking-tight">
            7.5<span className="text-base font-normal text-ink-3"> / 10</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-1 text-sm text-ink-2 sm:grid-cols-2">
          <span>Clarity <b className="font-medium text-ink">8</b></span>
          <span>Persuasion <b className="font-medium text-ink">7</b></span>
          <span>Emotional control <b className="font-medium text-ink">8</b></span>
          <span>Adaptability <b className="font-medium text-ink">7</b></span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh">
      <TopBar>
        <NavLink href="/login">Sign in</NavLink>
      </TopBar>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Eyebrow>AI conversation simulator</Eyebrow>
            <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Rehearse the hard conversation before you have it.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
              An AI plays the other person, with the personality and difficulty you pick,
              and pushes back the way they would. When you finish, you get a score and
              better lines to try next time.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className={btn.primary}>
                Start practicing <ArrowRight size={17} />
              </Link>
              <Link href="/login" className={btn.secondary}>
                Sign in
              </Link>
            </div>
          </div>
          <Preview />
        </section>

        <section className="border-t border-line py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What you can practice</h2>
          <div className="mt-8 divide-y divide-line border-t border-line">
            {PRACTICE.map((p) => (
              <div key={p.group} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr] sm:gap-8">
                <p className="text-[15px] font-medium text-ink-3">{p.group}</p>
                <p className="text-lg text-ink">{p.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line py-14 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How a session works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <p className="font-mono text-sm text-accent">0{i + 1}</p>
                <p className="mt-2 text-lg font-medium">{t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <Link href="/login" className={btn.primary}>
              Create a free account <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-ink-3 sm:px-8">
          <span>The other person is an AI simulation, so treat its reactions as practice, not prediction.</span>
          <a href="https://ziyadhisham.com" className="hover:text-ink" target="_blank" rel="noreferrer">
            Built by Ziyad Hisham
          </a>
        </div>
      </footer>
    </div>
  );
}
