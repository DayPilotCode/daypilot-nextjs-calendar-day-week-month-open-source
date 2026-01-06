import { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className = "", children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg border border-shift-border bg-shift-surface px-4 py-2 text-slate-100 focus:border-shift-accent focus:outline-none focus:ring-2 focus:ring-shift-accent/20 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

