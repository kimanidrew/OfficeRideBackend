"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import LocationSearch from "@/components/LocationSearch"; // your autocomplete component

interface Company {
  id: string;
  companyName: string;
}

interface Location {
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
  const { user } = useUser();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [viaLocations, setViaLocations] = useState<Location[]>([]);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number>(0);

  const loadRoutes = async () => {
    const res = await fetch("/api/routes");
    if (res.ok) setRoutes(await res.json());
  };

  const loadCompanies = async () => {
    const res = await fetch("/api/company");
    if (res.ok) setCompanies(await res.json());
  };

  useEffect(() => {
    loadRoutes();
    loadCompanies();
  }, []);

  // Calculate distance using Google Directions API
  const calculateDistance = async () => {
    if (!startLocation || !endLocation) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const waypoints = viaLocations
      .map((v) => `${v.latitude},${v.longitude}`)
      .join("|");

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}&key=${apiKey}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }`;

    const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`); 
    // 👆 use a backend proxy to avoid exposing API key directly
    const data = await res.json();

    if (data.routes?.length) {
      const meters = data.routes[0].legs.reduce(
        (sum: number, leg: any) => sum + leg.distance.value,
        0
      );
      setDistance(meters / 1000); // convert to km
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert("No admin logged in");
      return;
    }
    if (!startLocation || !endLocation) {
      alert("Please select start and end locations");
      return;
    }

    await calculateDistance();

    const res = await fetch("/api/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        adminId: user.id,
        start: startLocation,
        via: viaLocations,
        end: endLocation,
        distance,
      }),
    });
    if (res.ok) {
      await loadRoutes();
      setCompanyId("");
      setStartLocation(null);
      setViaLocations([]);
      setEndLocation(null);
      setDistance(0);
    }
  };

  return (
    <div className="flex space-x-20 px-20">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 w-1/3">
        <label className="block">Company</label>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="border p-2 w-full"
          required
        >
          <option value="">Select a company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>

        <LocationSearch
          label="Start Location"
          value=""
          onSelect={(loc) => setStartLocation(loc)}
        />

        <div>
          <label className="block">Stops (via)</label>
          {viaLocations.map((stop, i) => (
            <div key={i} className="mb-2">
              <LocationSearch
                label={`Stop ${i + 1}`}
                value={stop.name}
                onSelect={(loc) => {
                  const updated = [...viaLocations];
                  updated[i] = loc;
                  setViaLocations(updated);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setViaLocations([...viaLocations, { name: "", latitude: 0, longitude: 0 }])}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            + Add Stop
          </button>
        </div>

        <LocationSearch
          label="End Location"
          value=""
          onSelect={(loc) => setEndLocation(loc)}
        />

        <p className="text-sm text-gray-600">
          Calculated Distance: {distance ? `${distance} km` : "—"}
        </p>

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
