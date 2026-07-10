import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import AddBook from "./AddBook";
import ViewBooks from "./ViewBooks";
import IssueBook from "./IssueBook";
import ReturnBook from "./ReturnBook";
import Students from "./Students";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("library_logged_in") === "true");
  const location = useLocation();
  const navigate = useNavigate();

  // Map URL path -> active page id
  const pathToPage: Record<string, string> = {
    "/": "dashboard",
    "/dashboard": "dashboard",
    "/add": "add",
    "/view": "view",
    "/issue": "issue",
    "/return": "return",
    "/students": "students",
  };
  const activePage = pathToPage[location.pathname] ?? "dashboard";
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    setPageKey((k) => k + 1);
  }, [location.pathname]);

  const handleLogin = useCallback(() => {
    setLoggedIn(true);
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("library_logged_in");
    setLoggedIn(false);
    navigate("/", { replace: true });
  }, [navigate]);

  const handleNavigate = useCallback(
    (page: string) => {
      const pageToPath: Record<string, string> = {
        dashboard: "/dashboard",
        add: "/add",
        view: "/view",
        issue: "/issue",
        return: "/return",
        students: "/students",
      };
      navigate(pageToPath[page] ?? "/dashboard");
    },
    [navigate],
  );

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "add": return <AddBook />;
      case "view": return <ViewBooks />;
      case "issue": return <IssueBook />;
      case "return": return <ReturnBook />;
      case "students": return <Students />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active={activePage} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <div key={pageKey} className="animate-page-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default Index;
