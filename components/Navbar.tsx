"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

const Navbar = () => {
  const { user, logout } = useUser();
  const pathname = usePathname();
  const [isTop, setIsTop] = useState(true);
  const [storedUser, setStoredUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsTop(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll);

    const savedUser = localStorage.getItem("user");
    if (savedUser) setStoredUser(JSON.parse(savedUser));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transparentPages = ["/", "/login", "/signup", "/about"];
  const isTransparentPage = transparentPages.includes(pathname);
  const isTransparent = isTransparentPage && isTop;

  const navbarClass = isTransparent ? "navbar transparent" : "navbar solid";

  // Dynamic link styles
  const linkClass = isTransparent
    ? "text-white/50 hover:text-white transition"
    : "text-black hover:text-black/70 transition";

  // Conditionally add backdrop blur only when solid
  const backdropClass = isTransparent ? "" : "bg-white/90 backdrop-blur-3xl";

  return (
    <nav
      className={`${navbarClass} ${backdropClass} flex items-center justify-between px-6 py-4 shadow-md z-30`}
    >
      {/* Logo links to home */}
      <div className="flex items-center space-x-2">
        <Link
          href="/"
          className={`text-3xl font-bold logo transition ${
            isTransparent
              ? "text-white hover:text-gray-200"
              : "text-green-700 hover:text-green-900"
          }`}
        >
          OfficeRide
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="hidden md:flex space-x-6 font-medium">
        <li>
          <Link href="/" className={linkClass}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/routes" className={linkClass}>
          Routes
          </Link>
        </li>
        <li>
          <Link href="/bookings" className={linkClass}>
            Companies
          </Link>
        </li>
         <li>
          <Link href="/bookings" className={linkClass}>
            Drivers
          </Link>
        </li>
      </ul>

      {/* User Greeting */}
      <div className="flex items-center space-x-4">
        {user || storedUser ? (
          <div className="flex items-center space-x-3">
          <span
            className={
              isTransparent
                ? "text-white font-semibold transition"
                : "text-green-700 font-semibold transition"
            }
          >
            Hello, {(user || storedUser).name}
          </span>
          <button onClick={logout} className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded" >
            Logout
          </button>
          </div>
        ) : (
          <Link href="/login" className="btn login text-sm">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
