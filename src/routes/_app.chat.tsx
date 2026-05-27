import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat")({ component: ChatPage });

type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };
const KEY = "aria.chat.threads.v1";

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Thread[];
  } catch { return []; }
}
function saveThreads(t: Thread[]) {
  try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {}
}
function newThread(): Thread {
  return { id: crypto.randomUUID(), title: "New conversation", updatedAt: Date.now(), messages: [] };
}

function ChatPage() {
  const [threads, setThreads] = React.useState<Thread[]>(() => {
    const existing = loadThreads();
    if (existing.length) return existing;
    const t = newThread();
    saveThreads([t]);
    return [t];
  });
  const [activeId, setActiveId] = React.useState<string>(() => threads[0]?.id);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  function createThread() {
    const t = newThread();
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    setActiveId(t.id);
  }
  function deleteThread(id: string) {
    let next = threads.filter((t) => t.id !== id);
    if (next.length === 0) next = [newThread()];
    setThreads(next);
    saveThreads(next);
    if (id === activeId) setActiveId(next[0].id);
  }
  function persistMessages(id: string, msgs: UIMessage[]) {
    setThreads((prev) => {
      const next = prev.map((t) =>
        t.id === id
          ? {
              ...t,
              messages: msgs,
              updatedAt: Date.now(),
              title:
                t.title === "New conversation" && msgs[0]
                  ? extractText(msgs[0]).slice(0, 40) || t.title
                  : t.title,
            }
          : t,
      );
      saveThreads(next);
      return next;
    });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-64 border-r bg-sidebar/40 hidden md:flex flex-col">
        <div className="p-3 border-b">
          <Button onClick={createThread} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4 mr-1.5" /> New chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {threads
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((t) => (
                <div
                  key={t.id}
                  className={`group flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer transition-colors ${
                    t.id === activeId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                  }`}
                  onClick={() => setActiveId(t.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </ScrollArea>
      </aside>

      {active && (
        <ChatWindow
          key={active.id}
          threadId={active.id}
          initial={active.messages}
          onChange={(msgs) => persistMessages(active.id, msgs)}
        />
      )}
    </div>
  );
}

function extractText(m: UIMessage): string {
  if (!m.parts) return "";
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function ChatWindow({
  threadId,
  initial,
  onChange,
}: { threadId: string; initial: UIMessage[]; onChange: (m: UIMessage[]) => void }) {
  const transport = React.useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => {
      console.error(e);
      toast.error("Chat error. Please try again.");
    },
  });

  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    onChange(messages);
  }, [messages, onChange]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  React.useEffect(() => { taRef.current?.focus(); }, [threadId]);
  React.useEffect(() => { if (status === "ready") taRef.current?.focus(); }, [status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Ask anything about your work — drafting, planning, summarizing, or thinking through a problem.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-8 max-w-xl mx-auto">
                {[
                  "Help me prep talking points for a 1:1",
                  "Draft a status update for stakeholders",
                  "What questions should I ask in a discovery call?",
                  "Outline a proposal for a new initiative",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-left text-sm p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((m) => {
              const text = extractText(m);
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="prose-chat text-sm">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t bg-background/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="relative">
            <Textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message Aria…"
              className="min-h-[56px] max-h-[200px] resize-none pr-12 rounded-xl"
            />
            <Button
              size="icon"
              onClick={submit}
              disabled={busy || !input.trim()}
              className="absolute right-2 bottom-2 h-8 w-8 bg-gradient-primary text-primary-foreground"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
