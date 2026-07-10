import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addBook, BOOK_CATEGORIES, type BookCategory } from "@/lib/bookStore";

const AddBook = () => {
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [bookId, setBookId] = useState("");
  const [category, setCategory] = useState<BookCategory>("Other");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !author.trim() || !bookId.trim()) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await addBook({ bookId: bookId.trim(), name: name.trim(), author: author.trim(), category });
    toast({ title: result.success ? "Success" : "Error", description: result.message, variant: result.success ? "default" : "destructive" });
    if (result.success) { setName(""); setAuthor(""); setBookId(""); setCategory("Other"); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Add Book</h1>
      <Card className="max-w-lg border-border shadow-sm">
        <CardHeader><CardTitle className="text-lg">Book Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookId">Book ID</Label>
              <Input id="bookId" placeholder="e.g. BK001" value={bookId} onChange={(e) => setBookId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Book Name</Label>
              <Input id="name" placeholder="Enter book name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" placeholder="Enter author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as BookCategory)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {BOOK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding..." : "Add Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBook;
