"use client";

import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaEdit,
} from "react-icons/fa";

export default function DriverDetailPage({ params }: { params: { id: string } }) {
  const driverId = params.id;
  const [driver, setDriver] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    licenseNumber: "",
    profilePicFile: null as File | null,
    previewUrl: "",
  });
  const [newDoc, setNewDoc] = useState({ type: "", file: null as File | null });

  useEffect(() => {
    const loadDriver = async () => {
      const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
      const data = await res.json();
      setDriver(data);
      setForm({
        firstName: data.user.firstName || "",
        middleName: data.user.middleName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        licenseNumber: data.licenseNumber || "",
        profilePicFile: null,
        previewUrl: data.user.profilePicUrl || "",
      });
    };
    loadDriver();
  }, [driverId]);

  const updateDriver = async () => {
    let profilePicUrl = driver.user.profilePicUrl || "";
    if (form.profilePicFile) {
      const fd = new FormData();
      fd.append("file", form.profilePicFile);
      fd.append("userId", driver.user.id);
      const uploadRes = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();
      profilePicUrl = uploadData.url;
    }

    await fetch(`/api/drivers/detail?driverId=${driverId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        email: form.email,
        licenseNumber: form.licenseNumber,
        profilePicUrl,
      }),
    });
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    setDriver(await res.json());
  };

  const uploadDocument = async () => {
    if (!newDoc.file || !newDoc.type) return;
    const fd = new FormData();
    fd.append("file", newDoc.file);
    fd.append("type", newDoc.type);

    await fetch(`/api/drivers/documents?driverId=${driverId}`, {
      method: "POST",
      body: fd,
    });
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    setDriver(await res.json());
    setNewDoc({ type: "", file: null });
  };

  const updateDocument = async (docId: string, verified: boolean) => {
    await fetch(`/api/drivers/documents?driverId=${driverId}&docId=${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    setDriver(await res.json());
  };

  if (!driver) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FaUserCircle /> Driver: {driver.user.firstName}{" "}
        {driver.user.middleName ? driver.user.middleName + " " : ""}
        {driver.user.lastName}
      </h1>

      {/* Profile Picture */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold">
          <FaUserCircle /> Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setForm({
              ...form,
              profilePicFile: file,
              previewUrl: file ? URL.createObjectURL(file) : form.previewUrl,
            });
          }}
          className="border p-2 w-full"
        />
        {form.previewUrl ? (
          <img
            src={form.previewUrl}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover mt-2"
          />
        ) : (
          <FaUserCircle className="text-6xl text-gray-400 mt-2" />
        )}
      </div>

      {/* Driver Info Form */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold">
          <FaEdit /> Driver Info
        </label>
        <input
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Middle Name"
          value={form.middleName}
          onChange={(e) => setForm({ ...form, middleName: e.target.value })}
          className="border p-2 w-full"
        />
        <input
          placeholder="Last Name"
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
          placeholder="License Number"
          value={form.licenseNumber}
          onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
          className="border p-2 w-full"
        />
        <button
          onClick={updateDriver}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          <FaEdit /> Update Driver Info
        </button>
      </div>

      {/* Documents Section */}
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FaFileAlt /> Documents
      </h2>
      <ul className="space-y-2">
        {driver.documents.map((doc: any) => (
          <li key={doc.id} className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <FaFileAlt /> {doc.type} –{" "}
              {doc.verified ? (
                <FaCheckCircle className="text-green-600" />
              ) : (
                <FaTimesCircle className="text-red-600" />
              )}
            </span>
            <button
              onClick={() => updateDocument(doc.id, !doc.verified)}
              className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1 rounded"
            >
              <FaEdit /> {doc.verified ? "Unverify" : "Verify"}
            </button>
          </li>
        ))}
      </ul>

      {/* Upload New Document */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold">
          <FaUpload /> Upload New Document
        </label>
        <select
          value={newDoc.type}
          onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
          className="border p-2 w-full"
        >
          <option value="">Select Document Type</option>
          <option value="licence">Licence</option>
          <option value="national_id">National ID</option>
          <option value="passport">Passport</option>
          <option value="police_clearance">Police Clearance</option>
        </select>
        <input
          type="file"
          onChange={(e) =>
            setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })
          }
          className="border p-2 w-full"
        />
        <button
          onClick={uploadDocument}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          <FaUpload /> Upload Document
        </button>
      </div>
    </div>
  );
}
