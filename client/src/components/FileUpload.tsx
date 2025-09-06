"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      setUploading(true);
      setUploadProgress(0);

      try {
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        onFileUpload(acceptedFiles);
        setUploadProgress(100);

        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } catch (err) {
        setError("Upload failed. Please try again.");
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [onFileUpload]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        {isDragActive ? (
          <p className="text-lg text-primary">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop CCTV images here</p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select files
            </p>
            <Button type="button" variant="outline">
              Select Files
            </Button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Supports: JPG, PNG, GIF (max 10MB each)
        </p>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            Some files were rejected:{" "}
            {fileRejections.map((f) => f.file.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
