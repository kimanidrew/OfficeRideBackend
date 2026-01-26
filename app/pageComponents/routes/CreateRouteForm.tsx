"use client";
import React, { useEffect, useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import CustomSelect from "@/components/CustomSelect";
import CustomRadio from "@/components/CustomRadio";

interface Company { id: string; companyName: string }
interface Location { id?: string; name: string; latitude: number; longitude: number; type?: "office" | "custom" }

export default function CreateRouteForm({ userId, onCreated }: { userId?: string; onCreated: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");

  const [officeLocations, setOfficeLocations] = useState<Location[]>([]);
  const [startType, setStartType] = useState<"office" | "custom">("office");
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [viaLocations, setViaLocations] = useState<Location[]>([]);
  const [endLocation, setEndLocation] = useState<Location | null>(null);

  const [distance, setDistance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSearch, setResetSearch] = useState(false);

  useEffect(() => { fetch("/api/company").then(r => r.json()).then(setCompanies); }, []);
  useEffect(() => {
    if (!companyId) return setOfficeLocations([]);
    fetch(`/api/company/offices?companyId=${companyId}`)
      .then(r => r.json())
      .then(setOfficeLocations);
  }, [companyId]);

  const calculateDistance = async (start: Location, end: Location, via: Location[]) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const waypoints = via.map(v => `${v.latitude},${v.longitude}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${apiKey}${waypoints ? `&waypoints=${waypoints}` : ""}`;
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.routes?.[0]?.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0) / 1000 || 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !startLocation || !endLocation) return;
    setSubmitting(true);
    try {
      const d = await calculateDistance(startLocation, endLocation, viaLocations);
      setDistance(d);

      await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, adminId: userId, start: startLocation, via: viaLocations, end: endLocation, distance: d }),
      });

      onCreated();
      setStartLocation(null);
      setViaLocations([]);
      setEndLocation(null);
      setDistance(null);
      setResetSearch(true);
      setTimeout(() => setResetSearch(false), 0);
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white/70 rounded-xl shadow-2xl px-6 py-8 space-y-5 w-full max-w-md">
      <h2 className="text-3xl font-bold text-indigo-700">Create Route</h2>

      <CustomSelect
        value={companyId}
        placeholder="Select Company"
        options={companies.map(c => ({ value: c.id, label: c.companyName }))}
        onChange={setCompanyId}
      />

      <div className="flex gap-2">
        <CustomRadio value="office" selected={startType} label="Office" onChange={setStartType} />
        <CustomRadio value="custom" selected={startType} label="Custom" onChange={setStartType} />
      </div>

      {startType === "office" ? (
        <>
          <CustomSelect
            value={startLocation?.id || ""}
            placeholder="Select Office"
            options={officeLocations.map(o => ({ value: o.id!, label: o.name }))}
            onChange={id => setStartLocation(officeLocations.find(o => o.id === id)!)}
          />
          <LocationSearch label="Add New Office Location" value="" onSelect={loc => setStartLocation({ ...loc, type: "office" })} resetSignal={resetSearch} />
        </>
      ) : (
        <LocationSearch label="Custom Start" value="" onSelect={loc => setStartLocation({ ...loc, type: "custom" })} resetSignal={resetSearch} />
      )}

      {viaLocations.map((_, i) => (
        <LocationSearch key={i} label={`Stop ${i + 1}`} value="" onSelect={loc => {
          const updated = [...viaLocations];
          updated[i] = { ...loc, type: "custom" };
          setViaLocations(updated);
        }} resetSignal={resetSearch} />
      ))}

      <button type="button" onClick={() => setViaLocations([...viaLocations, { name: "", latitude: 0, longitude: 0 }])} className="text-sm font-bold text-indigo-600">
        + Add Stop
      </button>

      <LocationSearch label="End Location" value="" onSelect={loc => setEndLocation({ ...loc, type: "custom" })} resetSignal={resetSearch} />

      {distance !== null && <p className="text-sm font-semibold text-indigo-700">Calculated Distance: {distance.toFixed(2)} km</p>}

      <button type="submit" disabled={submitting} className="cursor-pointer w-full py-3 rounded-md font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600">
        {submitting ? "Saving..." : "Add Route"}
      </button>
    </form>
  );
}
