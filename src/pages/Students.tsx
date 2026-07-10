import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, AlertTriangle, BookOpen } from "lucide-react";
import { getStudents, calculateFine, type StudentSummary } from "@/lib/bookStore";

const Students = () => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getStudents();
      setStudents(data);
      if (data.length) setSelected(data[0].name);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [students, search],
  );

  const current = students.find((s) => s.name === selected) || null;

  if (loading) return <p className="text-muted-foreground">Loading students...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Student Profiles</h1>
        <p className="text-muted-foreground text-sm mt-1">Search students and view their issued books and outstanding fines.</p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No students with issued books yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="border-border lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
                {filtered.map((s) => {
                  const isActive = selected === s.name;
                  return (
                    <li key={s.name}>
                      <button
                        onClick={() => setSelected(s.name)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between gap-2 ${
                          isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.issuedCount} issued</p>
                        </div>
                        {s.totalFine > 0 && (
                          <Badge className="bg-destructive text-destructive-foreground shrink-0">₹{s.totalFine}</Badge>
                        )}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">No matches.</p>}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border lg:col-span-2 backdrop-blur-sm bg-card/80">
            <CardHeader>
              {current ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{current.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{current.issuedCount} book{current.issuedCount === 1 ? "" : "s"} issued</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Fine</p>
                    <p className={`text-2xl font-extrabold ${current.totalFine > 0 ? "text-destructive" : "text-success"}`}>
                      ₹{current.totalFine}
                    </p>
                  </div>
                </div>
              ) : (
                <CardTitle>Select a student</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {current && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Issued Books
                  </p>
                  {current.books.map((b) => {
                    const { fine, overdueDays } = calculateFine(b.dueDate);
                    const overdue = fine > 0;
                    return (
                      <div
                        key={b.bookId}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors ${
                          overdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-secondary/40"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-mono">{b.bookId}</span> · {b.author}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs ${overdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                            Due {b.dueDate || "—"}
                          </p>
                          {overdue ? (
                            <Badge className="bg-destructive text-destructive-foreground mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              ₹{fine} ({overdueDays}d)
                            </Badge>
                          ) : (
                            <Badge className="bg-warning text-warning-foreground mt-1">Issued</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Students;
