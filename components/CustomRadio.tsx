"use client";
import React from "react";

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
      className={`px-4 py-2 rounded-full font-bold text-sm transition cursor-pointer
        ${active 
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105" 
          : "bg-white/70 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"}`
      }
    >
      {label}
    </button>
  );
}
