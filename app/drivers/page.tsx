"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUserPlus, FaUsers, FaCheckCircle, FaChevronRight, 
  FaEnvelope, FaIdCard, FaSearch, FaUserShield, FaLock
} from "react-icons/fa";
import { MdOutlineVerifiedUser } from "react-icons/md";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    middleName: "", // Added
    lastName: "",
    email: "",
    password: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data);
  };

  useEffect(() => { loadDrivers(); }, []);

  const createDriver = async () => {
    if (!form.firstName || !form.email || !form.password) {
      return alert("Required: First Name, Email, Password");
    }
    setLoading(true);
    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ firstName: "", middleName: "", lastName: "", email: "", password: "", licenseNumber: "" });
    setLoading(false);
    loadDrivers();
  };

  const verifyDriver = async (id: string) => {
    await fetch(`/api/drivers/verify?driverId=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    loadDrivers();
  };

  const filteredDrivers = drivers.filter(d => 
    `${d.user.firstName} ${d.user.middleName || ''} ${d.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-30 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <FaUsers className="text-indigo-600" /> Fleet Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Control and authorize your company drivers.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Registration Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><FaUserPlus size={24} /></div>
              <h2 className="text-xl font-bold text-slate-800">Onboard Driver</h2>
            </div>
            
            <div className="space-y-4">
              <input
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
              <input
                placeholder="Middle Name (Optional)"
                value={form.middleName}
                onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
              />
              
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-4 text-slate-300" />
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 pl-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-4 top-4 text-slate-300" />
                <input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-3 pl-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                />
              </div>

              <div className="relative">
                <FaIdCard className="absolute left-4 top-4 text-slate-300" />
                <input
                  placeholder="License Number"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  className="w-full p-3 pl-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                />
              </div>

              <button
                onClick={createDriver}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:bg-slate-300 mt-4"
              >
                {loading ? "Processing..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>

        {/* Interactive List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative group">
            <FaSearch className="absolute left-5 top-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 shadow-sm rounded-3xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-medium text-slate-700"
            />
          </div>

          <div className="space-y-4">
            {filteredDrivers.map((d) => (
              <div
                key={d.id}
                onClick={() => router.push(`/drivers/${d.id}`)}
                className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 capitalize">
                    {d.user.firstName[0]}{d.user.lastName ? d.user.lastName[0] : ""}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {d.user.firstName} {d.user.middleName ? `${d.user.middleName} ` : ""}{d.user.lastName}
                      </h3>
                      {d.verified ? <MdOutlineVerifiedUser className="text-indigo-500" size={22} /> : <FaUserShield className="text-slate-300" size={18} />}
                    </div>
                    <p className="text-sm text-slate-400 font-medium flex items-center gap-2"><FaEnvelope size={12} /> {d.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  {!d.verified && (
                    <button
                      onClick={(e) => { e.stopPropagation(); verifyDriver(d.id); }}
                      className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-100 flex items-center gap-2 transition-all"
                    >
                      <FaCheckCircle /> Verify Now
                    </button>
                  )}
                  <div className="hidden md:flex h-10 w-10 bg-slate-50 rounded-full items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <FaChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
