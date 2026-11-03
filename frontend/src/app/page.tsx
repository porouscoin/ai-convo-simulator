import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopBar, NavLink, btn } from "@/components/ui";
import { cn } from "@/lib/utils";

const CHAT = [
  {
    who: "you",
    text: "I've closed every quarterly target for two years, and I took on the northern accounts in March. I'd like to talk about a 20% raise.",
  },
  {
    who: "them",
    text: "Targets are the job. Twenty percent is a big number. What changed in your role that the budget should reflect?",
  },
  {
    who: "you",
    text: "I now cover two territories in the same hours. The second one has brought in 18 million rupees since March.",
  },
  {
    who: "them",
    text: "That's a fair point. Who else on the team could have handled those accounts?",
  },
];

const SKILLS: [string, number][] = [
  ["Clarity", 8],
  ["Persuasion", 7],
  ["Emotional control", 8],
  ["Adaptability", 6],
];

const FACTS = [
  ["16", "personality types to practice against"],
  ["3", "difficulty levels, from friendly to tough"],
  ["2", "languages: English and Roman Urdu"],
  ["4", "skills scored after every session"],
];

const PRACTICE = [
  { group: "Career", items: ["Salary negotiation", "Job interview", "Asking for a promotion"] },
  { group: "Sales", items: ["Pitching a sceptical client", "Calming an angry customer"] },
  { group: "Conflict", items: ["A coworker who misses deadlines and blames others"] },
];

const STEPS = [
  ["Pick a situation", "Start from a scenario, then add your own context and goal."],
  ["Choose who you face", "Pick their personality, how tough they are and the language."],
  ["Talk it through", "The AI stays in character and pushes back on weak points."],
  ["Read your feedback", "Get a score, what worked, and better lines to use next time."],
];

function ProductShot() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">Salary negotiation</p>
          <p className="truncate text-sm text-ink-3">Talking to an INTJ manager · Hard · English</p>
        </div>
        <span className="hidden shrink-0 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink-2 sm:inline">
          End and get feedback
        </span>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5 px-5 py-6 sm:px-6">
          {CHAT.map((m, i) =>
            m.who === "you" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[88%] rounded-xl rounded-br-sm bg-raised px-4 py-3 text-[15px] leading-relaxed">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-11 shrink-0 items-center justify-center rounded-md border border-line-strong font-mono text-[11px] text-ink-2">
                  INTJ
                </span>
                <p className="max-w-[88%] text-[15px] leading-relaxed text-ink-2">{m.text}</p>
              </div>
            ),
          )}
        </div>
        <div className="border-t border-line bg-bg/40 px-5 py-6 sm:px-6 md:border-l md:border-t-0">
          <p className="text-sm text-ink-3">After the session</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">
            7.5<span className="text-lg font-normal text-ink-3"> / 10</span>
          </p>
          <div className="mt-6 space-y-4">
            {SKILLS.map(([name, v]) => (
              <div key={name}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-2">{name}</span>
                  <span className="tabular-nums">{v}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-raised">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${v * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm text-ink-3">Try instead</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">
              &ldquo;Nobody else knew those clients. I kept all six through the handover.&rdquo;
            </p>
          </div>
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
        <Link href="/login" className={cn(btn.primary, btn.small, "ml-1")}>
          Get started
        </Link>
      </TopBar>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            AI conversation simulator
          </p>
          <h1 className="mx-auto mt-7 max-w-4xl text-[2.5rem] font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            Practice the hard conversation before it&nbsp;happens.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            An AI plays your manager, client or coworker, with the personality you choose,
            and pushes back like they would. Then it tells you what worked and what to say instead.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/login" className={btn.primary}>
              Start practicing free <ArrowRight size={17} />
            </Link>
            <Link href="/login" className={btn.secondary}>
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 sm:px-8">
          <ProductShot />
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {FACTS.map(([n, t]) => (
              <div key={t} className="border-l border-line-strong pl-5">
                <dt className="text-4xl font-semibold tracking-tight sm:text-5xl">{n}</dt>
                <dd className="mt-2 text-[15px] leading-snug text-ink-2">{t}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What you can practice</h2>
              <p className="mt-3 text-[17px] text-ink-2">Every scenario lets you change the context and the goal.</p>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {PRACTICE.map((p) => (
                <div key={p.group} className="grid gap-1.5 py-6 sm:grid-cols-[140px_1fr] sm:gap-6">
                  <p className="text-[15px] text-ink-3">{p.group}</p>
                  <p className="text-lg leading-relaxed">{p.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How a session works</h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, d], i) => (
                <li key={t}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong font-mono text-sm text-accent">
                    {i + 1}
                  </span>
                  <p className="mt-5 text-lg font-medium">{t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 md:pb-28">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line-strong bg-surface px-7 py-10 sm:px-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your next hard conversation is coming.</h2>
              <p className="mt-2 text-[17px] text-ink-2">Rehearse it first. It&apos;s free and takes a minute to start.</p>
            </div>
            <Link href="/login" className={btn.primary}>
              Start practicing <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-7 text-sm text-ink-3 sm:px-8">
          <span>The other person is an AI simulation. Treat its reactions as practice, not prediction.</span>
          <a href="https://ziyadhisham.com" className="hover:text-ink" target="_blank" rel="noreferrer">
            Built by Ziyad Hisham
          </a>
        </div>
      </footer>
    </div>
  );
}
