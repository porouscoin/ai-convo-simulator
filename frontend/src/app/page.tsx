import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TopBar, NavLink, btn } from "@/components/ui";
import { cn } from "@/lib/utils";

const CHAT = [
  {
    who: "you",
    text: "I've hit every target for two years and took on the northern accounts in March. I'd like to discuss a 20% raise.",
  },
  {
    who: "them",
    text: "Twenty percent is a big number. What changed in your role that the budget should reflect?",
  },
  {
    who: "you",
    text: "I now cover two territories in the same hours. The second has brought in 18 million rupees since March.",
  },
];

const SKILLS: [string, number][] = [
  ["Clarity", 8],
  ["Persuasion", 7],
  ["Emotional control", 8],
  ["Adaptability", 6],
];

const SCENARIOS = [
  "Salary negotiation",
  "Job interview",
  "Promotion",
  "Sales call",
  "Angry customer",
  "Coworker conflict",
];

function ProductShot() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">Salary negotiation</p>
          <p className="truncate text-sm text-ink-3">INTJ manager · Hard</p>
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
          <p className="text-sm text-ink-3">Feedback</p>
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
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar>
        <NavLink href="/login">Sign in</NavLink>
        <Link href="/login" className={cn(btn.primary, btn.small, "ml-1")}>
          Get started
        </Link>
      </TopBar>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-16 text-center sm:px-8 sm:pt-24">
          <h1 className="mx-auto max-w-4xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Practice hard conversations before they happen.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-ink-2 sm:text-xl">
            An AI plays the other person. You get scored feedback when you&apos;re done.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/login" className={btn.primary}>
              Start practicing <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 sm:px-8">
          <ProductShot />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 md:py-20">
          <p className="text-sm text-ink-3">Scenarios</p>
          <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
            {SCENARIOS.map((s) => (
              <li key={s} className="rounded-md border border-line px-3.5 py-1.5 text-[15px] text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl justify-between px-5 py-6 text-sm text-ink-3 sm:px-8">
          <span>ConvoSim</span>
          <a href="https://ziyadhisham.com" className="hover:text-ink" target="_blank" rel="noreferrer">
            Built by Ziyad Hisham
          </a>
        </div>
      </footer>
    </div>
  );
}
