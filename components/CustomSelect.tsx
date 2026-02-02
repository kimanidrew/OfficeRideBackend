"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaSearch, FaCheck } from "react-icons/fa";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (v: string) => void;
  searchable?: boolean;
}

export default function CustomSelect({
  value,
  options,
  placeholder = "Select Option",
  onChange,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (searchable && query) {
      setFilteredOptions(
        options.filter((o) =>
          o.label.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [query, options, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full group" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex justify-between items-center px-4 py-3.5 text-sm font-bold rounded-xl border transition-all duration-200 outline-none shadow-sm ${
          open 
            ? "bg-white border-indigo-500 ring-4 ring-indigo-500/10" 
            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
        }`}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected?.label || placeholder}
        </span>
        <FaChevronDown 
          size={12} 
          className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-indigo-500" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {searchable && (
            <div className="p-3 border-b border-slate-50 relative">
              <FaSearch size={12} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search options..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500/10 text-sm font-semibold outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <div
                  key={o.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200 ${
                    value === o.value 
                      ? "bg-indigo-50 text-indigo-700 font-black" 
                      : "hover:bg-slate-50 text-slate-600 font-bold hover:text-indigo-600"
                  }`}
                >
                  <span className="text-sm">{o.label}</span>
                  {value === o.value && <FaCheck size={10} className="text-indigo-500" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                No Results Found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
