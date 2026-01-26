"use client";

import React, { useState } from "react";
import LocationSearch from "@/components/LocationSearch";

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  company: { companyName: string };
  startLocation: Location;
  endLocation: Location;
  distance: number;
  stops: { location: Location }[];
}

export default function RoutesList({
  routes,
  reload,
}: {
  routes: Route[];
  reload: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState<Location | null>(null);
  const [editEnd, setEditEnd] = useState<Location | null>(null);
  const [editStops, setEditStops] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const routesPerPage = 5;

  const startEdit = (r: Route) => {
    setEditingId(r.id);
    setEditStart(r.startLocation);
    setEditEnd(r.endLocation);
    setEditStops(r.stops.map((s) => s.location));
  };

  // Helper: calculate distance using Google Directions API
  const calculateDistance = async (
    start: Location,
    end: Location,
    via: Location[]
  ): Promise<number> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const waypoints = via.map((v) => `${v.latitude},${v.longitude}`).join("|");
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&key=${apiKey}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }`;

    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.routes?.length) {
      const meters = data.routes[0].legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0
      );
      return meters / 1000; // km
    }
    return 0;
  };

  const save = async (r: Route) => {
    if (!editStart || !editEnd) return;

    setSavingId(r.id);
    try {
      const distance = await calculateDistance(editStart, editEnd, editStops);

      await fetch("/api/routes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: r.id,
          start: editStart,
          end: editEnd,
          via: editStops,
          distance, // include recalculated distance
        }),
      });

      setEditingId(null);
      reload();
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/routes?id=${id}`, { method: "DELETE" });
      reload();
    } finally {
      setDeletingId(null);
    }
  };

  // Filter routes based on search query
  const filteredRoutes = routes.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.startLocation.name.toLowerCase().includes(q) ||
      r.endLocation.name.toLowerCase().includes(q) ||
      r.stops.some((s) => s.location.name.toLowerCase().includes(q)) ||
      r.company.companyName.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRoutes.length / routesPerPage);
  const startIndex = (currentPage - 1) * routesPerPage;
  const currentRoutes = filteredRoutes.slice(
    startIndex,
    startIndex + routesPerPage
  );

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with pagination controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Routes</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`p-2 cursor-pointer rounded-full ${
              currentPage === 1 ? "text-gray-400" : "hover:text-gray-800"
            }`}
          >
            ◀
          </button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 cursor-pointer rounded-full ${
              currentPage === totalPages || totalPages === 0
                ? "text-gray-400"
                : "hover:text-gray-800"
            }`}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="w-full">
        <input
          type="text"
          placeholder="Search by start, stop, end, or company..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // reset to first page when searching
          }}
          className="bg-white text-md font-semibold rounded-md px-5 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {currentRoutes.length === 0 && (
        <p className="text-gray-500 text-sm">No routes match your search.</p>
      )}

      {currentRoutes.map((r) => (
        <div key={r.id} className="bg-white/70 rounded-xl shadow p-5">
          {editingId === r.id ? (
            <div className="space-y-5">
              <LocationSearch
                label="Edit Start"
                value={editStart?.name || ""}
                onSelect={setEditStart}
              />
              {editStops.map((_, i) => (
                <LocationSearch
                  key={i}
                  label={`Edit Stop ${i + 1}`}
                  value={editStops[i]?.name || ""}
                  onSelect={(loc) => {
                    const updated = [...editStops];
                    updated[i] = loc;
                    setEditStops(updated);
                  }}
                />
              ))}
              <LocationSearch
                label="Edit End"
                value={editEnd?.name || ""}
                onSelect={setEditEnd}
              />

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => save(r)}
                  disabled={savingId === r.id}
                  className="cursor-pointer text-sm font-semibold bg-green-600 text-white px-3 py-1 rounded flex items-center"
                >
                  {savingId === r.id && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {savingId === r.id ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="cursor-pointer text-sm font-semibold bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold text-gray-500 mb-1">
                {r.company.companyName}
              </p>
              <p className="text-md font-bold">
                {r.startLocation.name} →{" "}
                {r.stops.map((s) => s.location.name).join(" → ")} →{" "}
                {r.endLocation.name}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                {r.distance} km
              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => startEdit(r)}
                  className="cursor-pointer text-sm font-semibold bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(r.id)}
                  disabled={deletingId === r.id}
                  className="cursor-pointer text-sm font-semibold bg-red-600 text-white px-3 py-1 rounded flex items-center"
                >
                  {deletingId === r.id && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {deletingId === r.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
