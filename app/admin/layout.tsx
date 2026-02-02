"use client";
import React, { useState } from "react";
import Sidebar from "@/components/SideBar";
import { FaBars, FaTimes, FaBell, FaUserShield } from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* 1. Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* 2. Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        
        {/* 3. Admin Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
              <FaBell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none">Super Admin</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-widest">Control Room</p>
              </div>
              <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <FaUserShield size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* 4. Scrollable Admin Viewport */}
        <main className="p-8 overflow-y-auto h-[calc(100vh-5rem)] custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
