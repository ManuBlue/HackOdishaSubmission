"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AddMedia = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !name) {
      alert("Please provide a file and a name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      alert("File uploaded successfully!");
      setFile(null);
      setName("");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload CCTV Media
        </CardTitle>
        <CardDescription>
          Upload <strong>images or videos</strong> with a custom name.
          <br /> Supported: JPG, PNG, MP4, AVI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter file name"
            className="border rounded px-3 py-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full"
          />
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddMedia;
