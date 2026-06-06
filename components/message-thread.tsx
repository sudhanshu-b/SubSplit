"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  createdAt: Date | string;
  readAt: Date | string | null;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
};

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}


export default function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep a ref in sync with the latest messages so the polling interval
  // can read the current value without being recreated on every state update.
  // Without this, messages is captured in a stale closure — the old interval
  // fires one last time before teardown and re-fetches the same timestamp,
  // duplicating messages that were just received.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Scroll to bottom whenever messages update.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds.
  // Depends only on conversationId — never recreated when messages change.
  useEffect(() => {
    const poll = async () => {
      const current = messagesRef.current;
      const last = current[current.length - 1];
      const after = last ? new Date(last.createdAt).toISOString() : "";

      const res = await fetch(
        `/api/messages/${conversationId}${after ? `?after=${encodeURIComponent(after)}` : ""}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;

      const { messages: fresh } = await res.json() as { messages: Message[] };
      if (fresh.length === 0) return;

      setMessages((prev) => {
        // Deduplicate by ID — safety net in case of any remaining overlap.
        const existingIds = new Set(prev.map((m) => m.id));
        const truly = fresh.filter((m) => !existingIds.has(m.id));
        return truly.length > 0 ? [...prev, ...truly] : prev;
      });
    };

    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [conversationId]); // ← no `messages` here — that was the bug

  async function handleSend(e: { preventDefault(): void }) {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;

    setSending(true);
    setInput("");

    const res = await fetch(`/api/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSending(false);

    if (res.ok) {
      const { message: sent } = await res.json() as { message: Message };
      setMessages((prev) => [...prev, sent]);
    } else {
      setInput(body); // restore on failure
    }

    inputRef.current?.focus();
  }

  const groups = messages.map((m) => ({ ...m, isMine: m.senderId === currentUserId }));

  // Build grouped display
  const displayGroups: Array<
    | { type: "date"; key: string; label: string }
    | { type: "group"; key: string; isMine: boolean; senderName: string; messages: (Message & { isMine: boolean })[] }
  > = [];

  let lastDateLabel = "";
  let currentGroup: (typeof displayGroups[number] & { type: "group" }) | null = null;

  for (const msg of groups) {
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== lastDateLabel) {
      displayGroups.push({ type: "date", key: `date-${msg.id}`, label: dateLabel });
      lastDateLabel = dateLabel;
      currentGroup = null;
    }
    if (currentGroup && currentGroup.messages[0].senderId === msg.senderId) {
      currentGroup.messages.push(msg);
    } else {
      currentGroup = {
        type: "group",
        key: `group-${msg.id}`,
        isMine: msg.isMine,
        senderName: msg.senderName,
        messages: [msg],
      };
      displayGroups.push(currentGroup);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {displayGroups.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No messages yet.</p>
            <p className="text-gray-300 text-xs mt-1">Say hello to get started!</p>
          </div>
        )}

        {displayGroups.map((group) => {
          if (group.type === "date") {
            return (
              <div key={group.key} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 shrink-0">{group.label}</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>
            );
          }

          return (
            <div
              key={group.key}
              className={`flex flex-col gap-1 ${group.isMine ? "items-end" : "items-start"}`}
            >
              {/* Sender name — shown once per group, only for the other person */}
              {!group.isMine && (
                <span className="text-xs text-gray-400 px-1">{group.senderName}</span>
              )}

              {group.messages.map((msg, i) => (
                <div key={msg.id} className={`flex items-end gap-1.5 ${group.isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      group.isMine
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.body}
                  </div>
                  {/* Timestamp — only on the last message in a group */}
                  {i === group.messages.length - 1 && (
                    <span className="text-xs text-gray-400 mb-0.5 shrink-0">
                      {formatTime(msg.createdAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
