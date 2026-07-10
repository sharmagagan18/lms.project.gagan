import { useState, useEffect } from "react";
import { getBooks, calculateFine, BOOK_CATEGORIES, type Book } from "@/lib/bookStore";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle } from "lucide-react";

const StudentViewBooks = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setBooks(await getBooks());
      setLoading(false);
    };
    load();
  }, []);

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    const matchesSearch = b.bookId.toLowerCase().includes(q) || b.name.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">View Books</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by ID, name, or author..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BOOK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{books.length === 0 ? "No books in library yet." : "No books match your search."}</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead>Book ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Fine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((book) => {
                const { overdueDays, fine } = calculateFine(book.dueDate);
                const isOverdue = fine > 0;
                return (
                  <TableRow key={book.bookId} className={isOverdue ? "bg-destructive/5" : ""}>
                    <TableCell className="font-mono text-sm">{book.bookId}</TableCell>
                    <TableCell className="font-medium">{book.name}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{book.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={book.status === "Available" ? "bg-success text-success-foreground" : isOverdue ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}>
                        {book.status === "Available" ? "Available" : isOverdue ? "Overdue" : "Issued"}
                      </Badge>
                    </TableCell>
                    <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>{book.dueDate || "—"}</TableCell>
                    <TableCell>
                      {fine > 0 ? (
                        <span className="flex items-center gap-1 text-destructive font-semibold text-sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ₹{fine} ({overdueDays}d)
                        </span>
                      ) : book.status === "Issued" ? (
                        <span className="text-muted-foreground text-sm">No fine</span>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default StudentViewBooks;
