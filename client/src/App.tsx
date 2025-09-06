import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { FloatingDock } from "./components/ui/floating-dock";
import { LogIn, Signal } from "lucide-react";
function App() {
    const links = [
    {
      title: "Login",
      icon: (
        <LogIn className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
        {
      title: "Signup",
      icon: (
        <Signal className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
 
   
  ];
  return (
    <div className="h-screen bg-background text-foreground">
      <FloatingDock   items={links} desktopClassName=" bg- black hidden md:flex z-10 absolute" />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
