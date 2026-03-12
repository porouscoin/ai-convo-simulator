"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchSession, streamChatFetch, updateSession, generateFeedback } from "@/lib/api";
import type { Message, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const selectedLanguage = searchParams.get("lang") === "roman_urdu" ? "roman_urdu" : "english";

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
          content: "⚠️ Connection error. Make sure the backend is running.",
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

    router.push(`/feedback/${sessionId}?lang=${selectedLanguage}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  }

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Session not found.</div>
      </div>
    );
  }

  const scenarioTitle =
    (session as Session & { scenarios?: { title: string } }).scenarios?.title ?? "Conversation";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-white text-sm">{scenarioTitle}</h1>
            <p className="text-xs text-gray-500">
              {session.personality_type} · {session.difficulty} difficulty · {selectedLanguage === "roman_urdu" ? "Roman Urdu" : "English"}
            </p>
          </div>
        </div>
        <button
          onClick={endSession}
          disabled={ending || messages.length < 2}
          className="text-sm px-4 py-2 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors"
        >
          {ending ? "Ending..." : "End & Get Feedback"}
        </button>
      </header>

      {/* Context banner */}
      <div className="bg-gray-900/50 border-b border-gray-800/50 px-6 py-2">
        <p className="text-xs text-gray-500 max-w-3xl mx-auto">
          <span className="text-gray-400 font-medium">Your goal:</span> {session.user_goal}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && !streaming && (
          <div className="text-center text-gray-500 py-16">
            <p className="text-sm">The AI persona is ready. Send your first message to begin.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-100"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming AI response */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-gray-800 text-gray-100">
              {streamingContent}
              <span className="inline-block w-1.5 h-3.5 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {streaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-4 flex-shrink-0">
        <form
          onSubmit={sendMessage}
          className="max-w-3xl mx-auto flex items-end gap-3"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming || session.status !== "active"}
            placeholder={
              session.status !== "active"
                ? "Session has ended."
                : "Type your message... (Enter to send, Shift+Enter for newline)"
            }
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming || session.status !== "active"}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
