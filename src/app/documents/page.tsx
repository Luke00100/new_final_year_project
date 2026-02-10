export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <span>📊</span> Dashboard
          </a>
          <a href="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <span>💬</span> Chat
          </a>
          <a href="/documents" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white">
            <span>📄</span> Documents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Upload and manage your knowledge base documents</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
            + Upload Document
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center mb-8 hover:border-indigo-400 transition-colors cursor-pointer">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-700 font-medium">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mt-1">Supports PDF, DOCX, and TXT files</p>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Uploaded Documents</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-gray-900">Employee Handbook 2025.pdf</p>
                  <p className="text-sm text-gray-500">Uploaded 2 days ago • 24 chunks</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Indexed</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-gray-900">Return Policy.docx</p>
                  <p className="text-sm text-gray-500">Uploaded 5 days ago • 8 chunks</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Indexed</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-medium text-gray-900">Marketing Guidelines.txt</p>
                  <p className="text-sm text-gray-500">Uploaded 1 week ago • 12 chunks</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Indexed</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
