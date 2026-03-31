import { useGetAdminStats } from "@workspace/api-client-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, MessageSquare, MessagesSquare, TrendingUp } from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading, isError } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading stats...
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load stats. Make sure you are logged in as an admin.
      </div>
    );
  }

  const chartData = stats.dailyActivity.map((d) => ({
    date: d.date.slice(5),
    Conversations: d.conversations,
    Messages: d.messages,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time stats for SANSA AI
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.usersToday} joined today`}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Conversations"
          value={stats.totalConversations}
          sub={`${stats.conversationsToday} today`}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={MessagesSquare}
          label="Total Messages"
          value={stats.totalMessages}
          color="bg-green-500/10 text-green-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Msgs / Chat"
          value={
            stats.totalConversations > 0
              ? (stats.totalMessages / stats.totalConversations).toFixed(1)
              : "0"
          }
          color="bg-orange-500/10 text-orange-400"
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-6">
          Activity — Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid #ffffff15",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            />
            <Area
              type="monotone"
              dataKey="Conversations"
              stroke="#8b5cf6"
              fill="url(#colorConv)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="Messages"
              stroke="#3b82f6"
              fill="url(#colorMsg)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
