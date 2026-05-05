"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// Types
interface CategoryData {
  name: string;
  queries: number;
  fill: string;
}

interface DailyTrend {
  day: string;
  Support: number;
  HR: number;
  Marketing: number;
  IT: number;
  Finance: number;
}

interface RecentQuery {
  id: number;
  query: string;
  category: string;
  responseTime: string;
  status: string;
  timestamp: string;
}

interface DashboardStats {
  totalQueries: number;
  documentsIndexed: number;
  resolutionRate: number;
  avgResponseTime: number;
}

interface DashboardData {
  stats: DashboardStats;
  categoryData: CategoryData[];
  weeklyTrend: DailyTrend[];
  recentQueries: RecentQuery[];
}

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

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

// Placeholder data for when there's no real data yet
const placeholderCategoryData: CategoryData[] = [
  { name: "Support", queries: 0, fill: "#6366f1" },
  { name: "HR", queries: 0, fill: "#8b5cf6" },
  { name: "Marketing", queries: 0, fill: "#f59e0b" },
  { name: "IT", queries: 0, fill: "#10b981" },
  { name: "Finance", queries: 0, fill: "#ef4444" },
];

const placeholderWeeklyTrend: DailyTrend[] = [
  { day: "Mon", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Tue", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Wed", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Thu", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Fri", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Sat", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
  { day: "Sun", Support: 0, HR: 0, Marketing: 0, IT: 0, Finance: 0 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/analytics/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const dashboardData: DashboardData = await res.json();
      setData(dashboardData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  // Use real data or placeholders
  const categoryData = data?.categoryData ?? placeholderCategoryData;
  const weeklyTrend = data?.weeklyTrend ?? placeholderWeeklyTrend;
  const recentQueries = data?.recentQueries ?? [];
  const stats = data?.stats ?? {
    totalQueries: 0,
    documentsIndexed: 0,
    resolutionRate: 0,
    avgResponseTime: 0,
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Intelligence Dashboard
            </h1>
            <p className="text-gray-600">
              Overview of query analytics and system performance
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Total Queries</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalQueries.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Documents Indexed</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.documentsIndexed}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across 5 categories</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Resolution Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.resolutionRate}%
            </p>
            <p className="text-sm text-green-600 mt-2">
              {stats.resolutionRate >= 80 ? "✓ Good performance" : "Needs improvement"}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500">Avg Response Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.avgResponseTime}s
            </p>
            <p className="text-sm text-gray-500 mt-2">Per query</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart - Queries by Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Queries by Classification
            </h3>
            {totalQueries > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No data yet</p>
                  <p className="text-sm">Start chatting to see query analytics</p>
                </div>
              </div>
            )}
          </div>

          {/* Pie Chart - Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Classification Distribution
            </h3>
            {totalQueries > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData.filter(c => c.queries > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="queries"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No data yet</p>
                  <p className="text-sm">Query distribution will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Weekly Query Trend by Classification
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
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
              <Line
                type="monotone"
                dataKey="Support"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="HR"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Marketing"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="IT"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Finance"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Queries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Queries</h3>
          </div>
          {recentQueries.length > 0 ? (
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
                          className={`px-2 py-1 text-xs rounded-full ${
                            categoryColors[q.category] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {q.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {q.responseTime}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            statusColors[q.status] || "bg-gray-100 text-gray-700"
                          }`}
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
          ) : (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg mb-2">No queries yet</p>
              <p className="text-sm">
                Go to the <a href="/chat" className="text-indigo-600 hover:underline">Chat</a> page and ask some questions to see them here
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
