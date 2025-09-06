"use client";

import { useEffect, useState } from "react";
import { FileImage, Film } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

const CurrentMedia = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 ml-64 p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Uploaded Media ({files.length})
            </CardTitle>
            <CardDescription>All uploaded CCTV images & videos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : files.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4 bg-white">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.type}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.uploadedAt).toLocaleString()}
                    </p>

                    {file.type.startsWith("image/") ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover mt-2 rounded border"
                      />
                    ) : (
                      <video
                        controls
                        src={file.url}
                        className="w-full h-32 object-cover mt-2 rounded border"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrentMedia;