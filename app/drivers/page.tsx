"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUsers, FaSearch, FaChartPie, FaUserCheck, FaUserClock } from "react-icons/fa";
import DriverCard from "./components/DriverCard";
import DriverOnboardingForm from "./components/DriverOnboardingForm";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", email: "", password: "", licenseNumber: "" });
  const router = useRouter();

  const loadDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data || []);
  };

  useEffect(() => { loadDrivers(); }, []);

  const createDriver = async () => {
    if (!form.firstName || !form.email || !form.password) return alert("Required fields missing");
    setLoading(true);
    await fetch("/api/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ firstName: "", middleName: "", lastName: "", email: "", password: "", licenseNumber: "" });
    setLoading(false);
    loadDrivers();
  };

  const verifyDriver = async (id: string) => {
    await fetch(`/api/drivers/verify?driverId=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verified: true }) });
    loadDrivers();
  };

  const filteredDrivers = drivers.filter(d => 
    `${d.user.firstName} ${d.user.middleName || ''} ${d.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Fleet", value: drivers.length, icon: <FaChartPie />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Verified", value: drivers.filter(d => d.verified).length, icon: <FaUserCheck />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending", value: drivers.filter(d => !d.verified).length, icon: <FaUserClock />, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="w-full px-20 pt-30  bg-[#f8fafc] min-h-screen">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div className="space-y-2">
          <p className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.3em]">Fleet Administration</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            Fleet Management
          </h1>
          <p className="text-slate-500 font-medium max-w-md">Onboard, verify, and monitor your global network of professional drivers.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 lg:flex-none bg-white p-4 rounded-3xl shadow-sm border border-slate-100 min-w-[120px]">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 text-lg`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Registration Sidebar */}
        <div className="lg:col-span-4 h-fit sticky top-28">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <DriverOnboardingForm form={form} setForm={setForm} onSubmit={createDriver} loading={loading} />
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-8 space-y-8">
          {/* Search Bar with Glass effect */}
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10">
              <FaSearch size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, email, or license..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2rem] py-6 pl-16 pr-8 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-lg font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>

          {/* Driver Cards Container */}
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredDrivers.length > 0 ? (
              filteredDrivers.map((d) => (
                <DriverCard 
                  key={d.id} 
                  driver={d} 
                  onVerify={verifyDriver} 
                  onClick={() => router.push(`/drivers/${d.id}`)} 
                />
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-slate-200 text-3xl" />
                </div>
                <p className="text-slate-400 font-bold text-xl tracking-tight">No drivers found matching your search</p>
                <button onClick={() => setSearchTerm("")} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
