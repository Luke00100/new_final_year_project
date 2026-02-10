export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white">
             Dashboard
          </a>
          <a href="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Chat
          </a>
          <a href="/documents" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
             Documents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Overview of query analytics and system performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Queries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1,284</p>
            <p className="text-sm text-green-600 mt-2">↑ 12% from last week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">1.2s</p>
            <p className="text-sm text-green-600 mt-2">↓ 0.3s improvement</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Documents Indexed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">47</p>
            <p className="text-sm text-gray-500 mt-2">Across 3 categories</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">89%</p>
            <p className="text-sm text-green-600 mt-2">↑ 5% from last week</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Query Volume Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Query Volume Over Time</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              Chart placeholder — will integrate with recharts
            </div>
          </div>

          {/* Category Breakdown Placeholder */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Queries by Category</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              Chart placeholder — pie/donut chart
            </div>
          </div>
        </div>

        {/* Recent Queries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Queries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Query</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Response Time</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">What is the return policy?</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Support</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">0.8s</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Resolved</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">How do I request annual leave?</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">HR</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">1.1s</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Resolved</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">Latest marketing campaign details</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Marketing</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">1.5s</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Partial</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
