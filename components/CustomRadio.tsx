"use client";
import React from "react";
import { FaBuilding, FaMapMarkerAlt } from "react-icons/fa";

interface CustomRadioProps {
  value: "office" | "custom";
  selected: "office" | "custom";
  label: string;
  onChange: (v: "office" | "custom") => void;
}

export default function CustomRadio({ value, selected, label, onChange }: CustomRadioProps) {
  const active = value === selected;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer outline-none
        ${active 
          ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-500/20" 
          : "bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 border border-transparent shadow-sm hover:border-slate-100"}`
      }
    >
      {/* Icon support for better visual cue */}
      {value === "office" ? (
        <FaBuilding className={active ? "text-white" : "text-slate-300"} size={12} />
      ) : (
        <FaMapMarkerAlt className={active ? "text-white" : "text-slate-300"} size={12} />
      )}
      
      {label}

      {/* Subtle bottom indicator for active state */}
      {active && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/40 rounded-full" />
      )}
    </button>
  );
}
