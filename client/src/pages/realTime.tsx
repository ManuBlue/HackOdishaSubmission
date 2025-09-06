"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import config from "../config.json";

const backendUrl = config.backend;

const RealTime = () => {
  const { user, logout } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let stream: MediaStream | null = null;
    let frameInterval: NodeJS.Timeout | null = null;

    const startWebSocket = async () => {
      try {
        // 1. Get webcam stream
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;

        // 2. Connect to backend WebSocket
        ws = new WebSocket(backendUrl.replace(/^http/, "ws") + "/ws/realtime");

        ws.onopen = () => {
          // 3. Send token as first message
          const token = localStorage.getItem("jwt_token");
          ws?.send(token || "");

          // 4. Start sending frames
          frameInterval = setInterval(() => {
            if (
              !canvasRef.current ||
              !videoRef.current ||
              ws?.readyState !== WebSocket.OPEN
            )
              return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            canvasRef.current.toBlob(
              (blob) => {
                if (blob) ws?.send(blob);
              },
              "image/jpeg",
              0.7
            );
          }, 100);
        };

        ws.onmessage = (event) => {
          // Receive processed JPEG and display
          if (typeof event.data !== "string") {
            const blob = new Blob([event.data], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
            setOutputUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }
        };

        ws.onerror = () => {
          setError("WebSocket error");
        };

        ws.onclose = () => {
          if (frameInterval) clearInterval(frameInterval);
        };
      } catch (err: any) {
        setError("Webcam/WebSocket error: " + err.message);
      }
    };

    startWebSocket();

    return () => {
      if (frameInterval) clearInterval(frameInterval);
      if (ws) ws.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setOutputUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userEmail={user?.email} onLogout={logout} />
      <div className="flex-1 ml-64 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RealTime Video Processing
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your webcam feed is processed live by the backend and displayed side by side.
          </p>
        </div>
        {error && (
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
        )}
        <div className="flex gap-12 mt-4">
          {/* Input Camera */}
          <div className="flex flex-col items-center">
            <h2 className="font-semibold mb-2 text-gray-700">Your Camera</h2>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              width={320}
              height={240}
              className="rounded-lg border shadow bg-black"
              style={{ background: "#222" }}
            />
          </div>
          {/* Backend Processed */}
          <div className="flex flex-col items-center">
            <h2 className="font-semibold mb-2 text-gray-700">Backend Output</h2>
            {outputUrl ? (
              <img
                src={outputUrl}
                alt="Processed Output"
                width={320}
                height={240}
                className="rounded-lg border shadow bg-black"
                style={{ background: "#222" }}
              />
            ) : (
              <div className="w-[320px] h-[240px] flex items-center justify-center bg-gray-200 rounded-lg border shadow text-gray-400">
                Waiting for backend...
              </div>
            )}
          </div>
        </div>
        {/* Hidden canvas for frame extraction */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};
export default RealTime;