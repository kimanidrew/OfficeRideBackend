"use client";
import React, { useState, useEffect } from "react";

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
}: {
  label: string;
  value?: string;
  onSelect: (loc: LocationResult) => void;
}) {
  const [query, setQuery] = useState(value || "");
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    if (query.length < 3) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/search-location?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };

    fetchOptions();
  }, [query]);

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(`/api/location-details?placeId=${placeId}`);
      if (res.ok) {
        const loc: LocationResult = await res.json();
        onSelect(loc);
        setQuery(description); // show chosen description
        setOptions([]);
      }
    } catch (err) {
      console.error("Failed to fetch location details", err);
    }
  };

  return (
    <div className="space-y-1 relative">
      <label className="block">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 w-full"
      />
      {options.length > 0 && (
        <ul className="absolute z-10 border bg-white w-full max-h-60 overflow-y-auto">
          {options.map((o) => (
            <li
              key={o.placeId}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(o.placeId, o.description)}
            >
              {o.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
