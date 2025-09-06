import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
//import ProtectedRoute from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import CurrentMedia from "./pages/CurrentMedia";
import AddMedia from "./pages/AddMedia";
import ProcessVideo from "./pages/processVideo";
import CreateModel from "./pages/createModel";
//import { LogIn, Signal } from "lucide-react";
function App() {
  return (
    <div className="h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/current-media" element={<CurrentMedia />} />
        <Route path="/add-media" element={<AddMedia />} />
        <Route path="/process-video" element={<ProcessVideo />} />
        <Route path="/create-model" element={<CreateModel />} />
      </Routes>
    </div>
  );
}

export default App;
