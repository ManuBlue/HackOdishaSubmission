"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Upload, FileImage, Trash2, User } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useAuth } from "@/hooks/useAuth";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string; // ISO string from API
}

const Dashboard = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch files from API on mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/uploads"); // adjust API URL
        if (!res.ok) throw new Error("Failed to fetch files");
        const data: UploadedFile[] = await res.json();
        setUploadedFiles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFiles();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const newFiles: UploadedFile[] = await res.json();

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const renderFileCard = (file: UploadedFile, showDelete = true) => (
    <div
      key={file.id}
      className="border rounded-lg p-4 bg-white flex items-center gap-4"
    >
      {/* Left: image/video preview */}
      {file.type.startsWith("image/") ? (
        <img
          src={file.url || "/placeholder.svg"}
          alt={file.name}
          className="w-28 h-28 object-cover rounded border"
        />
      ) : (
        <div className="w-28 h-28 flex items-center justify-center bg-gray-100 border rounded">
          <FileImage className="h-10 w-10 text-gray-400" />
        </div>
      )}

      {/* Right: details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          {showDelete && (
            <Button
              onClick={() => handleDeleteFile(file.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {file.type}
          </Badge>
          <span className="text-xs text-gray-500">
            {new Date(file.uploadedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              CCTV Processing Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Upload and process CCTV images
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant={"outline"}
              className="flex items-center gap-2 bg-black text-white "
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CCTV Images
              </CardTitle>
              <CardDescription>
                Upload images from your CCTV system for processing. Supported
                formats: JPG, PNG, GIF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUpload={handleFileUpload} />

              {/* Preview uploaded right after selecting */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                  {uploadedFiles.map((file) => renderFileCard(file, false))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Files Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Uploaded Files ({uploadedFiles.length})
              </CardTitle>
              <CardDescription>
                Manage your uploaded CCTV images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No files uploaded yet</p>
                  <p className="text-sm">
                    Upload some CCTV images to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map((file) => renderFileCard(file))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
