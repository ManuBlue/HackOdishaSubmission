"use client";

import { useState } from "react";
import { Upload, PlusCircle, X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import config from "../config.json";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

type NameImagePair = { name: string; file: File | null };

const AddMedia = () => {
  const [pairs, setPairs] = useState<NameImagePair[]>([{ name: "", file: null }]);
  const [loading, setLoading] = useState(false);

  const backendUrl = config.backend;
  const { user, logout } = useAuth();

  const handlePairChange = (
    idx: number,
    field: "name" | "file",
    value: string | File | null
  ) => {
    setPairs((prev) =>
      prev.map((pair, i) => (i === idx ? { ...pair, [field]: value } : pair))
    );
  };

  const addPair = () => {
    setPairs((prev) => [...prev, { name: "", file: null }]);
  };

  const removePair = (idx: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (pairs.some((p) => !p.name || !p.file)) {
      alert("Please provide a name and file for each entry.");
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      alert("You must be logged in to upload images.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    pairs.forEach((pair) => formData.append("names", pair.name));
    pairs.forEach((pair) => pair.file && formData.append("images", pair.file));

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/addImages`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      alert("Files uploaded successfully!");
      setPairs([{ name: "", file: null }]);
    } catch (err: any) {
      alert(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 flex items-center justify-center px-4 py-10 ml-64">
        <Card className="w-full max-w-2xl shadow-lg border border-gray-200 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Upload className="h-5 w-5" />
              Upload Person Images
            </CardTitle>
            <CardDescription>
              Add one or more <strong>faces</strong> with custom names.<br />
              Supported formats: JPG, PNG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm"
                >
                  {/* Thumbnail preview */}
                  <div className="w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100">
                    {pair.file ? (
                      <img
                        src={URL.createObjectURL(pair.file)}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>

                  {/* Name input */}
                  <input
                    type="text"
                    placeholder="Person name"
                    className="border rounded px-3 py-2 flex-1 text-sm"
                    value={pair.name}
                    onChange={(e) => handlePairChange(idx, "name", e.target.value)}
                  />

                  {/* Upload button */}
                  <label className="cursor-pointer text-sm px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handlePairChange(idx, "file", e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {/* Remove button */}
                  {pairs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePair(idx)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              {/* Add another */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={addPair}
              >
                <PlusCircle className="h-4 w-4" /> Add Another
              </Button>

              {/* Upload */}
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="w-full font-semibold text-base rounded-lg"
              >
                {loading ? "Uploading..." : "Upload All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMedia