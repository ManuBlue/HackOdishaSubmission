"use client";

import { useEffect, useState } from "react";
import { Folder, FileImage, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import config from "../config.json";

interface PersonFolder {
  name: string;
  image_count: number;
  images: string[];
}

const CurrentMedia = () => {
  const backendUrl = config.backend;
  const { user, logout } = useAuth();

  const [personFolders, setPersonFolders] = useState<PersonFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch person folders on mount
  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("Not logged in");
        const res = await fetch(
          `${backendUrl}/getUserImageDetails?token=${token}`
        );
        if (!res.ok) throw new Error("Failed to fetch image details");
        const data = await res.json();
        const folders: PersonFolder[] = Object.entries(data).map(
          ([name, value]: [string, any]) => ({
            name,
            image_count: value.image_count,
            images: value.images,
          })
        );
        setPersonFolders(folders);
      } catch (err: any) {
        setError(err.message || "Error loading folders");
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, []);

  // When a person is selected, show their images
  useEffect(() => {
    setSelectedImage(null);
    setImageUrl(null);
    if (selectedPerson) {
      const folder = personFolders.find((f) => f.name === selectedPerson);
      setImages(folder ? folder.images : []);
    } else {
      setImages([]);
    }
  }, [selectedPerson, personFolders]);

  // When an image is selected, fetch it
  useEffect(() => {
    const fetchImage = async () => {
      if (!selectedPerson || !selectedImage) return;
      setImageLoading(true);
      setImageUrl(null);
      setError(null);
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("Not logged in");
        const url = `${backendUrl}/getSpecificImage?token=${token}&personName=${encodeURIComponent(
          selectedPerson
        )}&imageName=${encodeURIComponent(selectedImage)}`;
        setImageUrl(url); // Direct link, browser will fetch as needed
      } catch (err: any) {
        setError(err.message || "Error loading image");
      } finally {
        setImageLoading(false);
      }
    };
    fetchImage();
  }, [selectedPerson, selectedImage, backendUrl]);

  // Delete image handler
  const handleDelete = async () => {
    if (!selectedPerson || !selectedImage) return;
    if (!window.confirm(`Delete image "${selectedImage}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) throw new Error("Not logged in");
      const url = `${backendUrl}/deleteSpecificImage?token=${token}&personName=${encodeURIComponent(
        selectedPerson
      )}&imageName=${encodeURIComponent(selectedImage)}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to delete image");
      }
      // Remove image from UI
      setImages((imgs) => imgs.filter((img) => img !== selectedImage));
      setSelectedImage(null);
      setImageUrl(null);
      // Also update personFolders state to reflect new image count
      setPersonFolders((folders) =>
        folders.map((f) =>
          f.name === selectedPerson
            ? { ...f, image_count: f.image_count - 1, images: f.images.filter((img) => img !== selectedImage) }
            : f
        )
      );
    } catch (err: any) {
      setError(err.message || "Error deleting image");
    } finally {
      setDeleting(false);
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileImage className="h-6 w-6" />
            Image Explorer
          </h1>
          {error && (
            <div className="mb-4 text-red-600 font-semibold">{error}</div>
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" /> Loading folders...
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Left: Person Folders */}
              <div className="w-1/3">
                <h2 className="font-semibold mb-2 text-gray-700">People</h2>
                <ul>
                  {personFolders.map((folder) => (
                    <li key={folder.name}>
                      <button
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 ${
                          selectedPerson === folder.name
                            ? "bg-black text-white"
                            : "text-gray-800"
                        }`}
                        onClick={() => setSelectedPerson(folder.name)}
                      >
                        <Folder className="h-5 w-5" />
                        <span className="truncate">{folder.name}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          {folder.image_count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Middle: Images in Folder */}
              <div className="w-1/3">
                <div className="flex items-center mb-2">
                  <h2 className="font-semibold text-gray-700 flex-1">
                    {selectedPerson ? `Images of ${selectedPerson}` : "Images"}
                  </h2>
                  {selectedPerson && (
                    <button
                      className="ml-2 text-xs text-gray-500 hover:underline"
                      onClick={() => setSelectedPerson(null)}
                    >
                      <ArrowLeft className="inline h-4 w-4 mr-1" />
                      Back
                    </button>
                  )}
                </div>
                <ul>
                  {images.length === 0 && selectedPerson && (
                    <li className="text-gray-400 text-sm">No images found.</li>
                  )}
                  {images.map((img) => (
                    <li key={img}>
                      <button
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-gray-100 ${
                          selectedImage === img
                            ? "bg-black text-white"
                            : "text-gray-800"
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <FileImage className="h-5 w-5" />
                        <span className="truncate">{img}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Image Preview */}
              <div className="w-1/3 flex flex-col items-center">
                <h2 className="font-semibold mb-2 text-gray-700">Preview</h2>
                {selectedImage ? (
                  imageLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" /> Loading image...
                    </div>
                  ) : imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={selectedImage}
                        className="max-w-full max-h-80 rounded border shadow"
                      />
                      <div className="flex gap-2 mt-4">
                        <a
                          href={imageUrl}
                          download={selectedImage}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Download
                        </a>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-1 text-red-600 hover:underline text-sm px-2 py-1 rounded disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">No preview available.</div>
                  )
                ) : (
                  <div className="text-gray-400">Select an image to preview.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentMedia;