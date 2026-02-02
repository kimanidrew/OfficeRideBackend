"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { FaUserCircle, FaSignOutAlt, FaRocket, FaBell } from "react-icons/fa";
import { RiDashboardFill } from "react-icons/ri";

const Navbar = () => {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isAdminPath = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide the global navbar entirely if we are deep in admin pages
  if (isAdminPath) return null;

  const isTransparent = !isScrolled && (pathname === "/" || pathname === "/about");

  return (
    <div className="fixed top-0 left-0 w-full z-50 transition-all duration-500 p-4">
      <nav className={`max-w-7xl mx-auto flex items-center justify-between px-8 py-3 rounded-2xl transition-all duration-500 border ${
        isTransparent 
        ? "bg-transparent border-transparent py-6" 
        : "bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 border-white/20"
      }`}>
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
            <FaRocket className="text-white" size={18} />
          </div>
          <span className={`text-2xl font-black tracking-tighter ${isTransparent ? "text-black" : "text-slate-800"}`}>
            Office<span className="text-indigo-500">Ride</span>
          </span>
        </Link>

        {/* Links */}
        <ul className="hidden lg:flex items-center gap-2">
          {[{name: "Home", path: "/"}, {name: "Routes", path: "/routes"}, {name: "Drivers", path: "/drivers"}].map((link) => (
            <Link key={link.path} href={link.path} className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
              pathname === link.path 
              ? (isTransparent ? "text-black underline underline-offset-8" : "text-indigo-600") 
              : (isTransparent ? "text-black/60 hover:text-white" : "text-slate-500 hover:text-indigo-500")
            }`}>
              {link.name}
            </Link>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/admin" className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all">
                <RiDashboardFill size={20} />
              </Link>
              <button onClick={logout} className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all">
                <FaSignOutAlt size={18} />
              </button>
            </>
          ) : (
            <Link href="/login" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
              Login
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
