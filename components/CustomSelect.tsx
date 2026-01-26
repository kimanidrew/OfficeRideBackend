"use client";
import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (v: string) => void;
  searchable?: boolean; // optional search input
}

export default function CustomSelect({
  value,
  options,
  placeholder = "Select",
  onChange,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Filter options if searchable
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

  // Close dropdown if clicked outside
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
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold rounded-md shadow-sm bg-white text-gray-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchable && (
            <div className="p-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
              />
            </div>
          )}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((o) => (
              <div
                key={o.value}
                className="font-semibold text-sm px-4 py-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 text-sm transition-colors"
                onMouseDown={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {o.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
