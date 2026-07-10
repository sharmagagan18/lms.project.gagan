import { BookOpen, LayoutDashboard, PlusCircle, List, ArrowRightLeft, RotateCcw, LogOut, Sun, Moon, ShieldCheck, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add", label: "Add Book", icon: PlusCircle },
  { id: "view", label: "View Books", icon: List },
  { id: "issue", label: "Issue Book", icon: ArrowRightLeft },
  { id: "return", label: "Return Book", icon: RotateCcw },
  { id: "students", label: "Students", icon: Users },
];

const Sidebar = ({ active, onNavigate, onLogout }: SidebarProps) => {
  const { isDark, toggle } = useTheme();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-colors duration-300">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-hover">
        <BookOpen className="w-7 h-7 text-primary" />
        <span className="text-lg font-bold tracking-tight text-primary-foreground">LibraryMS</span>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-primary/15 text-primary">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin Panel
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-hover"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{isDark ? "Dark" : "Light"}</span>
          </div>
          <Switch checked={isDark} onCheckedChange={toggle} />
        </div>
      </div>

      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
