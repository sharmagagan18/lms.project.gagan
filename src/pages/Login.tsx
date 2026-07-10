import { useState } from "react";
import { BookOpen, ShieldCheck, Library, User, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LoginProps {
  onLogin: () => void;
}

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("library_logged_in", "true");
      onLogin();
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #6366f1 80%, #06b6d4 100%)" }}
    >
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorative icons */}
      <div className="absolute top-16 left-12 opacity-10 animate-pulse">
        <BookOpen className="w-20 h-20 text-white" />
      </div>
      <div className="absolute top-28 right-20 opacity-10 animate-pulse" style={{ animationDelay: "0.5s" }}>
        <Sparkles className="w-12 h-12 text-cyan-300" />
      </div>
      <div className="absolute bottom-24 right-16 opacity-10 animate-pulse" style={{ animationDelay: "1s" }}>
        <Library className="w-24 h-24 text-white" />
      </div>
      <div className="absolute bottom-32 left-20 opacity-10 animate-pulse" style={{ animationDelay: "1.5s" }}>
        <Sparkles className="w-10 h-10 text-purple-300" />
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />

      {/* Top branding */}
      <div className="relative z-10 mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
          >
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Library Management System
          </h1>
        </div>
        <p className="text-white/50 text-sm tracking-widest uppercase">Admin Portal</p>
      </div>

      {/* Login card */}
      <Card
        className="w-full max-w-md border-0 shadow-2xl relative z-10 animate-fade-in"
        style={{
          background: "rgba(255, 255, 255, 0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "1.25rem",
          animationDelay: "0.1s",
        }}
      >
        <CardHeader className="text-center space-y-4 pb-2">
          <div
            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
            }}
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-white/50 text-sm">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70 font-medium text-xs uppercase tracking-wider">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70 font-medium text-xs uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/[0.06] border-white/10 text-white placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-cyan-400/20 h-11 rounded-xl"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-bold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border-0 rounded-xl text-base"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                boxShadow: "0 4px 24px rgba(6, 182, 212, 0.3)",
              }}
            >
              Sign In
            </Button>
            <p className="text-[11px] text-center text-white/30 pt-1">
              Demo credentials: <span className="text-white/50">admin</span> / <span className="text-white/50">admin123</span>
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p
        className="relative z-10 mt-8 text-[11px] text-white/25 tracking-widest uppercase animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        🔒 Secure Library Access System
      </p>
    </div>
  );
};

export default Login;
