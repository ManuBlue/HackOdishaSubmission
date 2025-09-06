"use client";

import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import config from '../config.json';
const CreateModel = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleMakeModel = async () => {
    const backendUrl = config.backend;
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("jwt_token");
      const res = await fetch(
        `${backendUrl}/makeModel?token=${token}`,
        { method: "GET" }
      );
      if (!res.ok) {
        throw new Error("Failed to create model");
      }
      const data = await res.json();
      setStatus(data.status || "Model created successfully!");
    } catch (err: any) {
      setStatus(err.message || "Error creating model");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex flex-col items-center justify-center">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create/Remake Face Recognition Model
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Click the button below to generate or update your face recognition model using your uploaded images.
          </p>
          <Button
            onClick={handleMakeModel}
            disabled={loading}
            className="mb-4"
          >
            {loading ? "Processing..." : "Create Model"}
          </Button>
          {status && (
            <div className="mt-4 text-lg text-blue-700 font-semibold">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CreateModel;