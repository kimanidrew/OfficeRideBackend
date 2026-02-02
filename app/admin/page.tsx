"use client";

import React, { useState } from "react"; 
import { 
  FaCity, FaUsers, FaRoute, FaChartLine 
} from "react-icons/fa";
import { IconType } from "react-icons"; // Import the IconType
import CompanyPage from "../pageComponents/CompanyPage";

export default function AdminDashboard() {
  // Store the Icon component (e.g., FaUsers) instead of the <FaUsers /> element
  const stats = [
    { label: "Active Drivers", value: "24", icon: FaUsers, color: "bg-blue-500", shadow: "shadow-blue-100" },
    { label: "Total Routes", value: "128", icon: FaRoute, color: "bg-indigo-500", shadow: "shadow-indigo-100" },
    { label: "Companies", value: "12", icon: FaCity, color: "bg-emerald-500", shadow: "shadow-emerald-100" },
    { label: "Daily Rides", value: "450", icon: FaChartLine, color: "bg-orange-500", shadow: "shadow-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-20">
      <main className="max-w-7xl mx-auto p-8 space-y-10 mt-4">
        
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Fleet Management System</p>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h2>
              <p className="text-slate-400 font-medium">Global control of routes, documents, and fleet activity.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              // Extract the Icon component and rename to uppercase for JSX usage
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group">
                  <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-xl ${stat.shadow} group-hover:scale-110 transition-transform`}>
                    {/* Render as a standard component with the size prop */}
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-1.5">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <CompanyPage/>
      </main>
    </div>
  );
}
