import { supabase } from "@/integrations/supabase/client";

export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Mathematics",
  "Literature",
  "Reference",
  "Other",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export interface Book {
  id?: number;
  bookId: string;
  name: string;
  author: string;
  category: BookCategory;
  status: "Available" | "Issued";
  issuedTo?: string;
  issueDate?: string;
  dueDate?: string;
}

const FINE_PER_DAY = 5;

export function calculateFine(dueDate?: string | null): { overdueDays: number; fine: number } {
  if (!dueDate) return { overdueDays: 0, fine: 0 };
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { overdueDays: 0, fine: 0 };
  return { overdueDays: diff, fine: diff * FINE_PER_DAY };
}

function mapRow(row: any): Book {
  return {
    id: row.id,
    bookId: row.book_id,
    name: row.name,
    author: row.author,
    category: row.category || "Other",
    status: row.status === "issued" ? "Issued" : "Available",
    issuedTo: row.issued_to || undefined,
    issueDate: undefined,
    dueDate: row.due_date || undefined,
  };
}

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase.from("books").select("*").order("id", { ascending: true });
  if (error) { console.error("getBooks error:", error); return []; }
  return (data || []).map(mapRow);
}

export async function addBook(book: Omit<Book, "status" | "id">): Promise<{ success: boolean; message: string }> {
  const { error } = await supabase.from("books").insert({
    book_id: book.bookId,
    name: book.name,
    author: book.author,
    category: book.category,
    status: "available",
    fine: 0,
  });
  if (error) {
    if (error.code === "23505") return { success: false, message: "A book with this ID already exists." };
    return { success: false, message: error.message };
  }
  await logActivity({ action: "Add", book_id: book.bookId, book_name: book.name, details: `Added "${book.name}" by ${book.author}` });
  return { success: true, message: "Book added successfully!" };
}

export async function issueBook(bookId: string, studentName: string): Promise<{ success: boolean; message: string }> {
  const { data: existing } = await supabase.from("books").select("*").eq("book_id", bookId).maybeSingle();
  if (!existing) return { success: false, message: "Book not found." };
  if (existing.status === "issued") return { success: false, message: "Book is already issued." };

  const due = new Date();
  due.setDate(due.getDate() - 2); // Testing: due date 2 days ago
  const dueDate = due.toISOString().split("T")[0];

  const { error } = await supabase.from("books").update({
    status: "issued",
    issued_to: studentName,
    due_date: dueDate,
    fine: 0,
  }).eq("book_id", bookId);

  if (error) return { success: false, message: error.message };
  await logActivity({ action: "Issue", book_id: bookId, book_name: existing.name, student_name: studentName, details: `Due ${dueDate}` });
  return { success: true, message: `Book "${existing.name}" issued to ${studentName}.` };
}

export async function returnBook(bookId: string): Promise<{ success: boolean; message: string }> {
  const { data: existing } = await supabase.from("books").select("*").eq("book_id", bookId).maybeSingle();
  if (!existing) return { success: false, message: "Book not found." };
  if (existing.status === "available") return { success: false, message: "Book is already available." };

  const { fine } = calculateFine(existing.due_date);

  const { error } = await supabase.from("books").update({
    status: "available",
    issued_to: null,
    due_date: null,
    fine: 0,
  }).eq("book_id", bookId);

  if (error) return { success: false, message: error.message };
  const fineMsg = fine > 0 ? ` Fine: ₹${fine} (${fine / FINE_PER_DAY} days overdue).` : "";
  await logActivity({ action: "Return", book_id: bookId, book_name: existing.name, student_name: existing.issued_to || undefined, details: fine > 0 ? `Fine ₹${fine}` : "On time" });
  return { success: true, message: `Book "${existing.name}" returned successfully.${fineMsg}` };
}

export async function deleteBook(bookId: string): Promise<{ success: boolean; message: string }> {
  const { data: existing } = await supabase.from("books").select("*").eq("book_id", bookId).maybeSingle();
  if (!existing) return { success: false, message: "Book not found." };
  if (existing.status === "issued") return { success: false, message: "Cannot delete an issued book. Return it first." };

  const { error } = await supabase.from("books").delete().eq("book_id", bookId);
  if (error) return { success: false, message: error.message };
  await logActivity({ action: "Delete", book_id: bookId, book_name: existing.name, details: `Removed "${existing.name}"` });
  return { success: true, message: `Book "${existing.name}" deleted successfully.` };
}

export async function getStats(): Promise<{ total: number; available: number; issued: number }> {
  const books = await getBooks();
  return {
    total: books.length,
    available: books.filter((b) => b.status === "Available").length,
    issued: books.filter((b) => b.status === "Issued").length,
  };
}

export async function getMostIssuedBook(): Promise<{ name: string; count: number } | null> {
  // Derive "most issued" from currently issued books: pick the title appearing most often.
  // Falls back to the first issued book if all are unique.
  const books = await getBooks();
  const issued = books.filter((b) => b.status === "Issued");
  if (issued.length === 0) return null;
  const counts = new Map<string, number>();
  for (const b of issued) counts.set(b.name, (counts.get(b.name) || 0) + 1);
  let topName = issued[0].name;
  let topCount = 0;
  for (const [name, count] of counts) {
    if (count > topCount) { topName = name; topCount = count; }
  }
  return { name: topName, count: topCount };
}

export async function getRecentlyIssued(limit = 5): Promise<Book[]> {
  // Use due_date as a proxy for recency (issue date is not stored).
  const books = await getBooks();
  return books
    .filter((b) => b.status === "Issued" && b.dueDate)
    .sort((a, b) => (b.dueDate || "").localeCompare(a.dueDate || ""))
    .slice(0, limit);
}

export async function getOverdueBooks(): Promise<Book[]> {
  const books = await getBooks();
  return books.filter((b) => b.status === "Issued" && calculateFine(b.dueDate).fine > 0);
}

export async function exportData(): Promise<string> {
  const books = await getBooks();
  return JSON.stringify({ books }, null, 2);
}

// ----- Activity Log -----

export interface ActivityEntry {
  id: number;
  action: string;
  bookId?: string | null;
  bookName?: string | null;
  studentName?: string | null;
  details?: string | null;
  createdAt: string;
}

interface LogPayload {
  action: "Add" | "Issue" | "Return" | "Delete";
  book_id?: string;
  book_name?: string;
  student_name?: string;
  details?: string;
}

async function logActivity(payload: LogPayload): Promise<void> {
  const { error } = await supabase.from("activity_log").insert(payload);
  if (error) console.error("logActivity error:", error);
}

export async function getActivityLog(limit = 20): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getActivityLog error:", error); return []; }
  return (data || []).map((r: any) => ({
    id: r.id,
    action: r.action,
    bookId: r.book_id,
    bookName: r.book_name,
    studentName: r.student_name,
    details: r.details,
    createdAt: r.created_at,
  }));
}

// ----- Students -----

export interface StudentSummary {
  name: string;
  issuedCount: number;
  totalFine: number;
  books: Book[];
}

export async function getStudents(): Promise<StudentSummary[]> {
  const books = await getBooks();
  const map = new Map<string, StudentSummary>();
  for (const b of books) {
    if (b.status !== "Issued" || !b.issuedTo) continue;
    const key = b.issuedTo;
    const entry = map.get(key) || { name: key, issuedCount: 0, totalFine: 0, books: [] };
    entry.issuedCount += 1;
    entry.totalFine += calculateFine(b.dueDate).fine;
    entry.books.push(b);
    map.set(key, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.totalFine - a.totalFine || a.name.localeCompare(b.name));
}
