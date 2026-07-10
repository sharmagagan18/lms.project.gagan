import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { returnBook } from "@/lib/bookStore";

const ReturnBook = () => {
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId.trim()) {
      toast({ title: "Error", description: "Book ID is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await returnBook(bookId.trim());
    toast({ title: result.success ? "Success" : "Error", description: result.message, variant: result.success ? "default" : "destructive" });
    if (result.success) setBookId("");
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Return Book</h1>
      <Card className="max-w-lg border-border shadow-sm">
        <CardHeader><CardTitle className="text-lg">Return Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookId">Book ID</Label>
              <Input id="bookId" placeholder="e.g. BK001" value={bookId} onChange={(e) => setBookId(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Returning..." : "Return Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnBook;
