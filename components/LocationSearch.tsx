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
    <div className="space-y-1 relative">
      <label className="block">{label}</label>
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
        className="border p-2 w-full"
      />
      {isFocused && options.length > 0 && (
        <ul className="absolute z-10 border bg-white w-full max-h-60 overflow-y-auto">
          {options.map((o) => (
            <li
              key={o.placeId}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onMouseDown={() => handleSelect(o.placeId, o.description)}
            >
              {o.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
