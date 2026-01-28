"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    licenseNumber: "",
  });
  const router = useRouter();

  const loadDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const createDriver = async () => {
    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      licenseNumber: "",
    });
    loadDrivers();
  };

  const verifyDriver = async (id: string) => {
    await fetch(`/api/drivers/verify?driverId=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    loadDrivers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Management</h1>

      {/* Create Driver Form */}
      <div className="mb-6 space-y-2">
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Middle Name (optional)"
          value={form.middleName}
          onChange={(e) => setForm({ ...form, middleName: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Last Name (optional)"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="License Number"
          value={form.licenseNumber}
          onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
          className="border p-2 w-full"
        />
        <button
          onClick={createDriver}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Driver
        </button>
      </div>

      {/* Driver List */}
      <h2 className="text-xl font-semibold mb-2">Driver List</h2>
      <ul className="space-y-3">
        {drivers.map((d) => (
          <li
            key={d.id}
            className="border p-3 rounded flex justify-between items-center cursor-pointer hover:bg-gray-100"
            onClick={() => router.push(`/drivers/driver?driverId=${d.id}`)}
          >
            <div>
              <p className="font-bold">
                {d.user.firstName}
                {d.user.middleName ? ` ${d.user.middleName}` : ""}
                {d.user.lastName ? ` ${d.user.lastName}` : ""} ({d.user.email})
              </p>
              <p>Verified: {d.verified ? "✅ Yes" : "❌ No"}</p>
              <p>
                Documents:{" "}
                {d.documents
                  .map((doc: any) => `${doc.type} (${doc.verified ? "✔" : "✘"})`)
                  .join(", ")}
              </p>
            </div>
            {!d.verified && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent navigation
                  verifyDriver(d.id);
                }}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Verify
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
