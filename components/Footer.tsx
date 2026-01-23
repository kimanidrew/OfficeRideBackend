"use client";
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-[#2e7d32] py-8 px-5">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
        {/* Logo / Brand */}
        <div className="mb-6 md:mb-0">
          <Link href="/" className="text-4xl font-bold text-[#2e7d32] hover:text-blue-400 transition">
            OfficeRide
          </Link>
          <p className="text-sm text-gray-500 mt-2 font-[400]">
            Making your office commute easier and smarter.
          </p>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 mb-6 md:mb-0 font-[600]">
          <li>
            <Link href="/" className="hover:opacity-75 transition">Home</Link>
          </li>
          <li>
            <Link href="/rides" className="hover:opacity-75 transition">Rides</Link>
          </li>
          <li>
            <Link href="/bookings" className="hover:opacity-75 transition">Bookings</Link>
          </li>
          <li>
            <Link href="/about" className="hover:opacity-75 transition">About</Link>
          </li>
          <li>
            <Link href="/about" className="hover:opacity-75 transition">Contact us</Link>
          </li>
          <li>
            <Link href="/about" className="hover:opacity-75 transition">Help</Link>
          </li>
        </ul>

        {/* Social Icons */}
        <div className="flex space-x-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2e7d32] transition">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2e7d32]/50 mt-8 pt-4 text-center text-sm text-#2e7d32 font-[500]">
        © {new Date().getFullYear()} OfficeRide. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
