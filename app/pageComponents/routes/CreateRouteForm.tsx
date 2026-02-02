"use client";

import React, { useEffect, useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import CustomSelect from "@/components/CustomSelect";
import CustomRadio from "@/components/CustomRadio";
import { FaMapMarkerAlt, FaFlagCheckered, FaPlus, FaTrash, FaRoute, FaBuilding } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";

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

  const removeViaLocation = (index: number) => {
    setViaLocations(viaLocations.filter((_, i) => i !== index));
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
        body: JSON.stringify({ 
            companyId, 
            adminId: userId, 
            start: startLocation, 
            via: viaLocations, 
            end: endLocation, 
            distance: d 
        }),
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
    <form onSubmit={submit} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 space-y-6 w-full max-w-lg transition-all duration-300">
      <div className="flex items-center gap-3 border-b border-indigo-50 pb-4">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <FaRoute size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Route</h2>
            <p className="text-slate-500 text-xs font-medium">Define your fleet pickup and drop points</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FaBuilding /> Corporate Assignment
        </label>
        <CustomSelect
          value={companyId}
          placeholder="Select Company"
          options={companies.map(c => ({ value: c.id, label: c.companyName }))}
          onChange={setCompanyId}
        />
      </div>

      {/* Start Point Logic */}
      <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MdMyLocation className="text-indigo-500" size={18} /> Origin Point
        </label>
        
        <div className="flex p-1 bg-white rounded-xl border border-slate-200 w-fit gap-2">
          <CustomRadio value="office" selected={startType} label="Office" onChange={setStartType} />
          <CustomRadio value="custom" selected={startType} label="Custom" onChange={setStartType} />
        </div>

        {startType === "office" ? (
          <div className="space-y-3">
            <CustomSelect
              value={startLocation?.id || ""}
              placeholder="Select Registered Office"
              options={officeLocations.map(o => ({ value: o.id!, label: o.name }))}
              onChange={id => setStartLocation(officeLocations.find(o => o.id === id)!)}
            />
            <div className="pt-2">
                <LocationSearch label="Register New Office" value="" onSelect={loc => setStartLocation({ ...loc, type: "office" })} resetSignal={resetSearch} />
            </div>
          </div>
        ) : (
          <LocationSearch label="Pick Custom Origin" value="" onSelect={loc => setStartLocation({ ...loc, type: "custom" })} resetSignal={resetSearch} />
        )}
      </div>

      {/* Via Stops */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-400" /> Intermediate Stops
            </label>
            <button 
                type="button" 
                onClick={() => setViaLocations([...viaLocations, { name: "", latitude: 0, longitude: 0 }])} 
                className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-indigo-600 hover:text-white transition-all"
            >
                <FaPlus size={10} /> Add Stop
            </button>
        </div>

        <div className="space-y-3">
            {viaLocations.map((_, i) => (
                <div key={i} className="flex items-center gap-2 group animate-in slide-in-from-left-2 duration-200">
                    <div className="flex-1">
                        <LocationSearch label={`Stop ${i + 1}`} value="" onSelect={loc => {
                            const updated = [...viaLocations];
                            updated[i] = { ...loc, type: "custom" };
                            setViaLocations(updated);
                        }} resetSignal={resetSearch} />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeViaLocation(i)} 
                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                        <FaTrash size={14} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* End Point */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FaFlagCheckered className="text-emerald-500" /> Destination
        </label>
        <LocationSearch label="Final Drop-off Location" value="" onSelect={loc => setEndLocation({ ...loc, type: "custom" })} resetSignal={resetSearch} />
      </div>

      {/* Footer / Results */}
      <div className="pt-4 border-t border-slate-100">
          {distance !== null && (
            <div className="mb-4 bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
                <span className="text-xs font-bold text-indigo-400 uppercase">Estimated Distance</span>
                <span className="text-lg font-black text-indigo-700">{distance.toFixed(2)} KM</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={submitting || !startLocation || !endLocation} 
            className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
          >
            {submitting ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Calculating & Saving...
                </span>
            ) : "Confirm & Save Route"}
          </button>
      </div>
    </form>
  );
}
