import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-shift-border bg-[#0d1629] p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}

