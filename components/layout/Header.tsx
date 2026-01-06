"use client";

import React from "react";
import { LogOut, Settings, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  alias?: string;
  avatarEmoji?: string;
}

export function Header({ alias = "Admin", avatarEmoji = "🐺" }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-primary-500 p-1.5 rounded-lg text-white">
          <span className="text-xl">🌟</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          ShiftAware
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-2xl shadow-inner border border-primary-100">
              {avatarEmoji}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{alias}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Administrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <button 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

