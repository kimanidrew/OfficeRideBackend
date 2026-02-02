"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaUserCircle, FaFileAlt, FaCheckCircle, FaTimesCircle,
  FaUpload, FaEdit, FaIdCard, FaUserShield,
  FaTrash
} from "react-icons/fa";
import dynamic from 'next/dynamic';

const FaceMatchWithHighlight = dynamic(
  () => import('../components/FaceMatchWithHighlight'),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
);

export default function DriverDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const driverId = id;
  const [driver, setDriver] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: "", middleName: "", lastName: "",
    email: "", licenseNumber: "", profilePicFile: null as File | null,
    previewUrl: "",
  });
  const [newDoc, setNewDoc] = useState({ type: "", file: null as File | null });
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; type: string } | null>(null);

  const [loading, setLoading] = useState(false);

  const getFileType = (url: string) => {
      const ext = url.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) return 'image';
      if (ext === 'pdf') return 'pdf';
      return 'other';
    };


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
  setLoading(true); // Optional: add a loading state
  try {
    let profilePicUrl = driver.user.profilePicUrl || "";

    // 1. Upload Profile Picture if changed
    if (form.profilePicFile) {
      const fd = new FormData();
      fd.append("file", form.profilePicFile);
      fd.append("userId", driver.user.id);
      
      const uploadRes = await fetch("/api/drivers/upload-profile-picture", {
        method: "POST",
        body: fd,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");
      
      const uploadData = await uploadRes.json();
      profilePicUrl = uploadData.url;
    }

    // 2. Update Driver & User Details
    // Ensure the endpoint /api/drivers/detail handles this specific JSON structure
    const updateRes = await fetch(`/api/drivers/detail?driverId=${driverId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        email: form.email,
        licenseNumber: form.licenseNumber,
        profilePicUrl: profilePicUrl, // Send the new or existing URL
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    // 3. Fetch & Sync Fresh Data
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    const updatedDriver = await res.json();
    
    setDriver(updatedDriver);
    
    // 4. Reset Form to clear file inputs and sync URLs
    setForm({
      firstName: updatedDriver.user.firstName || "",
      middleName: updatedDriver.user.middleName || "",
      lastName: updatedDriver.user.lastName || "",
      email: updatedDriver.user.email || "",
      licenseNumber: updatedDriver.licenseNumber || "",
      profilePicFile: null, 
      previewUrl: updatedDriver.user.profilePicUrl || "", 
    });

    alert("✅ Profile updated successfully!");
  } catch (err: any) {
    console.error("Update Error:", err);
    alert(`❌ Update failed: ${err.message}`);
  } finally {
    setLoading(false);
  }
};



 const uploadDocument = async () => {
  if (!newDoc.file || !newDoc.type) return;
  const fd = new FormData();
  fd.append("file", newDoc.file); // The binary file
  fd.append("type", newDoc.type); // The string type

  const res = await fetch(`/api/drivers/documents?driverId=${driverId}`, {
    method: "POST",
    // Do NOT add headers: { 'Content-Type': 'application/json' }
    body: fd,
  });

  if (res.ok) {
    const detailRes = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    setDriver(await detailRes.json());
    setNewDoc({ type: "", file: null });
    alert("✅ Document uploaded!");
  }
};


const updateDocument = async (docId: string, verified: boolean) => {
  try {
    // 1. Send update request
    const response = await fetch(`/api/drivers/documents?driverId=${driverId}&docId=${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });

    if (!response.ok) throw new Error("Failed to update document");

    // 2. Fetch fresh driver data
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
    const updatedData = await res.json();
    
    // 3. Update state to trigger re-render
    setDriver(updatedData);
    
    console.log(`✅ Document ${docId} set to ${verified ? 'Verified' : 'Unverified'}`);
  } catch (error) {
    console.error("❌ Update error:", error);
    alert("Could not update document status.");
  }
};


  const toggleDriverVerification = async (currentStatus: boolean) => {
      const newStatus = !currentStatus;
      await fetch(`/api/drivers/verify?driverId=${driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: newStatus }),
      });
      
      // Refresh driver data
      const res = await fetch(`/api/drivers/detail?driverId=${driverId}`);
      setDriver(await res.json());
    };



    const deleteDriver = async () => {
  const firstCheck = window.confirm("Are you sure you want to delete this driver?");
  if (!firstCheck) return;
  
  const secondCheck = window.confirm("⚠️ FINAL WARNING: This will permanently delete the user account and all associated documents. This cannot be undone. Proceed?");
  if (!secondCheck) return;

  try {
    const res = await fetch(`/api/drivers/detail?driverId=${driverId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("🗑️ Driver successfully removed.");
      router.push("/drivers"); // Use the [Next.js Router](https://nextjs.org) to redirect
    } else {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
  } catch (error) {
    alert("An error occurred while deleting the driver.");
  }
};



  if (!driver) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-30 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.previewUrl ? (
              <img src={form.previewUrl} className="w-20 h-20 rounded-full object-cover border-4 border-blue-50" />
            ) : (
              <FaUserCircle className="text-7xl text-gray-300" />
            )}
            <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white ${driver.verified ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {driver.user.firstName} {driver.user.middleName} {driver.user.lastName}
            </h1>
            <p className="text-gray-500 flex items-center gap-2">
              <FaIdCard /> License: <span className="font-mono">{driver.licenseNumber}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {/* Toggle Approval Button */}
            <button 
              onClick={() => toggleDriverVerification(driver.verified)}
              className={`cursor-pointer px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                driver.verified 
                ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white shadow-rose-50' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'
              }`}
            >
              {driver.verified ? (
                <><FaTimesCircle /> Unapprove Driver</>
              ) : (
                <><FaCheckCircle /> Approve Driver</>
              )}
            </button>

            {/* NEW: Delete Driver Button */}
            <button 
              onClick={deleteDriver}
              className="cursor-pointer px-6 py-2 rounded-xl font-bold border border-gray-200 text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center gap-2"
            >
              <FaTrash /> Delete
            </button>
          </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-3xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2">
              <FaEdit className="text-blue-500" /> Profile Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">First Name</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Middle Name</label>
                <input value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Last Name</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 p-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Update Photo</label>
                <input type="file" onChange={(e) => setForm({...form, profilePicFile: e.target.files?.[0] || null})} className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <button onClick={updateDriver} className="cursor-pointer w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                {loading? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Documents & Verification */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biometric Verification Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-3xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2">
              <FaUserShield className="text-indigo-500" /> Biometric Identity Match
            </h3>
            <FaceMatchWithHighlight />
          </div>

          {/* Document List */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2">
              <FaFileAlt className="text-orange-500" /> Verified Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driver.documents.map((doc: any) => (
                  <li key={doc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b">
                    <div 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => setSelectedDoc({ url: doc.fileUrl, type: doc.type })}
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FaFileAlt />
                      </div>
                      <div>
                        <span className="font-medium block capitalize">{doc.type.replace('_', ' ')}</span>
                        <span className="text-xs text-blue-500 hover:underline">Click to view document</span>
                      </div>
                      {doc.verified ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : (
                        <FaTimesCircle className="text-red-600" />
                      )}
                    </div>
                    
                    <button
                      onClick={() => updateDocument(doc.id, !doc.verified)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm transition-all"
                    >
                      <FaEdit /> {doc.verified ? "Unverify" : "Verify"}
                    </button>
                  </li>
              ))}
            </div>

            {/* Upload Section */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
                <FaUpload /> Add New Document
              </h4>
              <div className="flex flex-col md:flex-row gap-3">
                <select value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })} className="flex-1 p-2 bg-gray-50 border rounded-lg outline-none">
                  <option value="">Document Type</option>
                  <option value="licence">Licence</option>
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                </select>
                <input type="file" onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })} className="flex-1 text-sm pt-2" />
                <button onClick={uploadDocument} className="cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                  Upload
                </button>
              </div>
            </div>
          </section>
        </div>

      </div>
{selectedDoc && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
      
      {/* Modal Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b bg-white">
        <div>
          <h3 className="text-xl font-bold text-slate-800 capitalize leading-tight">
            {selectedDoc.type.replace('_', ' ')}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">{selectedDoc.url.split('/').pop()}</p>
        </div>
        <button 
          onClick={() => setSelectedDoc(null)} 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-all"
        >
          <FaTimesCircle size={28} />
        </button>
      </div>

      {/* Main Viewer (No Iframe) */}
      <div className="flex-1 overflow-auto p-6 bg-slate-100 flex items-center justify-center">
        {getFileType(selectedDoc.url) === 'image' ? (
          <img 
            src={selectedDoc.url} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border-4 border-white" 
            alt="Document Preview" 
          />
        ) : getFileType(selectedDoc.url) === 'pdf' ? (
          <object
            data={`${selectedDoc.url}#navpanes=0`}
            type="application/pdf"
            className="w-full h-[70vh] rounded-xl border border-slate-200 shadow-inner"
          >
            <div className="p-20 text-center bg-white rounded-xl shadow-sm">
              <FaFileAlt className="text-6xl text-slate-200 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Native PDF preview unavailable.</p>
              <button 
                onClick={() => window.open(selectedDoc.url, '_blank')}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Try opening in a new tab
              </button>
            </div>
          </object>
        ) : (
          <div className="text-center p-20 bg-white rounded-2xl shadow-sm">
            <FaFileAlt className="text-7xl text-slate-200 mx-auto mb-6" />
            <p className="text-slate-500 font-bold text-lg">Preview not supported</p>
            <p className="text-slate-400 text-sm mt-1">Please use the download button below.</p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-white border-t flex justify-end items-center gap-4 px-8">
        <button 
          onClick={() => setSelectedDoc(null)} 
          className="px-6 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-all"
        >
          Cancel
        </button>
        
        {/* DOWNLOAD BUTTON */}
        <a 
          href={selectedDoc.url} 
          download 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <FaUpload className="rotate-180" /> Download to PC
        </a>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
