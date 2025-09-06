import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import axios from "axios";

const MakeModel = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMakeModel = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      await axios.get("http://localhost:8080/makeModel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Model remade successfully!");
    } catch (err) {
      setError("Failed to remake model. Please try again.");
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
            Make Model
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Click the button below to remake the model using your uploaded images.
          </p>
          <Button onClick={handleMakeModel} disabled={loading}>
            {loading ? "Processing..." : "Remake Model"}
          </Button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default MakeModel;