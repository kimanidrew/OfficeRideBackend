"use client";
import React from "react";
import { 
  FaEnvelope, FaUserShield, FaCheckCircle, 
  FaChevronRight, FaClock, FaShieldAlt, FaExclamationTriangle 
} from "react-icons/fa";
import { MdOutlineVerifiedUser } from "react-icons/md";

interface Props {
  driver: any;
  onVerify: (id: string) => void;
  onClick: () => void;
}

export default function DriverCard({ driver, onVerify, onClick }: Props) {
  const d = driver;
  const isVerified = d.verified;

  return (
    <div 
      onClick={onClick} 
      className={`group relative overflow-hidden p-6 rounded-r-[2.5rem] border transition-all duration-500 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 
        ${isVerified 
          ? "bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50" 
          : "bg-amber-50/40 border-amber-100 shadow-sm hover:shadow-xl hover:shadow-amber-100/50"
        } hover:scale-[1.01]`}
    >
      {/* Dynamic Status Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 group-hover:w-2
        ${isVerified ? "bg-indigo-500 shadow-[2px_0_15px_rgba(79,70,229,0.3)]" : "bg-amber-500 shadow-[2px_0_15px_rgba(245,158,11,0.3)]"}`} 
      />

      <div className="flex items-center gap-6 relative z-10">
        {/* Avatar with Ring */}
        <div className={`relative shrink-0 h-20 w-20 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-all duration-500 group-hover:rotate-3 group-hover:scale-105
          ${isVerified 
            ? "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-200 ring-4 ring-indigo-50" 
            : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-200 ring-4 ring-amber-100"
          }`}
        >
          {d.user.firstName[0]}{d.user.lastName ? d.user.lastName[0] : ""}
          
          <div className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-xl flex items-center justify-center border-4 border-white shadow-lg
            ${isVerified ? "bg-indigo-600 text-white" : "bg-amber-500 text-white"}`}
          >
            {isVerified ? <MdOutlineVerifiedUser size={14} /> : <FaClock size={12} />}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
              {d.user.firstName} {d.user.middleName ? `${d.user.middleName} ` : ""}{d.user.lastName}
            </h3>
            
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5
              ${isVerified 
                ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                : "bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${isVerified ? "bg-indigo-500" : "bg-amber-500"}`} />
              {isVerified ? "Verified Fleet" : "Approval Pending"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
              <FaEnvelope className="text-slate-300" size={14} /> 
              {d.user.email}
            </p>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-tighter flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">ID {d.licenseNumber || "N/A"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto z-10">
        {!isVerified ? (
          <button
            onClick={(e) => { e.stopPropagation(); onVerify(d.id); }}
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <FaCheckCircle className="animate-bounce" /> Verify Account
          </button>
        ) : (
          <div className="hidden md:flex h-12 w-12 bg-slate-50 rounded-2xl items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100 shadow-inner">
            <FaChevronRight size={20} />
          </div>
        )}
      </div>

     
    </div>
  );
}
