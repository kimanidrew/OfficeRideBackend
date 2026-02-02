"use client";

import React, { useState, useEffect } from "react";
import LocationSearch from "@/components/LocationSearch";
import { 
  FaRoute, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, 
  FaMapMarkerAlt, FaFlagCheckered, FaChevronRight, FaSearch 
} from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";

interface Location { name: string; latitude: number; longitude: number; }
interface Route {
  id: string;
  company: { companyName: string };
  startLocation: Location;
  endLocation: Location;
  distance: number;
  stops: { location: Location }[];
}

export default function RoutesList({ routes, reload }: { routes: Route[]; reload: () => void; }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Location | null>(null);
  const [editEnd, setEditEnd] = useState<Location | null>(null);
  const [editStops, setEditStops] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const routesPerPage = 5;

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [routes]);

  const startEdit = (r: Route) => {
    setEditingId(r.id);
    setEditStart(r.startLocation);
    setEditEnd(r.endLocation);
    setEditStops(r.stops.map((s) => s.location));
  };

  const calculateDistance = async (start: Location, end: Location, via: Location[]): Promise<number> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const waypoints = via.map((v) => `${v.latitude},${v.longitude}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${apiKey}${waypoints ? `&waypoints=${waypoints}` : ""}`;
    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.routes?.[0]?.legs.reduce((sum: number, leg: any) => sum + leg.distance.value, 0) / 1000 || 0;
  };

  const save = async (r: Route) => {
    if (!editStart || !editEnd) return;
    setSavingId(r.id);
    try {
      const distance = await calculateDistance(editStart, editEnd, editStops);
      await fetch("/api/routes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId: r.id, start: editStart, end: editEnd, via: editStops, distance }),
      });
      setEditingId(null);
      reload();
    } finally { setSavingId(null); }
  };

  const remove = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/routes?id=${id}`, { method: "DELETE" });
      reload();
    } finally { setDeletingId(null); }
  };

  const filteredRoutes = routes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return r.startLocation.name.toLowerCase().includes(q) || r.endLocation.name.toLowerCase().includes(q) || 
           r.stops.some((s) => s.location.name.toLowerCase().includes(q)) || r.company.companyName.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
  const startIndex = (currentPage - 1) * routesPerPage;
  const currentRoutes = filteredRoutes.slice(startIndex, startIndex + routesPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <FaRoute className="text-indigo-600" /> Active Routes
        </h2>
        <div className="relative w-full md:w-96 group">
          <FaSearch className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter by company, stop, or city..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white rounded-2xl pl-11 pr-5 py-3.5 border-none shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-5">
          {currentRoutes.map((r) => (
            <div key={r.id} className="bg-white rounded-[1rem] shadow-xl shadow-slate-200/50 border border-slate-50 p-6 transition-all">
              {editingId === r.id ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                    <LocationSearch label="Edit Origin" value={editStart?.name || ""} onSelect={setEditStart} />
                    
                    <div className="space-y-3">
                      {editStops.map((stop, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <div className="flex-1">
                            <LocationSearch label={`Stop ${i + 1}`} value={stop?.name || ""} onSelect={(loc) => {
                              const updated = [...editStops];
                              updated[i] = loc;
                              setEditStops(updated);
                            }} />
                          </div>
                          <button onClick={() => setEditStops(editStops.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => setEditStops([...editStops, { name: "", latitude: 0, longitude: 0 }])} className="cursor-pointer flex items-center gap-2 text-xs font-bold text-indigo-600 bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all">
                      <FaPlus /> ADD INTERMEDIATE STOP
                    </button>

                    <LocationSearch label="Edit Destination" value={editEnd?.name || ""} onSelect={setEditEnd} />
                  </div>

                  <div className="flex gap-3 justify-end px-2">
                    <button onClick={() => setEditingId(null)} className="cursor-pointer px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={() => save(r)} disabled={savingId === r.id} className="cursor-pointer px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2">
                      {savingId === r.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave />}
                      {savingId === r.id ? "Calculating..." : "Update Route"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {r.company.companyName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-xs font-bold flex items-center gap-1">
                         {r.distance.toFixed(1)} KM
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <MdMyLocation className="text-indigo-500" /> {r.startLocation.name}
                      </div>
                      
                      {r.stops.map((s, idx) => (
                        <React.Fragment key={idx}>
                          <FaChevronRight className="text-slate-300" size={12} />
                          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <FaMapMarkerAlt className="text-orange-400" size={10} /> {s.location.name}
                          </div>
                        </React.Fragment>
                      ))}

                      <FaChevronRight className="text-slate-300" size={12} />
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <FaFlagCheckered className="text-emerald-500" /> {r.endLocation.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    <button onClick={() => startEdit(r)} className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                      <FaEdit size={14} /> Edit
                    </button>
                    <button onClick={() => remove(r.id)} disabled={deletingId === r.id} className="cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-rose-500 border border-rose-50 font-bold px-5 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                      {deletingId === r.id ? <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" /> : <FaTrash size={14} />}
                      {deletingId === r.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredRoutes.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[1rem] border-4 border-dashed border-slate-100">
              <FaRoute className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold text-lg">No routes found for your query.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
