"use client";
import React, { useEffect, useState } from "react";

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface Route {
  id: string;
  company: { companyName: string };
  admin: { name: string };
  startLocation: Location;
  endLocation: Location;
  distance: number;
  stops: { order: number; location: Location }[];
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [startQuery, setStartQuery] = useState("");
  const [viaQueries, setViaQueries] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [distance, setDistance] = useState<number>(0);

  const loadRoutes = async () => {
    const res = await fetch("/api/routes");
    if (res.ok) setRoutes(await res.json());
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const addStop = () => {
    if (newStop.trim()) {
      setViaQueries([...viaQueries, newStop.trim()]);
      setNewStop("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        adminId,
        startQuery,
        viaQueries,
        endQuery,
        distance,
      }),
    });
    if (res.ok) {
      await loadRoutes();
      setCompanyId("");
      setAdminId("");
      setStartQuery("");
      setViaQueries([]);
      setEndQuery("");
      setDistance(0);
    }
  };

  return (
    <div className="flex space-x-20">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 w-1/3">
        <input
          placeholder="Company ID"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          placeholder="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          placeholder="Start Location"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <div>
          <label className="block">Stops (via)</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              className="border p-2 flex-1"
            />
            <button
              type="button"
              onClick={addStop}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Stop
            </button>
          </div>
          <ul className="mt-2 list-disc pl-5">
            {viaQueries.map((stop, i) => (
              <li key={i}>{stop}</li>
            ))}
          </ul>
        </div>

        <input
          placeholder="End Location"
          value={endQuery}
          onChange={(e) => setEndQuery(e.target.value)}
          className="border p-2 w-full"
          required
        />

        <input
          type="number"
          placeholder="Total Distance (km)"
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          className="border p-2 w-full"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Route
        </button>
      </form>

      {/* Routes List */}
      <div className="w-2/3">
        <h2 className="text-xl font-bold">Routes</h2>
        <ul>
          {routes.map((r) => (
            <li key={r.id} className="py-2 border-b">
              <p className="font-semibold">{r.company.companyName}</p>
              <p>
                Start: {r.startLocation.name} →{" "}
                {r.stops.map((s) => s.location.name).join(" → ")} → End:{" "}
                {r.endLocation.name}
              </p>
              <p className="text-sm text-gray-600">
                Distance: {r.distance} km
              </p>
              <p className="text-xs text-gray-400">
                Added by Admin: {r.admin.name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
