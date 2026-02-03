"use client";
import React from "react";
import { FaUserPlus, FaEnvelope, FaLock, FaIdCard, FaUserTag } from "react-icons/fa";

interface Props {
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function DriverOnboardingForm({ form, setForm, onSubmit, loading }: Props) {
  // Enhanced input base with inner shadow and better focus states
  const inputBase = "w-full p-3.5 bg-slate-50 border border-transparent rounded-2xl shadow-inner focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 outline-none text-sm font-bold text-slate-700 transition-all placeholder:text-slate-300";

  return (
    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white sticky top-28 transition-all duration-500">
      {/* Header with Icon Group */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-200 animate-in zoom-in-50 duration-500">
          <FaUserPlus size={22} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Onboard Driver</h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Digital Registration</p>
        </div>
      </div>
      
      <div className="space-y-5">
        {/* Name Fields */}
        <div className="space-y-4">
          <div className="relative group">
            <input 
              placeholder="First Name" 
              value={form.firstName} 
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
              className={inputBase} 
            />
          </div>
          <input 
            placeholder="Middle Name (Optional)" 
            value={form.middleName} 
            onChange={(e) => setForm({ ...form, middleName: e.target.value })} 
            className={inputBase} 
          />
          <input 
            placeholder="Last Name" 
            value={form.lastName} 
            onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
            className={inputBase} 
          />
        </div>
        
        {/* Email Field */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
            <FaEnvelope size={14} />
          </div>
          <input 
            placeholder="Email" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            className={`${inputBase} pl-12`} 
          />
        </div>

        {/* Password Field */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
            <FaLock size={14} />
          </div>
          <input 
            placeholder="Access Password" 
            type="password" 
            value={form.password} 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            className={`${inputBase} pl-12`} 
          />
        </div>

        {/* License Field */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
            <FaIdCard size={14} />
          </div>
          <input 
            placeholder="Driver's License No." 
            value={form.licenseNumber} 
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} 
            className={`${inputBase} pl-12`} 
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button 
            onClick={onSubmit} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-xs uppercase tracking-[0.2em] py-4.5 rounded-2xl transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating...
              </span>
            ) : (
              "Authorize Account"
            )}
          </button>
        </div>
      </div>
      
      {/* Policy Footer */}
      <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-6 px-4">
        By authorizing, you confirm compliance with corporate transport policies.
      </p>
    </div>
  );
}
