// filepath: d:\Projects\HackOdishaSubmission\client\src\pages\MakeModel.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const MakeModel = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMakeModel = async () => {
    setLoading(true);
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
    try {
      const response = await fetch("http://localhost:8080/makeModel", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to make model");
      }

      const data = await response.json();
      alert(data.status);
      router.push("/Dashboard"); // Redirect to Dashboard after successful model creation
    } catch (error) {
      console.error("Error making model:", error);
      alert("Error making model. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 ml-64 flex flex-col items-center justify-center">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Make a New Model
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Click the button below to create a new model using your uploaded images.
          </p>
          <Button onClick={handleMakeModel} disabled={loading}>
            {loading ? "Creating Model..." : "Create Model"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MakeModel;