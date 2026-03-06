"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Source {
  content: string;
  filename: string;
  distance: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  category?: string;
  responseTime?: number;
}

const categoryColors: Record<string, string> = {
  Support: "bg-blue-100 text-blue-700 border-blue-200",
  HR: "bg-purple-100 text-purple-700 border-purple-200",
  Marketing: "bg-orange-100 text-orange-700 border-orange-200",
  IT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Finance: "bg-red-100 text-red-700 border-red-200",
};

const STORAGE_KEY = "chat_messages";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    // Default welcome message
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI Knowledge Assistant. Ask me anything about your company documents.",
      },
    ]);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI Knowledge Assistant. Ask me anything about your company documents.",
      },
    ]);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources ?? [],
          category: data.category,
          responseTime: data.response_time_ms,
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Deduplicate sources by filename
  function uniqueSources(sources: Source[]): Source[] {
    const seen = new Set<string>();
    return sources.filter((s) => {
      if (seen.has(s.filename)) return false;
      seen.add(s.filename);
      return true;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>📊</span> Dashboard
          </a>
          <a
            href="/chat"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white"
          >
            <span>💬</span> Chat
          </a>
          <a
            href="/documents"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>📄</span> Documents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Knowledge Chat</h1>
            <p className="text-sm text-gray-600">
              Ask questions about your company documents
            </p>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-xl p-4 shadow-sm max-w-lg ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-100 text-gray-900"
                }`}
              >
                {/* Category tag for assistant messages */}
                {msg.role === "assistant" && msg.category && (
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full border ${
                        categoryColors[msg.category] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {msg.category}
                    </span>
                    {msg.responseTime && (
                      <span className="text-xs text-gray-400">
                        {(msg.responseTime / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {/* Source pills - only show if there are actually sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 w-full mb-1">
                      Sources:
                    </span>
                    {uniqueSources(msg.sources).map((src, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                        title={`Relevance: ${((1 - src.distance) * 100).toFixed(0)}%`}
                      >
                        📄 {src.filename}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm text-gray-900"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
