"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Upload, Video } from "lucide-react";
import config from "../config.json";

const ProcessVideo = () => {
  const { user, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const prevOutputUrl = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = config.backend;

  // Clean up blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (prevOutputUrl.current) {
        URL.revokeObjectURL(prevOutputUrl.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setOutputUrl(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setError("");
    setOutputUrl(null);

    if (!selectedFile) {
      setError("Please select a video file to upload.");
      return;
    }

    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("You must be logged in to process videos.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("video", selectedFile);

    setProcessing(true);
    try {
      const response = await fetch(`${backendUrl}/processVideo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Processing failed");
      }

      // Get the processed video as a blob and create a URL
      const arrayBuffer = await response.arrayBuffer();
      const mime = response.headers.get("content-type") || "video/mp4";
      const blob = new Blob([arrayBuffer], { type: mime });
      const url = URL.createObjectURL(blob);

      // Clean up previous blob URL
      if (prevOutputUrl.current) {
        URL.revokeObjectURL(prevOutputUrl.current);
      }
      prevOutputUrl.current = url;

      setOutputUrl(url);
    } catch (err: any) {
      setError(err.message || "Processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 ml-64 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Video className="h-7 w-7" />
            Process CCTV Video
          </h1>
          <p className="text-gray-600 mb-8">
            Upload a CCTV video to process it with AI. The processed video will be available for download.
          </p>
          <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col items-center">
            <input
              type="file"
              accept="video/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="mb-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
            >
              <Upload className="h-5 w-5 mr-2" />
              {selectedFile ? "Change Video" : "Select Video"}
            </Button>
            {selectedFile && (
              <div className="mb-4 text-gray-700">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={processing || !selectedFile}
              className="w-full font-semibold text-base rounded-lg"
            >
              {processing ? "Processing..." : "Process Video"}
            </Button>
            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}
          </div>
          {outputUrl && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Processed Video:</h2>
              <video
                key={outputUrl} // force re-render when url changes
                src={outputUrl}
                controls
                className="w-full max-h-96 rounded-lg border"
                autoPlay
              />
              <a
                href={outputUrl}
                download="processed_video.mp4"
                className="block mt-4 text-blue-600 hover:underline"
              >
                Download Processed Video
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessVideo;