"use client";

import { useState } from "react";

/**
 * Newsletter form (client island used inside the server-rendered Footer).
 * Submits via fetch with inline success/error; falls back to a plain POST to
 * /api/v1/newsletter when JS is off (the route redirects home in that case).
 */
export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), company: data.get("company") }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("JazakAllahu Khairan — you're subscribed!");
        form.reset();
      } else if (res.status === 429) {
        setStatus("error");
        setMessage("Too many attempts. Please try again later.");
      } else {
        setStatus("error");
        setMessage("Please enter a valid email address.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      action="/api/v1/newsletter"
      method="post"
      onSubmit={onSubmit}
      className="w-full max-w-md"
    >
      {/* Honeypot — hidden from users; bot submissions are dropped server-side */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <div className="flex gap-3">
        <label htmlFor="footer-email" className="sr-only">Email address</label>
        <input
          id="footer-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className="flex-1 rounded-lg bg-white px-4 py-2.5 text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-gold px-5 py-2.5 font-semibold text-green hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60"
        >
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${status === "success" ? "text-cream" : "text-gold"}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
