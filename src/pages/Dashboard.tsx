import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, ArrowRightLeft, AlertTriangle, Star, TrendingUp, Clock, Sparkles, Activity, PlusCircle, RotateCcw, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStats, getBooks, calculateFine, getMostIssuedBook, getRecentlyIssued, getActivityLog, type Book, type ActivityEntry } from "@/lib/bookStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, available: 0, issued: 0 });
  const [books, setAllBooks] = useState<Book[]>([]);
  const [mostIssued, setMostIssued] = useState<{ name: string; count: number } | null>(null);
  const [recent, setRecent] = useState<Book[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, b, m, r, a] = await Promise.all([
        getStats(), getBooks(), getMostIssuedBook(), getRecentlyIssued(5), getActivityLog(5),
      ]);
      setStats(s);
      setAllBooks(b);
      setMostIssued(m);
      setRecent(r);
      setActivity(a);
      setLoading(false);
    };
    load();
  }, []);

  const overdueBooks = books.filter((b) => b.status === "Issued" && calculateFine(b.dueDate).fine > 0);
  const overdueCount = overdueBooks.length;

  const cards = [
    { label: "Total Books", value: stats.total, icon: BookOpen, gradient: "from-blue-500 to-indigo-600" },
    { label: "Available", value: stats.available, icon: CheckCircle, gradient: "from-emerald-500 to-teal-600" },
    { label: "Issued", value: stats.issued, icon: ArrowRightLeft, gradient: "from-amber-500 to-orange-600" },
    { label: "Overdue", value: overdueCount, icon: AlertTriangle, gradient: "from-red-500 to-rose-600" },
  ];

  const chartData = [
    { name: "Available", value: stats.available },
    { name: "Issued", value: stats.issued },
  ];
  const COLORS = ["#10b981", "#f59e0b"];

  if (loading) {
    return <p className="text-muted-foreground">Loading dashboard...</p>;
  }


  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome Admin 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your library today.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Last updated: {new Date().toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 stagger-children">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="border-border cursor-default">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{c.label}</p>
                  <p className="text-4xl font-extrabold text-foreground">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <Card className="border-border cursor-default">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Star className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground font-medium">Most Issued</p>
              {mostIssued ? (
                <>
                  <p className="text-sm font-bold text-foreground truncate" title={mostIssued.name}>{mostIssued.name}</p>
                  <p className="text-xs text-muted-foreground">{mostIssued.count}× issued</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 stagger-children">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Book Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm font-medium">No books yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add books to see distribution chart</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8">
                <div className="animate-chart-in">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" strokeWidth={0} cornerRadius={4}>
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`${value} books`, name]} contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-sm text-muted-foreground">{d.name}</span>
                      <span className="text-sm font-bold text-foreground ml-1">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Library Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueCount === 0 && recent.length === 0 ? (
              <div className="text-center py-10">
                <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Issue a book to see insights here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overdueCount > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-destructive">
                        {overdueCount} overdue {overdueCount === 1 ? "book" : "books"}
                      </p>
                      <p className="text-xs text-destructive/80 truncate">
                        {overdueBooks.slice(0, 2).map((b) => b.name).join(", ")}
                        {overdueBooks.length > 2 ? ` +${overdueBooks.length - 2} more` : ""}
                      </p>
                    </div>
                  </div>
                )}
                {recent.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recently Issued
                    </p>
                    <ul className="space-y-2">
                      {recent.map((b) => {
                        const { fine } = calculateFine(b.dueDate);
                        return (
                          <li key={b.bookId} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{b.name}</p>
                              <p className="text-xs text-muted-foreground truncate">to {b.issuedTo || "—"}</p>
                            </div>
                            {fine > 0 ? (
                              <Badge className="bg-destructive text-destructive-foreground shrink-0">Overdue</Badge>
                            ) : (
                              <Badge className="bg-warning text-warning-foreground shrink-0">Issued</Badge>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border backdrop-blur-sm bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="text-center py-10">
              <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm font-medium">No activity recorded yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Add, issue, or return books to see logs</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a) => {
                const meta = actionMeta(a.action);
                const Icon = meta.icon;
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        <span className={meta.textClass}>{a.action}</span>
                        {a.bookName ? <> · {a.bookName}</> : null}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.studentName ? `to ${a.studentName} · ` : ""}
                        {a.details || ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{relativeTime(a.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

function actionMeta(action: string) {
  switch (action) {
    case "Add":
      return { icon: PlusCircle, gradient: "from-emerald-500 to-teal-600", textClass: "text-emerald-500 font-semibold" };
    case "Issue":
      return { icon: ArrowRightLeft, gradient: "from-amber-500 to-orange-600", textClass: "text-amber-500 font-semibold" };
    case "Return":
      return { icon: RotateCcw, gradient: "from-blue-500 to-indigo-600", textClass: "text-blue-500 font-semibold" };
    case "Delete":
      return { icon: Trash2, gradient: "from-red-500 to-rose-600", textClass: "text-destructive font-semibold" };
    default:
      return { icon: Activity, gradient: "from-slate-500 to-slate-700", textClass: "text-foreground font-semibold" };
  }
}

function relativeTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
