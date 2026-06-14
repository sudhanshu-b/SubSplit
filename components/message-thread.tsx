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
  otherUserName: string;
};

// ── Emoji picker data ─────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🥴","😵","🤯","🥳","🤠","😎","🥸","🤓","🧐"] },
  { label: "Gestures", emojis: ["👍","👎","👌","🤌","✌️","🤞","🤙","🤘","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🙏","💪","🦾","🖐️","✋","🤚","👋","🤟","🤙","👈","👉","👆","👇","☝️","✍️","🫰","🫵"] },
  { label: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","❤️‍🔥","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","🫀","💌"] },
  { label: "People", emojis: ["🧑","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🧖","🧗","🤸","🤾","🏌️","🏇","🧘"] },
  { label: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🐊","🐙","🦑","🦐","🦞","🦀","🐡","🐟","🐬","🐳","🐋","🦈","🦭"] },
  { label: "Food", emojis: ["🍕","🍔","🌮","🌯","🥙","🧆","🥚","🍳","🥘","🍲","🫕","🥣","🥗","🍿","🧂","🥫","🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍼","🥤","🧋","☕","🍵","🍺","🍻","🥂","🍷"] },
  { label: "Travel", emojis: ["🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍","🛵","🚲","🛴","🛺","🚁","🛸","🚀","✈️","🛩","🪂","⛵","🚢","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞","🚋","🚍","🚘","🚖"] },
  { label: "Objects", emojis: ["💻","🖥","🖨","⌨️","🖱","📱","📲","☎️","📞","📟","📠","📺","📷","📸","📹","🎥","📽","🎞","📡","🔋","🪫","🔌","💡","🔦","🕯","🪔","🧯","💾","💿","📀","🧮","🎮","🕹","🎲","🎨","🖼","🎭","🎪","🎤","🎧","🎷","🎸","🎹","🎺","🎻","🥁","🪘","📻","🎙","📢","📣","🔔","🔕","📯"] },
  { label: "Symbols", emojis: ["✅","❌","⭕","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔲","🔳","▪️","▫️","◾","◽","◼️","◻️","⬛","⬜","🟥","🟧","🟨","🟩","🟦","🟪","⁉️","‼️","❓","❗","💯","🔞","🔝","🆗","🆙","🆒","🆕","🆓","🅰️","🅱️","🆎","🅾️"] },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

// ── CopyIcon ──────────────────────────────────────────────────────────────────
function CopyIcon({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copy"
      className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      )}
    </button>
  );
}

// ── EmojiPicker ───────────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Category tabs */}
      <div className="flex gap-0.5 px-2 pt-2 pb-1 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(i)}
            title={cat.label}
            className={`shrink-0 text-base px-1.5 py-1 rounded-lg transition-colors ${
              activeCategory === i
                ? "bg-zinc-100 dark:bg-zinc-800"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            }`}
          >
            {cat.emojis[0]}
          </button>
        ))}
      </div>

      {/* Label */}
      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {EMOJI_CATEGORIES[activeCategory].label}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-0.5 px-2 pb-2 max-h-44 overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors leading-none"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MessageThread ─────────────────────────────────────────────────────────────
