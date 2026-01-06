import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-shift-border bg-shift-surface px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-shift-accent focus:outline-none focus:ring-2 focus:ring-shift-accent/20 ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

