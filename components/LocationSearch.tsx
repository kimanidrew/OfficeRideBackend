"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
}

interface Option {
  description: string;
  placeId: string;
}

export default function LocationSearch({
  label,
  value,
  onSelect,
  resetSignal,
}: {
  label: string;
  value?: string;
  onSelect: (loc: LocationResult) => void;
  resetSignal?: boolean;
}) {
  const [query, setQuery] = useState(value || "");
  const [options, setOptions] = useState<Option[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input when resetSignal changes
  useEffect(() => {
    if (resetSignal) {
      setQuery("");
      setOptions([]);
    }
  }, [resetSignal]);

  // Fetch autocomplete options
  useEffect(() => {
    if (!isFocused || query.length < 3) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search-location?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setOptions(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch options", err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchOptions, 300);
    return () => clearTimeout(debounce);
  }, [query, isFocused]);

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(`/api/location-details?placeId=${placeId}`);
      if (res.ok) {
        const loc: LocationResult = await res.json();

        const locWithDescription: LocationResult = {
          ...loc,
          name: description,
        };

        onSelect(locWithDescription);
        setQuery(description);
        setOptions([]);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    } catch (err) {
      console.error("Failed to fetch location details", err);
    }
  };

  return (
    <div className="space-y-1.5 relative w-full group">
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          {isLoading ? (
            <FaSpinner className="animate-spin" size={14} />
          ) : (
            <FaSearch size={14} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter address or landmark..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Results Dropdown */}
      {isFocused && (options.length > 0 || (query.length >= 3 && !isLoading)) && (
        <ul className="absolute z-[100] mt-2 w-full bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {options.length > 0 ? (
            options.map((o) => (
              <li
                key={o.placeId}
                className="px-4 py-3.5 cursor-pointer hover:bg-indigo-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-none"
                onMouseDown={(e) => {
                    e.preventDefault(); // prevents blur before click
                    handleSelect(o.placeId, o.description);
                }}
              >
                <FaMapMarkerAlt className="text-indigo-400 mt-1 shrink-0" size={12} />
                <span className="text-sm font-bold text-slate-600 leading-tight">
                  {o.description}
                </span>
              </li>
            ))
          ) : query.length >= 3 && !isLoading && (
            <li className="px-4 py-8 text-center">
              <p className="text-sm font-bold text-slate-400">No locations found</p>
              <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter">Try a different search term</p>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
