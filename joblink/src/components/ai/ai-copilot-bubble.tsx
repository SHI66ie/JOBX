"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import {
  AiChat02Icon,
  Cancel01Icon,
  SendIcon,
  SparklesIcon,
  Copy01Icon,
  CheckIcon,
  Target02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionChatCoPilot } from "@/app/actions/ai";
import type { CoPilotMessage } from "@/lib/ai";

export type AICoPilotBubbleProps = {
  candidateName?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
  hasResume?: boolean;
};

const STORAGE_KEY = "jomp_copilot_history_v1";

export function AICoPilotBubble({
  candidateName,
  candidateTitle,
  candidateBio,
  candidateSkills,
  hasResume,
}: AICoPilotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useProfileContext, setUseProfileContext] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Build profile-tailored starter prompts
  const starterPrompts = useMemo(() => {
    const title = candidateTitle?.trim() || "my role";
    const skills = (candidateSkills || []).slice(0, 3).join(", ");
    return [
      `🎯 What high-paying remote niches best match my background in ${title}?`,
      skills
        ? `📄 What ATS resume keywords should I highlight for ${skills}?`
        : `📄 How do I optimize my CV to pass modern ATS filters?`,
      `💰 What is the competitive remote salary benchmark for a ${title}?`,
      `🎤 Give me 3 challenging interview questions for a remote ${title}.`,
    ];
  }, [candidateTitle, candidateSkills]);

  // Initial welcome message tailored to user
  const initialWelcome: CoPilotMessage = useMemo(() => {
    const greeting = candidateName ? `Hi ${candidateName.split(" ")[0]}!` : "Hi there!";
    const contextNote = candidateTitle
      ? `I'm automatically anchored to your profile as **${candidateTitle}**${
          candidateSkills?.length ? ` with expertise in **${candidateSkills.slice(0, 3).join(", ")}**` : ""
        }.`
      : "I'm your dedicated JOMP Career Co-Pilot.";

    return {
      role: "assistant",
      content: `${greeting} ${contextNote}\n\nAsk me anything about remote job matches, salary benchmarks, ATS keywords, or interview preparation — or pick a starter below.`,
    };
  }, [candidateName, candidateTitle, candidateSkills]);

  const [messages, setMessages] = useState<CoPilotMessage[]>([initialWelcome]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>(starterPrompts);

  // Restore previous session from sessionStorage if available
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist messages to sessionStorage
  useEffect(() => {
    try {
      if (messages.length > 1) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSend(textToSend?: string) {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    const newMessages: CoPilotMessage[] = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await actionChatCoPilot({
        messages: newMessages,
        candidateName,
        candidateTitle,
        candidateBio,
        candidateSkills,
        hasResume,
        ignoreProfile: !useProfileContext,
      });

      if (res.data) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: res.data.reply },
        ]);
        if (res.data.suggestedActions?.length) {
          setSuggestedActions(res.data.suggestedActions);
        }
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "I ran into an issue connecting to the career model. Please try again or rephrase your question.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleResetChat() {
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages([initialWelcome]);
    setSuggestedActions(starterPrompts);
  }

  function handleCopy(content: string, index: number) {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Career Co-Pilot"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 group"
        >
          <div className="relative flex items-center justify-center">
            <Icon icon={AiChat02Icon} size={26} className="text-white group-hover:text-brand transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-neutral-900"></span>
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[420px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-neutral-200/90 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-brand">
                  <Icon icon={SparklesIcon} size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[13.5px] font-semibold text-white leading-tight">
                      JOMP Career Co-Pilot
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-300">
                      AI Live
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {candidateTitle ? `Tuned for ${candidateTitle}` : "Remote Career Advisor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear conversation"
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon icon={RefreshIcon} size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon icon={Cancel01Icon} size={16} />
                </button>
              </div>
            </div>

            {/* Profile Context Bar */}
            <div className="mt-2.5 flex items-center justify-between border-t border-neutral-800/80 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Icon icon={Target02Icon} size={12} className={useProfileContext ? "text-emerald-400" : "text-neutral-500"} />
                <span className="truncate max-w-[210px]">
                  {useProfileContext
                    ? `${candidateTitle || "Profile"} · ${candidateSkills?.length || 0} skills`
                    : "Generic Mode"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUseProfileContext(!useProfileContext)}
                className={`font-medium transition ${
                  useProfileContext ? "text-emerald-400 hover:text-emerald-300" : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                {useProfileContext ? "Profile active ✓" : "Enable profile"}
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/60"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`group relative max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white rounded-br-xs shadow-xs"
                      : "bg-white text-neutral-800 border border-neutral-200/80 shadow-xs rounded-bl-xs"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <FormattedMarkdown text={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}

                  {/* Copy button on assistant messages */}
                  {m.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.content, idx)}
                      title="Copy response"
                      className="absolute -bottom-2.5 right-2 rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-500 shadow-2xs opacity-0 group-hover:opacity-100 transition hover:bg-neutral-50 hover:text-neutral-800 flex items-center gap-1"
                    >
                      <Icon icon={copiedIndex === idx ? CheckIcon : Copy01Icon} size={11} />
                      <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs bg-white px-4 py-3 text-neutral-500 border border-neutral-200/80 shadow-xs w-fit">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0.2s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand [animation-delay:0.4s]" />
                </div>
                <span className="text-[12px] text-neutral-400">Analyzing your profile &amp; market data...</span>
              </div>
            )}

            {/* Suggested Tasks / Action Chips */}
            {!loading && suggestedActions.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Suggested Questions For Your Profile:
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(action)}
                      className="group flex items-start justify-between text-left text-[12.5px] text-neutral-700 bg-white hover:bg-neutral-100/90 hover:text-neutral-900 border border-neutral-200/80 rounded-xl px-3 py-2 transition shadow-2xs hover:border-brand/40"
                    >
                      <span className="pr-2">{action}</span>
                      <span className="text-neutral-400 group-hover:text-brand text-[11px] transition">
                        ↵
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-neutral-200/80 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  candidateTitle
                    ? `Ask about ${candidateTitle}, CV, salary, or interviews...`
                    : "Ask Career Co-Pilot anything..."
                }
                disabled={loading}
                className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-brand focus:bg-white focus:outline-none transition shadow-2xs"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-30 hover:bg-neutral-800 transition shrink-0 shadow-xs"
              >
                <Icon icon={SendIcon} size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Lightweight, beautiful markdown renderer for chat bubbles.
 * Safely parses headers, bold, code pills, and bulleted/numbered lists.
 */
function FormattedMarkdown({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);

  return (
    <div className="space-y-2.5">
      {paragraphs.map((p, pIdx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Header 3 (###)
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={pIdx}
              className="text-[13.5px] font-bold text-neutral-900 mt-1 mb-0.5 border-b border-neutral-100 pb-1"
            >
              {renderInlineSpans(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        // Header 2 (##)
        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={pIdx}
              className="text-[14px] font-bold text-neutral-900 mt-1.5 mb-0.5"
            >
              {renderInlineSpans(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        // List block (lines starting with •, -, or \d+\.)
        const lines = trimmed.split("\n");
        const isList = lines.every((l) => /^\s*([•\-*]|\d+\.)\s+/.test(l));

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-0.5 my-1">
              {lines.map((line, lIdx) => {
                const match = line.match(/^\s*([•\-*]|\d+\.)\s+(.*)$/);
                const bullet = match?.[1] || "•";
                const content = match?.[2] || line;
                const isNumber = /^\d+\./.test(bullet);

                return (
                  <li key={lIdx} className="flex items-start gap-2 text-[12.8px]">
                    <span
                      className={`shrink-0 mt-0.5 ${
                        isNumber
                          ? "flex h-4 w-4 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand"
                          : "text-brand font-bold"
                      }`}
                    >
                      {bullet}
                    </span>
                    <span className="flex-1 text-neutral-800 leading-snug">
                      {renderInlineSpans(content)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard paragraph with soft breaks
        return (
          <p key={pIdx} className="text-[13px] leading-relaxed text-neutral-800">
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {renderInlineSpans(line)}
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses bold (**word**), code (`code`), and italics (*word*) into React spans
 */
function renderInlineSpans(text: string): ReactNode {
  // Regex to split on bold (**...**), code (`...`), and italic (*...*)
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-neutral-950">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-neutral-100 px-1 py-0.5 text-[11.5px] font-mono text-neutral-800 border border-neutral-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={i} className="italic text-neutral-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}
