"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function EventUploader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [postType, setPostType] = useState<"announcement" | "event">("announcement");
  const [uploadType, setUploadType] = useState<"text" | "image">("text");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const drawTextToCanvas = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const heading = lines.length > 0 ? lines[0] : "New Update";
        const body = lines.length > 1 ? lines.slice(1).join(' ') : "";

        const canvas = canvasRef.current;
        if (!canvas) return reject("Canvas not found");
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context not found");

        canvas.width = 1080;
        canvas.height = 1080;

        // Background
        ctx.fillStyle = "#1e3a8a"; // blue-900
        ctx.fillRect(0, 0, 1080, 1080);

        // Load logo as background watermark
        const img = new window.Image();
        img.onload = () => {
          // Draw watermark
          ctx.globalAlpha = 0.15;
          const imgAspect = img.width / img.height;
          let drawWidth = 800;
          let drawHeight = 800 / imgAspect;
          ctx.drawImage(img, (1080 - drawWidth)/2, (1080 - drawHeight)/2, drawWidth, drawHeight);
          
          ctx.globalAlpha = 1.0;

          // Draw Text
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          
          // Type Label
          ctx.font = "bold 40px sans-serif";
          ctx.fillText(postType === "announcement" ? "📣 ANNOUNCEMENT" : "📅 UPCOMING EVENT", 540, 200);

          // Heading
          ctx.font = "bold 80px serif"; // Playfair equivalent
          const maxWidth = 900;
          wrapText(ctx, heading, 540, 350, maxWidth, 90);

          // Body
          ctx.font = "40px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          wrapText(ctx, body, 540, 600, maxWidth, 50);

          // Footer
          ctx.font = "bold 30px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText("SoCal Academy of Knowledge", 540, 1000);

          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject("Failed to load logo");
        img.src = "/new_logo.png";
      };
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      if (uploadType === "text" && selectedFile.name.endsWith(".txt")) {
        try {
          const dataUrl = await drawTextToCanvas(selectedFile);
          setPreviewUrl(dataUrl);
        } catch (err) {
          console.error(err);
          alert("Error generating preview from text file.");
        }
      } else if (uploadType === "image") {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");
    if (!endDate) return alert("Please select an expiration date.");

    setLoading(true);
    setMessage("");

    try {
      let imageUrl = "";

      // 1. Upload Image (or generated canvas)
      if (uploadType === "text") {
        if (!previewUrl) throw new Error("No generated image found");
        const res = await fetch("/api/v1/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: previewUrl })
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        imageUrl = data.url;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        imageUrl = data.url;
      }

      // 2. Submit to Announcements or Events API
      let title = file.name.split('.')[0]; // Fallback
      let bodyOrDesc = "Uploaded via tool";

      if (uploadType === "text") {
        const text = await file.text();
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length > 0) title = lines[0];
        if (lines.length > 1) bodyOrDesc = lines.slice(1).join(' ');
      }

      const today = new Date().toISOString();
      const endpoint = postType === "announcement" ? "/api/v1/announcements" : "/api/v1/events";
      
      const payload: any = {
        title,
        imageUrl,
        endDate: new Date(endDate).toISOString(),
      };

      if (postType === "announcement") {
        payload.body = bodyOrDesc;
        payload.category = "general";
        payload.isPinned = true;
        payload.startDate = today;
      } else {
        payload.description = bodyOrDesc;
        payload.category = "community";
        payload.date = today.split('T')[0];
        payload.location = "TBD";
      }

      const postRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!postRes.ok) throw new Error(`Failed to create ${postType}`);

      setMessage(`Successfully added ${postType}!`);
      setFile(null);
      setPreviewUrl(null);
      setEndDate("");
      const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border border-slate-200">
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Event Uploader Login</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        <div className="bg-blue-900 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Event Uploader Tool</h1>
          <p className="text-blue-100 text-sm">Upload announcements or events to the Home and Events pages.</p>
        </div>

        <div className="p-6 md:p-8">
          {message && (
            <div className={`mb-6 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What are you adding?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="postType" checked={postType === "announcement"} onChange={() => setPostType("announcement")} />
                    Announcement
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="postType" checked={postType === "event"} onChange={() => setPostType("event")} />
                    Event
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="uploadType" checked={uploadType === "text"} onChange={() => { setUploadType("text"); setFile(null); setPreviewUrl(null); }} />
                    Text File (.txt)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="uploadType" checked={uploadType === "image"} onChange={() => { setUploadType("image"); setFile(null); setPreviewUrl(null); }} />
                    Image Post
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
              <p className="text-xs text-slate-500 mb-2">The post will be automatically removed after this date.</p>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 w-full max-w-xs"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
              <p className="text-xs text-slate-500 mb-2">
                {uploadType === "text" 
                  ? "Upload a .txt file. First line is the heading, remaining lines are the body."
                  : "Upload an Instagram-sized square image (1080x1080 recommended)."
                }
              </p>
              <input 
                id="fileUpload"
                type="file" 
                accept={uploadType === "text" ? ".txt" : "image/*"}
                onChange={handleFileChange}
                className="border border-slate-300 rounded px-3 py-2 w-full"
                required
              />
            </div>

            {previewUrl && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Preview</h3>
                <div className="flex justify-center bg-slate-100 p-4 rounded-lg">
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-96 shadow-md rounded" />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded shadow transition disabled:opacity-50"
              >
                {loading ? "Uploading..." : `Upload ${postType === 'announcement' ? 'Announcement' : 'Event'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Hidden canvas for text-to-image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
