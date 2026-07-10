import { useState, useEffect } from "react";
import { getBooks, calculateFine, type Book } from "@/lib/bookStore";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, BookOpen } from "lucide-react";

const MyBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await getBooks();
      setBooks(all.filter((b) => b.status === "Issued" && b.issuedTo?.toLowerCase() === "student"));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Books</h1>

      {books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>You don't have any issued books right now.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead>Book ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Fine</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => {
                const { overdueDays, fine } = calculateFine(book.dueDate);
                const isOverdue = fine > 0;
                return (
                  <TableRow key={book.bookId} className={isOverdue ? "bg-destructive/5" : ""}>
                    <TableCell className="font-mono text-sm">{book.bookId}</TableCell>
                    <TableCell className="font-medium">{book.name}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>{book.dueDate || "—"}</TableCell>
                    <TableCell>
                      {fine > 0 ? (
                        <span className="flex items-center gap-1 text-destructive font-semibold text-sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          ₹{fine} ({overdueDays}d)
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">No fine</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={isOverdue ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"}>
                        {isOverdue ? "Overdue" : "Issued"}
                      </Badge>
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

export default MyBooks;