export default function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherUserName,
}: Props) {
  const [messages, setMessages]     = useState<Message[]>(initialMessages);
  const [input, setInput]           = useState("");
  const [sending, setSending]       = useState(false);
  const [showEmoji, setShowEmoji]   = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);
  const messagesRef                 = useRef(messages);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const poll = async () => {
      const current = messagesRef.current;
      const last    = current[current.length - 1];
      const after   = last ? new Date(last.createdAt).toISOString() : "";
      const res = await fetch(
        `/api/messages/${conversationId}${after ? `?after=${encodeURIComponent(after)}` : ""}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const { messages: fresh } = await res.json() as { messages: Message[] };
      if (!fresh.length) return;
      setMessages((prev) => {
        const ids    = new Set(prev.map((m) => m.id));
        const truly  = fresh.filter((m) => !ids.has(m.id));
        return truly.length ? [...prev, ...truly] : prev;
      });
    };
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [conversationId]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    if (!el) { setInput((p) => p + emoji); return; }
    const start = el.selectionStart ?? input.length;
    const end   = el.selectionEnd   ?? input.length;
    const next  = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    // Restore cursor after emoji
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function handleSend(e?: { preventDefault(): void }) {
    e?.preventDefault();
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
      setInput(body);
    }
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Build display groups
  type DateGroup = { type: "date";  key: string; label: string };
  type MsgGroup  = { type: "group"; key: string; isMine: boolean; senderName: string; messages: (Message & { isMine: boolean })[] };
  const displayGroups: (DateGroup | MsgGroup)[] = [];
  let lastDateLabel = "";
  let currentGroup: MsgGroup | null = null;

  for (const msg of messages) {
    const isMine    = msg.senderId === currentUserId;
    const dateLabel = formatDate(msg.createdAt);
    if (dateLabel !== lastDateLabel) {
      displayGroups.push({ type: "date", key: `date-${msg.id}`, label: dateLabel });
      lastDateLabel = dateLabel;
      currentGroup  = null;
    }
    if (currentGroup && currentGroup.messages[0].senderId === msg.senderId) {
      currentGroup.messages.push({ ...msg, isMine });
    } else {
      currentGroup = { type: "group", key: `group-${msg.id}`, isMine, senderName: msg.senderName, messages: [{ ...msg, isMine }] };
      displayGroups.push(currentGroup);
    }
  }

  const otherInitial = otherUserName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {displayGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No messages yet</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Send a message to start the conversation</p>
          </div>
        )}

        {displayGroups.map((group) => {
          if (group.type === "date") {
            return (
              <div key={group.key} className="flex items-center gap-3 px-2">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 shrink-0">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              </div>
            );
          }

          const lastMsg = group.messages[group.messages.length - 1];
          return (
            <div key={group.key} className={`flex gap-2.5 ${group.isMine ? "flex-row-reverse" : "flex-row"}`}>
              {!group.isMine && (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 shrink-0 self-end mb-5">
                  {otherInitial}
                </div>
              )}

              <div className={`flex flex-col gap-1 max-w-[72%] ${group.isMine ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-2 px-0.5 ${group.isMine ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {group.isMine ? "Me" : group.senderName}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {timeAgo(lastMsg.createdAt)}
                  </span>
                </div>

                {group.messages.map((msg, i) => {
                  const isFirst = i === 0;
                  const isLast  = i === group.messages.length - 1;
                  return (
                    <div
                      key={msg.id}
                      className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                        group.isMine
                          ? `bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 ${
                              isFirst && isLast ? "rounded-2xl rounded-tr-md" :
                              isFirst           ? "rounded-2xl rounded-tr-md rounded-br-md" :
                              isLast            ? "rounded-2xl rounded-br-md" :
                                                  "rounded-xl rounded-r-md"
                            }`
                          : `bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 shadow-sm ${
                              isFirst && isLast ? "rounded-2xl rounded-tl-md" :
                              isFirst           ? "rounded-2xl rounded-tl-md rounded-bl-md" :
                              isLast            ? "rounded-2xl rounded-bl-md" :
                                                  "rounded-xl rounded-l-md"
                            }`
                      }`}
                    >
                      {msg.body}
                    </div>
                  );
                })}

                {!group.isMine && (
                  <div className="flex items-center gap-0.5 px-0.5 mt-0.5">
                    <CopyIcon text={group.messages.map(m => m.body).join("\n")} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <div className="relative flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-3 py-2">

          {/* Emoji button */}
          <div className="relative shrink-0 self-end mb-0.5">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              title="Emoji"
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 ${
                showEmoji ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {/* Smiley face SVG — monochrome */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14s1 1.5 3.5 1.5 3.5-1.5 3.5-1.5" />
                <circle cx="9" cy="10" r="0.5" fill="currentColor" stroke="none" />
                <circle cx="15" cy="10" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </button>

            {showEmoji && (
              <EmojiPicker
                onSelect={(emoji) => { insertEmoji(emoji); setShowEmoji(false); }}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={sending}
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none disabled:opacity-60 leading-relaxed"
          />

          {/* Send button */}
          <div className="shrink-0 self-end mb-0.5">
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-3.5 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              {sending ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              )}
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
