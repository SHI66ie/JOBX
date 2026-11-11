"use client";

import { useState, useRef, useEffect } from "react";
import {
  AiChat02Icon,
  Cancel01Icon,
  SendIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionChatCoPilot } from "@/app/actions/ai";
import type { CoPilotMessage } from "@/lib/ai";

export type AICoPilotBubbleProps = {
  candidateTitle?: string;
  candidateSkills?: string[];
};

const STARTER_PROMPTS = [
  "🎯 How do I optimize my profile for remote jobs?",
  "📄 What makes a CV pass modern ATS filters?",
  "💰 How should I negotiate my remote salary?",
  "🎤 Top tips for async remote interviews",
];

export function AICoPilotBubble({
  candidateTitle,
  candidateSkills,
}: AICoPilotBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CoPilotMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your **JOMP Career Co-Pilot**. Ask me anything about remote jobs, interview preparation, CV optimization, or salary negotiation.",
    },
  ]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>(STARTER_PROMPTS);

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
        candidateTitle,
        candidateSkills,
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
              "I encountered an issue processing that. Please try rephrasing your question!",
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

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Career Co-Pilot"
          className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xl hover:scale-105 transition-all duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        >
          <div className="relative flex items-center justify-center">
            <Icon icon={AiChat02Icon} size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-brand">
                <Icon icon={SparklesIcon} size={16} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-semibold text-white leading-tight">
                  JOMP Career Co-Pilot
                </h3>
                <span className="text-[11px] text-neutral-300">
                  Remote Career Advisor
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white transition"
              title="Close chat"
            >
              <Icon icon={Cancel01Icon} size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/50"
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white rounded-br-xs"
                      : "bg-white text-neutral-800 border border-neutral-200/70 shadow-2xs rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs bg-white px-3.5 py-2.5 text-neutral-400 border border-neutral-200/70 shadow-2xs w-fit">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0.4s]" />
              </div>
            )}

            {/* Quick Action Chips */}
            {!loading && suggestedActions.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
                  Suggested topics:
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(action)}
                      className="text-left text-[12px] text-neutral-700 bg-white hover:bg-neutral-100 hover:text-neutral-900 border border-neutral-200/80 rounded-lg px-2.5 py-1.5 transition shadow-2xs"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-neutral-100 bg-white p-2.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about jobs, CV, salary..."
                disabled={loading}
                className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-[13px] text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-30 hover:bg-neutral-800 transition shrink-0"
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
