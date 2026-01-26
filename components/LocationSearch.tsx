"use client";
import React, { useState, useEffect, useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input when resetSignal changes
  useEffect(() => {
    if (resetSignal) {
      setQuery("");
      setOptions([]);
    }
  }, [resetSignal]);

  // Fetch autocomplete options when query changes and input is focused
  useEffect(() => {
    if (!isFocused || query.length < 3) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
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
      }
    };

    fetchOptions();
  }, [query, isFocused]);

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(`/api/location-details?placeId=${placeId}`);
      if (res.ok) {
        const loc: LocationResult = await res.json();

        // Override the name with the description so you save/display that
        const locWithDescription: LocationResult = {
          ...loc,
          name: description,
        };

        onSelect(locWithDescription);
        setQuery(description); // show chosen description in input
        setOptions([]); // close dropdown
        setIsFocused(false); // prevent dropdown from reopening immediately

        // blur the input so dropdown closes
        inputRef.current?.blur();
      }
    } catch (err) {
      console.error("Failed to fetch location details", err);
    }
  };

  return (
    <div className="space-y-2 relative w-full">
      <label className="block font-semibold text-gray-700 text-sm mb-2">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // small timeout so click on option registers before blur clears
          setTimeout(() => setIsFocused(false), 100);
        }}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
        className="text-sm font-semibold rounded-md px-3 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
      />
      {isFocused && options.length > 0 && (
        <ul className="absolute z-20 mt-1 py-2 border border-gray-200 bg-white w-full max-h-60 overflow-y-auto rounded-lg shadow-lg">
          {options.map((o) => (
            <li
              key={o.placeId}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm font-semibold text-gray-700 transition-colors"
              onMouseDown={() => handleSelect(o.placeId, o.description)}
            >
              {o.description}
            </li>
          ))}
        </ul>
      )}
      {isFocused && query.length >= 3 && options.length === 0 && (
        <div className="absolute z-20 mt-1 border border-gray-200 bg-white w-full rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
}
