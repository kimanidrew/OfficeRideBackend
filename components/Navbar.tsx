"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  FaUserCircle, FaSignOutAlt, FaRocket,
  FaTimes, FaChevronRight, FaIdCard, FaRoute, FaHome,
  FaCarSide, FaHeadset
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  if (isAdminPath) return null;

  const isTransparent = !isScrolled && (pathname === "/" || pathname === "/about");

  // Helper: get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 transition-all duration-500 p-4 lg:p-6">
        <nav
          className={`max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4 rounded-[2rem] transition-all duration-700 border ${
            isTransparent
              ? "bg-transparent border-transparent"
              : "bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-white/40"
          }`}
        >
          {/* Logo & Menu Toggle */}
          <div className="flex items-center gap-6">
            {user && (
              <button
                onClick={() => setIsOpen(true)}
                className="group flex flex-col gap-1.5 cursor-pointer"
              >
                <div
                  className={`h-1 w-8 rounded-full transition-all duration-300 ${
                    isTransparent ? "bg-white" : "bg-indigo-600"
                  } group-hover:w-10`}
                />
                <div
                  className={`h-1 w-5 rounded-full transition-all duration-300 ${
                    isTransparent ? "bg-white/60" : "bg-indigo-400"
                  } group-hover:w-8`}
                />
              </button>
            )}

            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
                <FaRocket className="text-white" size={18} />
              </div>
              <span
                className={`text-2xl font-black tracking-tighter transition-colors ${
                  isTransparent ? "text-white" : "text-slate-800"
                }`}
              >
                Office<span className="text-indigo-500">Ride</span>
              </span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div
                  className={`hidden md:block px-4 py-2 rounded-2xl border ${
                    isTransparent
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-slate-50 border-slate-100 text-slate-700"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">
                    Status
                  </p>
                  <p className="text-xs font-black mt-1 uppercase tracking-tighter">
                    Verified User
                  </p>
                </div>
                <Link
                  href="/"
                  className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <RiDashboardFill size={22} />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all"
              >
                Get Started
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[60] transition-opacity duration-700 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-[380px] bg-white z-[70] shadow-[30px_0_80px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-8 pb-10 pt-12 flex justify-between items-start">
          <div className="bg-indigo-50 p-4 rounded-3xl">
            <FaRocket className="text-indigo-600" size={24} />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="cursor-pointer p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* User Profile Area */}
        <div className="px-6 mb-5">
          <div className="p-6 bg-slate-900 rounded-[1rem] relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 text-white font-black text-lg">
                  {user ? getInitials(user.name) : <FaUserCircle className="text-4xl text-white/20" />}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 h-5 w-5 rounded-full border-4 border-slate-900" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-black text-xl leading-tight truncate">
                  {user ? user.name : "Guest"}
                </h3>
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-1">
                  {user ? user.email : "Not Logged In"}
                </p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 text-white/5 rotate-12 transition-transform group-hover:scale-110">
              <FaUserCircle size={120} />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Workspace</p>
          {[
            {name: "Overview Dashboard", path: "/", icon: <FaHome />},
            {name: "Managed Routes", path: "/routes", icon: <FaRoute />},
            {name: "Fleet Directory", path: "/drivers", icon: <FaIdCard />},
            {name: "Rides", path: "/rides", icon: <FaCarSide />},
            {name: "Customer Service", path: "/customer-service", icon: <FaHeadset />},
          ].map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between p-4.5 rounded-3xl transition-all group ${
                pathname === link.path 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" 
                : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-xl transition-colors ${pathname === link.path ? "text-white" : "text-indigo-400 group-hover:text-indigo-600"}`}>
                  {link.icon}
                </span>
                <span className={`text-sm font-black transition-colors ${pathname === link.path ? "text-white" : "text-slate-700"}`}>
                  {link.name}
                </span>
              </div>
              <FaChevronRight className={`text-xs transition-all duration-300 ${pathname === link.path ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} />
            </Link>
          ))}
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-slate-50">
          <button 
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full py-5 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <FaSignOutAlt /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
