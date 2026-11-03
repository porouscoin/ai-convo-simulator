"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, streamChatFetch, updateSession, generateFeedback } from "@/lib/api";
import type { Message, Session } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { CenterNote, Spinner, btn, DIFFICULTY_LABEL, LANGUAGE_LABEL } from "@/components/ui";

function Them({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-8 w-12 shrink-0 items-center justify-center rounded-md border border-line-strong font-mono text-[11px] font-medium text-ink-2">
        {code}
      </span>
      <div className="min-w-0 max-w-[85%] whitespace-pre-wrap pt-0.5 text-[16px] leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [ending, setEnding] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedLanguage = session?.language ?? "english";

  useEffect(() => {
    params.then(({ id }) => {
      setSessionId(id);
      fetchSession(id)
        .then((res) => res.json())
        .then((data: Session) => {
          setSession(data);
          setMessages((data.messages as Message[]) ?? []);
          setLoadingSession(false);
        })
        .catch(() => setLoadingSession(false));
    });
  }, [params]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming || !session) return;

    const userMessage = input.trim();
    setInput("");
    setStreaming(true);
    setStreamingContent("");

    const updatedHistory = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedHistory);

    try {
      const res = await streamChatFetch({
        session_id: sessionId,
        message: userMessage,
        conversation_history: messages,
        scenario_title: (session as Session & { scenarios?: { title: string } }).scenarios?.title ?? "Conversation",
        personality_type: session.personality_type,
        difficulty: session.difficulty,
        context: session.context,
        user_goal: session.user_goal,
        language: selectedLanguage,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullResponse += data.chunk;
              setStreamingContent(fullResponse);
            }
            if (data.done) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.full_response },
              ]);
              setStreamingContent("");
            }
          } catch {
            // partial JSON line — skip
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection lost before a reply came back. Send your message again in a moment.",
        },
      ]);
      setStreamingContent("");
    }

    setStreaming(false);
    textareaRef.current?.focus();
  }

  async function endSession() {
    if (!session || ending) return;
    setEnding(true);

    await updateSession(sessionId, "completed");

    // Kick off feedback generation in the background so it's ready when user lands on feedback page
    generateFeedback({
      session_id: sessionId,
      conversation_history: messages,
      scenario_title:
        (session as Session & { scenarios?: { title: string } }).scenarios?.title ?? "Conversation",
      personality_type: session.personality_type,
      user_goal: session.user_goal,
      language: selectedLanguage,
    });

    router.push(`/feedback/${sessionId}?lang=${session?.language ?? "english"}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  }

  if (loadingSession) {
    return (
      <CenterNote>
        <Spinner />
        <p>Loading session...</p>
      </CenterNote>
    );
  }

  if (!session) {
    return (
      <CenterNote>
        <p className="text-bad">This session couldn&apos;t be found.</p>
        <Link href="/dashboard" className={btn.secondary}>
          Back to dashboard
        </Link>
      </CenterNote>
    );
  }

  const scenarioTitle =
    (session as Session & { scenarios?: { title: string } }).scenarios?.title ?? "Conversation";
  const ended = session.status !== "active";
  const canEnd = !ending && messages.length >= 2;

  return (
    <div className="flex h-dvh flex-col">
      <header className="shrink-0 border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:bg-raised hover:text-ink"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-medium leading-tight">{scenarioTitle}</h1>
              <p className="truncate text-sm text-ink-3">
                {session.personality_type} · {DIFFICULTY_LABEL[session.difficulty] ?? session.difficulty} ·{" "}
                {LANGUAGE_LABEL[selectedLanguage]}
              </p>
            </div>
          </div>
          <button
            onClick={endSession}
            disabled={!canEnd}
            title={messages.length < 2 ? "Have at least one exchange first" : undefined}
            className={cn(btn.secondary, btn.small, "shrink-0")}
          >
            {ending ? "Ending..." : (
              <>
                <span className="hidden sm:inline">End and get feedback</span>
                <span className="sm:hidden">End</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="shrink-0 border-b border-line bg-surface">
        <p className="mx-auto max-w-3xl px-4 py-2.5 text-sm text-ink-2 sm:px-6">
          <span className="text-ink-3">Your goal: </span>
          {session.user_goal}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
          {messages.length === 0 && !streaming && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">You start.</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[15px] text-ink-2">
                The {session.personality_type} on the other side is ready. Open the conversation the way
                you would in real life.
              </p>
            </div>
          )}

          {messages.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-raised px-4 py-3 text-[16px] leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <Them key={i} code={session.personality_type}>{msg.content}</Them>
            ),
          )}

          {streamingContent && (
            <Them code={session.personality_type}>
              {streamingContent}
              <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-ink-3" />
            </Them>
          )}

          {streaming && !streamingContent && (
            <Them code={session.personality_type}>
              <span className="flex h-6 items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3 [animation-delay:300ms]" />
              </span>
            </Them>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-line bg-bg px-4 pb-4 pt-3 sm:px-6">
        <form
          onSubmit={sendMessage}
          className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-line bg-surface p-2 transition-colors focus-within:border-line-strong"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming || ended}
            placeholder={ended ? "This session has ended." : "Type your reply"}
            rows={1}
            aria-label="Your message"
            className="max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2 text-[16px] text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-60"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim() || streaming || ended}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-bg transition-colors hover:bg-white disabled:opacity-30"
          >
            <ArrowUp size={18} />
          </button>
        </form>
        <p className="mx-auto mt-2 hidden max-w-3xl px-1 text-xs text-ink-3 sm:block">
          Enter to send, Shift + Enter for a new line.
        </p>
      </div>
    </div>
  );
}
