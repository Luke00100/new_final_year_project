"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Static placeholder data - will be replaced with real data later
const categoryData = [
  { name: "Support", queries: 482, fill: "#6366f1" },
  { name: "HR", queries: 318, fill: "#8b5cf6" },
  { name: "Marketing", queries: 215, fill: "#f59e0b" },
  { name: "IT", queries: 168, fill: "#10b981" },
  { name: "Finance", queries: 101, fill: "#ef4444" },
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

const weeklyTrendData = [
  { day: "Mon", Support: 28, HR: 18, Marketing: 12, IT: 10, Finance: 5 },
  { day: "Tue", Support: 35, HR: 22, Marketing: 15, IT: 8, Finance: 7 },
  { day: "Wed", Support: 30, HR: 25, Marketing: 18, IT: 12, Finance: 6 },
  { day: "Thu", Support: 42, HR: 20, Marketing: 10, IT: 14, Finance: 9 },
  { day: "Fri", Support: 38, HR: 28, Marketing: 20, IT: 11, Finance: 8 },
  { day: "Sat", Support: 15, HR: 8, Marketing: 6, IT: 4, Finance: 2 },
  { day: "Sun", Support: 10, HR: 5, Marketing: 4, IT: 3, Finance: 1 },
];

const recentQueries = [
  {
    id: 1,
    query: "What is the return policy for online orders?",
    category: "Support",
    responseTime: "0.8s",
    status: "Resolved",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    query: "How do I request annual leave?",
    category: "HR",
    responseTime: "1.1s",
    status: "Resolved",
    timestamp: "5 min ago",
  },
  {
    id: 3,
    query: "What are the brand guidelines for social media?",
    category: "Marketing",
    responseTime: "1.5s",
    status: "Partial",
    timestamp: "8 min ago",
  },
  {
    id: 4,
    query: "How do I reset my company email password?",
    category: "IT",
    responseTime: "0.6s",
    status: "Resolved",
    timestamp: "12 min ago",
  },
  {
    id: 5,
    query: "What is the maternity leave policy?",
    category: "HR",
    responseTime: "0.9s",
    status: "Resolved",
    timestamp: "15 min ago",
  },
  {
    id: 6,
    query: "Can I get a refund after 30 days?",
    category: "Support",
    responseTime: "1.3s",
    status: "Escalated",
    timestamp: "18 min ago",
  },
  {
    id: 7,
    query: "Q3 campaign budget breakdown",
    category: "Finance",
    responseTime: "2.1s",
    status: "Resolved",
    timestamp: "22 min ago",
  },
  {
    id: 8,
    query: "How to install the VPN client?",
    category: "IT",
    responseTime: "0.7s",
    status: "Resolved",
    timestamp: "25 min ago",
  },
];

const categoryColors: Record<string, string> = {
  Support: "bg-blue-100 text-blue-700",
  HR: "bg-purple-100 text-purple-700",
  Marketing: "bg-orange-100 text-orange-700",
  IT: "bg-emerald-100 text-emerald-700",
  Finance: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  Resolved: "bg-green-100 text-green-700",
  Partial: "bg-yellow-100 text-yellow-700",
  Escalated: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const totalQueries = categoryData.reduce((sum, c) => sum + c.queries, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 z-10">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white"
          >
            <span>📊</span> Dashboard
          </a>
          <a
            href="/chat"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
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
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of query analytics and system performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Queries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalQueries.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Documents Indexed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">47</p>
            <p className="text-sm text-gray-500 mt-2">Across 5 categories</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">89%</p>
            <p className="text-sm text-green-600 mt-2">↑ 5% from last week</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Queries by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Queries by Classification
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 13 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="queries" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Classification Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="queries"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={true}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Weekly Query Trend by Classification
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Support" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="HR" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Marketing" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="IT" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Finance" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
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
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Query
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Classification
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Response Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {q.query}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${categoryColors[q.category]}`}
                      >
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {q.responseTime}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${statusColors[q.status]}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {q.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}