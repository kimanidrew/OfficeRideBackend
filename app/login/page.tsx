"use client";
import React, { useEffect, useState } from "react";
import { getRandomPhoto } from "../../lib/unsplash";
import { useUser } from "@/context/UserContext";
import { IoSyncCircleOutline } from "react-icons/io5";

export default function LoginPage() {
  const { setUser, setToken } = useUser();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPhoto() {
      // Ensure the Unsplash helper returns a high-quality URL
      const url = await getRandomPhoto("office,work,team,employees");
      setPhotoUrl(url);
    }
    fetchPhoto();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gray-900 bg-cover bg-center transition-all duration-700"
      style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : "none" }}
    >
      {/* Full-screen Overlay with Blur */}
      <div className="w-full min-h-screen bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
        
        {/* Main Glassmorphism Card */}
        <div className="flex flex-col md:flex-row-reverse w-full max-w-6xl bg-black/60 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          
          {/* Right Side: Login Form */}
          <div className="w-full md:w-[45%] p-8 lg:p-16 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-center mb-2 text-white">
              Login to <span className="text-[#4caf50]">OfficeRide</span>
            </h1>
            <p className="text-gray-400 text-center mb-10">Welcome back! Please enter your details.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] transition-all"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-[#4caf50] focus:ring-1 focus:ring-[#4caf50] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2e7d32] hover:bg-[#388e3c] disabled:bg-gray-600 text-white py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <IoSyncCircleOutline className="animate-spin" size={28} />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-gray-400">
              <p>
                Don’t have an account?{" "}
                <a href="/signup" className="text-[#4caf50] font-bold hover:underline">
                  Join OfficeRide
                </a>
              </p>
            </div>
          </div>

          {/* Left Side: Branding/Hero Text */}
          <div className="hidden md:flex w-[55%] flex-col justify-center p-12 lg:p-20 bg-gradient-to-br from-[#2e7d32]/20 to-transparent">
            <h2 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
              Smart, <span className="text-[#4caf50]">eco-friendly</span> commuting for your workplace.
            </h2>
            <p className="text-xl text-gray-300 max-w-md">
              Reduce your carbon footprint and save on your daily commute with our corporate carpooling network.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
