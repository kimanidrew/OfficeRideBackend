"use client";
import React, { useEffect, useState } from "react";
import { getRandomPhoto } from "../../lib/unsplash";
import { useUser } from "@/context/UserContext";
import { IoSyncCircleOutline } from "react-icons/io5"; // Ionicon spinner

export default function LoginPage() {
  const { setUser, setToken } = useUser();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPhoto() {
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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      alert("Login successful!");
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${photoUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="hero-overlay min-h-screen backdrop-blur-3xl">
        {/* Login Card */}
        <div className="relative bottom-0 z-10 w-full max-w-full bg-black/50 flex flex-row-reverse mt-30">
          <div className="w-[40%] pr-20 py-10">
            <p className="text-4xl font-bold text-center mb-10 text-white">
              Login to <span className="text-[#2e7d32]">OfficeRide</span>
            </p>
            <form onSubmit={handleLogin} className="space-y-7">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="font-[600] w-full px-5 py-4 text-bold bg-transparent border-2 rounded-full text-gray-400 focus:text-white focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="font-[600] w-full px-5 py-4 text-bold bg-transparent border-2 rounded-full text-gray-400 focus:text-white focus:outline-none focus:ring-1 focus:ring-[#2e7d32]"
              />
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full bg-[#2e7d32] opacity-80 text-white py-4 rounded-full font-[600] hover:opacity-100 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <IoSyncCircleOutline
                    className="animate-spin text-white"
                    size={25}
                  />
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Extra links */}
            <div className="mt-4 text-center text-sm text-gray-300">
              <p>
                Don’t have an account?{" "}
                <a
                  href="/signup"
                  className="text-[#2e7d32] font-bold hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
          <div className="w-[60%] flex flex-col justify-center p-20">
            <p className="text-6xl leading-4 font-black mb-10 text-[#2e7d32]">
              Smart, eco-friendly commuting for your workplace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
