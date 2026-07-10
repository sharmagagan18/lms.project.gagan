import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { issueBook } from "@/lib/bookStore";

const IssueBook = () => {
  const [bookId, setBookId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId.trim() || !studentName.trim()) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await issueBook(bookId.trim(), studentName.trim());
    toast({ title: result.success ? "Success" : "Error", description: result.message, variant: result.success ? "default" : "destructive" });
    if (result.success) { setBookId(""); setStudentName(""); }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Issue Book</h1>
      <Card className="max-w-lg border-border shadow-sm">
        <CardHeader><CardTitle className="text-lg">Issue Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookId">Book ID</Label>
              <Input id="bookId" placeholder="e.g. BK001" value={bookId} onChange={(e) => setBookId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Student Name</Label>
              <Input id="student" placeholder="Enter student name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Issuing..." : "Issue Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueBook;
