"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import CreateRouteForm from "../pageComponents/routes/CreateRouteForm";
import RoutesList from "../pageComponents/routes/RoutesList";

export default function RoutesPage() {
  const { user } = useUser();
  const [routes, setRoutes] = useState([]);

  const loadRoutes = async () => {
    const res = await fetch("/api/routes");
    setRoutes(await res.json());
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 px-10 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="w-full">
        <CreateRouteForm userId={user?.id} onCreated={loadRoutes} />
        </div>
        <div className="lg:col-span-2">
          <RoutesList routes={routes} reload={loadRoutes} />
        </div>
      </div>
    </div>
  );
}
