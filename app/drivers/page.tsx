"use client";

import React, { useState, useEffect } from "react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profilePicUrl: "",
    licenseNumber: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  const loadDrivers = async () => {
    const res = await fetch("/api/drivers");
    const data = await res.json();
    setDrivers(data);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const uploadProfilePic = async (file: File) => {
    // Example: upload to your backend or a storage service
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url; // backend should return the uploaded file URL
  };

  const createDriver = async () => {
    let profilePicUrl = form.profilePicUrl;

    if (profilePicFile) {
      profilePicUrl = await uploadProfilePic(profilePicFile);
    }

    await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, profilePicUrl }),
    });

    setForm({ name: "", email: "", password: "", profilePicUrl: "", licenseNumber: "" });
    setProfilePicFile(null);
    loadDrivers();
  };

  const verifyDriver = async (id: string) => {
    await fetch(`/api/drivers/${id}/verify?driverId=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: true }),
    });
    loadDrivers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Management</h1>

      <div className="mb-6 space-y-2">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
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

        {/* File input for profile picture */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setProfilePicFile(e.target.files[0]);
            }
          }}
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

      <h2 className="text-xl font-semibold mb-2">Driver List</h2>
      <ul className="space-y-3">
        {drivers.map((d) => (
          <li key={d.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p className="font-bold">{d.user.name} ({d.user.email})</p>
              {d.user.profilePicUrl && (
                <img
                  src={d.user.profilePicUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mt-2"
                />
              )}
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
                onClick={() => verifyDriver(d.id)}
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
