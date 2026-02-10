export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Dashboard
          </a>
          <a href="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white">
              Chat
          </a>
          <a href="/documents" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Documents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 h-screen flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">Knowledge Chat</h1>
          <p className="text-sm text-gray-600">Ask questions about your company documents</p>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-lg">
              <p className="text-sm text-gray-900">Hello! I&apos;m your AI Knowledge Assistant. Ask me anything about your company documents.</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask a question about your documents..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
