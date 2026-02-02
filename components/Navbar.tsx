"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { 
  FaUserCircle, FaSignOutAlt, FaRocket, 
  FaTimes, FaChevronRight, FaIdCard, FaRoute, FaHome 
} from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";

const Navbar = () => {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  if (isAdminPath) return null;

  const isTransparent = !isScrolled && (pathname === "/" || pathname === "/about");

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 transition-all duration-500 p-4">
        <nav className={`max-w-7xl mx-auto flex items-center justify-between px-8 py-3 rounded-[1.5rem] transition-all duration-500 border ${
          isTransparent 
          ? "bg-transparent border-transparent py-6" 
          : "bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 border-white/20"
        }`}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
              <FaRocket className="text-white" size={18} />
            </div>
            <span className={`text-2xl font-black tracking-tighter ${isTransparent ? "text-slate-900" : "text-slate-800"}`}>
              Office<span className="text-indigo-500">Ride</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={() => setIsOpen(true)}
                className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <RiDashboardFill size={22} />
                <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Menu</span>
              </button>
            ) : (
              <Link href="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all">
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* --- RIGHT SIDEBAR DRAWER --- */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed top-0 right-0 h-full w-full max-w-[350px] bg-white z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out p-8 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <FaTimes size={24} />
        </button>

        {/* User Profile Header - All Fixes Applied Here */}
        <div className="mt-8 mb-10 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              {(user as any)?.profilePicUrl ? (
                <img 
                  src={(user as any).profilePicUrl} 
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-50 shadow-sm" 
                  alt="Profile" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FaUserCircle className="text-4xl text-slate-200" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Account Manager</p>
              <h3 className="text-xl font-black text-slate-900 leading-tight truncate">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </h3>
              <p className="text-xs font-medium text-slate-500 truncate max-w-[180px]">{(user as any)?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
          {[
            {name: "Dashboard Home", path: "/", icon: <FaHome />},
            {name: "Route Management", path: "/routes", icon: <FaRoute />},
            {name: "Fleet Drivers", path: "/drivers", icon: <FaIdCard />},
          ].map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                pathname === link.path 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg ${pathname === link.path ? "text-indigo-600" : "text-slate-400"}`}>
                  {link.icon}
                </span>
                <span className="text-sm font-bold">{link.name}</span>
              </div>
              <FaChevronRight className={`text-xs transition-transform group-hover:translate-x-1 ${pathname === link.path ? "opacity-100" : "opacity-0"}`} />
            </Link>
          ))}
        </div>

        {/* Logout Footer */}
        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center justify-center gap-3 p-4 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
          >
            <FaSignOutAlt /> Sign Out Account
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
