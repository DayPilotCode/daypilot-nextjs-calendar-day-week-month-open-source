import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftAware",
  description: "Privacy-first shift management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-shift-surface text-slate-100">
        <div className="min-h-screen">
          <header className="border-b border-shift-border bg-[#0d1629] px-6 py-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  ShiftAware
                </p>
                <h1 className="text-lg font-semibold text-slate-50">
                  Core environment setup (Phase 0)
                </h1>
              </div>
              <span className="text-xs text-slate-400">
                Privacy-first • Single-password auth
              </span>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
