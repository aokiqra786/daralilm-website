"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function EventUploader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [postType, setPostType] = useState<"announcement" | "event">("event");
  const [uploadType, setUploadType] = useState<"text" | "image">("text");
  const [publishDate, setPublishDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/v1/announcements?active=true").then(r => r.ok ? r.json() : []).then(data => {
      if(Array.isArray(data)) setActiveAnnouncements(data);
    }).catch(() => {});
    
    // For Admin view, fetch ALL events (so they can see scheduled future posts)
    fetch("/api/v1/events").then(r => r.ok ? r.json() : []).then(data => {
      if(Array.isArray(data)) setActiveEvents(data);
    }).catch(() => {});
  }, [isAuthenticated, refreshKey]);

  const handleDelete = async (type: "announcement" | "event", id: string) => {
    if (!confirm("Are you sure you want to delete this post early?")) return;
    const endpoint = type === 'announcement' ? `/api/v1/announcements?id=${id}` : `/api/v1/events?id=${id}`;
    
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRefreshKey(k => k + 1);
      alert("Successfully deleted!");
    } catch (err) {
      alert("Error deleting post");
    }
  };

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
        
        const line1 = lines.length > 0 ? lines[0] : "New Update";
        const line2 = lines.length > 1 ? lines[1] : "";
        const line3 = lines.length > 2 ? lines[2] : "";
        const body = lines.length > 3 ? lines.slice(3).join(' ') : "";

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
          
          let currentY = 250;
          const maxWidth = 900;

          // Type Label (Optional, keep it small at the very top)
          ctx.font = "bold 30px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fillText(postType === "announcement" ? "📣 ANNOUNCEMENT" : "📅 UPCOMING EVENT", 540, 150);

          // Line 1: H1 Bold
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 80px serif"; // Playfair equivalent
          currentY = wrapText(ctx, line1, 540, currentY, maxWidth, 90);

          // Line 2: H2
          if (line2) {
            ctx.font = "bold 60px serif";
            currentY += 20; // extra padding
            currentY = wrapText(ctx, line2, 540, currentY, maxWidth, 70);
          }

          // Line 3: H3
          if (line3) {
            ctx.font = "bold 45px sans-serif";
            currentY += 20;
            currentY = wrapText(ctx, line3, 540, currentY, maxWidth, 55);
          }

          // Body
          if (body) {
            ctx.font = "35px sans-serif";
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            currentY += 30;
            wrapText(ctx, body, 540, currentY, maxWidth, 45);
          }

          // Footer
          ctx.font = "bold 30px sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText("SoCal Academy of Knowledge", 540, 1040);

          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject("Failed to load logo");
        img.src = "/new_logo.png";
      };
      reader.onerror = () => reject("Failed to read file");
      reader.readAsText(file);
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    // Auto-detect if user uploads an image but left it on 'text'
    const isTextFile = selectedFile.name.endsWith(".txt");
    const currentUploadType = isTextFile ? "text" : "image";
    setUploadType(currentUploadType);

    if (currentUploadType === "text") {
      try {
        const dataUrl = await drawTextToCanvas(selectedFile);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error(err);
        alert("Error generating preview from text file.");
      }
    } else {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas error");

          // Always output a perfect 1080x1080 square so it matches the box perfectly
          const TARGET_SIZE = 1080;
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;

          // Fill with dark background (letterboxing)
          ctx.fillStyle = "#0f172a"; // slate-900
          ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

          // Calculate scale to fit the entire image inside 1080x1080
          const scale = Math.min(TARGET_SIZE / img.width, TARGET_SIZE / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;

          // Center the image on the canvas
          const offsetX = (TARGET_SIZE - drawWidth) / 2;
          const offsetY = (TARGET_SIZE - drawHeight) / 2;

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject("Blob generation failed");
          }, "image/jpeg", 0.95);
        };
        img.onerror = () => reject("Image load error");
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject("File read error");
      reader.readAsDataURL(file);
    });
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
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }
        const data = await res.json();
        imageUrl = data.url;
      } else {
        // Resize uploaded images (preserve aspect ratio)
        const resizedBlob = await resizeImage(file);
        
        const formData = new FormData();
        formData.append("file", new File([resizedBlob], `upload_${Date.now()}.jpg`, { type: 'image/jpeg' }));
        
        const res = await fetch("/api/v1/upload", {
          method: "POST",
          body: formData
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }
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
        date: publishDate, // Using date field as Publish Date
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
      setRefreshKey(k => k + 1);

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
          <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Announcement & Event Uploader Login</h1>
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
          <h1 className="text-2xl font-bold text-white">Announcement and Event Uploader</h1>
          <p className="text-blue-100 text-sm">Upload announcements or events to the Home and Events pages.</p>
        </div>

        <div className="p-6 md:p-8">
          {message && (
            <div className={`mb-6 p-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Publish Date</label>
                <p className="text-xs text-slate-500 mb-2">When should this post appear on the site?</p>
                <input 
                  type="date" 
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
                <p className="text-xs text-slate-500 mb-2">When should this post be removed?</p>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="border border-slate-300 rounded px-3 py-2 w-full"
                  required
                />
              </div>
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
                {loading ? "Uploading..." : "Upload Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Manage Posts Section */}
        <div className="bg-slate-100 p-6 md:p-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Manage Active Posts</h2>
          
          <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
            {activeAnnouncements.length === 0 && activeEvents.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm">No active posts found.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activeAnnouncements.map(a => (
                  <li key={`ann-${a.id}`} className="flex justify-between items-center p-4 hover:bg-slate-50 transition">
                    <span className="font-medium text-slate-800">{a.title}</span>
                    <button onClick={() => handleDelete('announcement', a.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition">Delete</button>
                  </li>
                ))}
                {activeEvents.map(e => {
                  const isScheduled = e.date > new Date().toISOString().split('T')[0];
                  return (
                    <li key={`evt-${e.id}`} className="flex justify-between items-center p-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-800">{e.title}</span>
                        {isScheduled && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wide">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleDelete('event', e.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition">Delete</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
      
      {/* Hidden canvas for text-to-image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
