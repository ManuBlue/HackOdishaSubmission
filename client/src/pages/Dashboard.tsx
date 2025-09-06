"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex flex-col items-center justify-center">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Monitr Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Use the sidebar to navigate and manage your CCTV uploads, files, and
            settings.
          </p>
        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
