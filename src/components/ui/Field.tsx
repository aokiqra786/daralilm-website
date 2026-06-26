"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";

/**
 * Field — labelled form controls with built-in error handling.
 *
 * - Always paired with a real <label htmlFor> (never placeholder-as-label).
 * - Error message is wired via aria-describedby + aria-invalid.
 * - Explicit text/bg/placeholder colors so inputs stay legible in dark mode
 *   (fixes the live contrast bug — never inherit).
 *
 * Usage:
 *   <Input label="Email" name="email" type="email" required />
 *   <Select label="Program" name="program"><option>…</option></Select>
 *   <Textarea label="Notes" name="notes" error="Required" />
 */
const CONTROL =
  "w-full rounded-md border border-line bg-white px-4 py-2.5 text-ink placeholder-muted " +
  "outline-none transition-colors focus:border-green focus:ring-2 focus:ring-gold/40 " +
  "disabled:bg-parchment disabled:cursor-not-allowed " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30";

function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {error}
    </p>
  );
}

type Base = { label: string; error?: string };

export function Input({ label, error, id, required, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  const errId = `${fieldId}-error`;
  return (
    <div>
      <Label htmlFor={fieldId} required={required}>{label}</Label>
      <input
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={CONTROL}
        {...props}
      />
      <ErrorText id={errId} error={error} />
    </div>
  );
}

export function Textarea({ label, error, id, required, ...props }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  const errId = `${fieldId}-error`;
  return (
    <div>
      <Label htmlFor={fieldId} required={required}>{label}</Label>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={CONTROL}
        {...props}
      />
      <ErrorText id={errId} error={error} />
    </div>
  );
}

export function Select({ label, error, id, required, children, ...props }: Base & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fieldId = id ?? auto;
  const errId = `${fieldId}-error`;
  return (
    <div>
      <Label htmlFor={fieldId} required={required}>{label}</Label>
      <select
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        className={CONTROL}
        {...props}
      >
        {children}
      </select>
      <ErrorText id={errId} error={error} />
    </div>
  );
}
