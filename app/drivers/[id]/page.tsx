"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaUserCircle, FaFileAlt, FaCheckCircle, FaTimesCircle,
  FaUpload, FaEdit, FaIdCard, FaUserShield,
  FaTrash,
  FaHandSparkles,
  FaCopy,
  FaShieldAlt
} from "react-icons/fa";
import dynamic from 'next/dynamic';
import DocumentSummary from "../components/DocumentSummary";

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
  // --- AI Scanner States ---
  const [aiSummary, setAiSummary] = useState<string>(""); // Stores the text result from Gemini
  const [aiLoading, setAiLoading] = useState<boolean>(false); // Controls skeleton loaders/spinners

  // --- Document Management States ---
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; type: string } | null>(null); // For the document preview modal
  const [newDoc, setNewDoc] = useState<{ type: string; file: File | null }>({ 
    type: "", 
    file: null 
  }); // For the "Add New Document" form

  // --- Global UI States ---
  const [copied, setCopied] = useState<boolean>(false); // For the "Copy to Clipboard" feedback
  const [loading, setLoading] = useState<boolean>(false); // General state for profile/verification updates


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

const scanDocument = async (docUrl: string) => {
  // 1. Start loading and clear previous results
  setAiLoading(true);
  setAiSummary("");

  try {
    // 2. Fetch the existing document from your storage (S3/Cloudinary/etc.)
    const fileRes = await fetch(docUrl);
    const blob = await fileRes.blob();

    // 3. Convert Blob to Base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
      // Extract the raw base64 string (remove the data:mime/type;base64, prefix)
      const base64Data = (reader.result as string).split(",")[1];

      // 4. Send to your Gemini API Route
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: base64Data,
          mimeType: blob.type, // e.g., 'application/pdf' or 'image/jpeg'
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI Analysis failed");
      }

      // 5. Update state with the professional summary
      setAiSummary(data.summary);
    };
  } catch (err: any) {
    console.error("Scanning Error:", err);
    setAiSummary(`❌ Error: ${err.message || "Could not analyze document."}`);
  } finally {
    setAiLoading(false);
  }
};

const copyToClipboard = () => {
  if (!aiSummary) return;

  // Use the native [Clipboard API](https://developer.mozilla.org)
  navigator.clipboard.writeText(aiSummary).then(() => {
    setCopied(true);
    // Revert icon after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  }).catch(err => {
    console.error("Failed to copy text: ", err);
    alert("Could not copy to clipboard");
  });
};


  if (!driver) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-30 bg-gray-50 min-h-screen">
     {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 gap-6">
        <div className="flex items-center gap-6">
          {/* Profile Image with Status Glow */}
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-full blur opacity-25 transition duration-1000 group-hover:opacity-50 ${driver.verified ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            {form.previewUrl ? (
              <img 
                src={form.previewUrl} 
                className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" 
                alt="Driver Profile"
              />
            ) : (
              <FaUserCircle className="relative text-8xl text-slate-200 bg-white rounded-full" />
            )}
            {/* Verified Badge */}
            <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white shadow-md flex items-center justify-center ${driver.verified ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {driver.verified ? <FaCheckCircle className="text-white text-[10px]" /> : <FaTimesCircle className="text-white text-[10px]" />}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {driver.user.firstName} {driver.user.middleName} {driver.user.lastName}
              </h1>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                driver.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {driver.verified ? 'Active Account' : 'Action Required'}
              </span>
            </div>
            <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium italic">
              <FaIdCard className="text-blue-600" /> 
              <span className="text-xs uppercase tracking-widest font-black text-slate-400">License ID:</span> 
              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{driver.licenseNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Toggle Approval Button */}
          <button 
            onClick={() => toggleDriverVerification(driver.verified)}
            className={`flex-1 md:flex-none cursor-pointer px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${
              driver.verified 
              ? 'bg-white border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white shadow-rose-50' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            {driver.verified ? (
              <><FaTimesCircle /> Revoke Access</>
            ) : (
              <><FaCheckCircle /> Authorize Driver</>
            )}
          </button>

          {/* Delete Driver Button */}
          <button 
            onClick={deleteDriver}
            className="p-3.5 rounded-2xl font-bold border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all group"
            title="Delete Driver"
          >
            <FaTrash className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            {/* Header with blue accent */}
            <div className="px-8 pt-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-3xl font-bold capitalize text-gray-700 flex items-center gap-2">
                <FaEdit className="text-blue-600" /> Driver Account
              </h3>
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
            </div>

            <div className="p-8 space-y-5">
              {/* Input Group Factory */}
              {[
                { label: "First Name", value: form.firstName, key: "firstName" },
                { label: "Middle Name", value: form.middleName, key: "middleName" },
                { label: "Last Name", value: form.lastName, key: "lastName" },
                { label: "Email Address", value: form.email, key: "email" }
              ].map((input) => (
                <div key={input.key} className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block group-focus-within:text-blue-600 transition-colors">
                    {input.label}
                  </label>
                  <input 
                    value={input.value} 
                    onChange={(e) => setForm({ ...form, [input.key]: e.target.value })} 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700 text-sm"
                    placeholder={`Enter ${input.label.toLowerCase()}`}
                  />
                </div>
              ))}

              {/* Photo Upload Section */}
              <div className="pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Profile Image
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="profile-upload"
                    onChange={(e) => setForm({...form, profilePicFile: e.target.files?.[0] || null})} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="profile-upload"
                    className="flex items-center justify-center w-full px-5 py-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                  >
                    <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 truncate">
                      {form.profilePicFile ? form.profilePicFile.name : "Change Driver Photo"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={updateDriver} 
                disabled={loading}
                className="w-full mt-4 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 disabled:bg-slate-300 disabled:shadow-none transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  "Save Records"
                )}
              </button>
            </div>
          </section>
          <div>
          <DocumentSummary/>
          </div>
        </div>
        

        {/* Right Column: Documents & Verification */}
        <div className="lg:col-span-2 space-y-6">

          {/* Document Section */}
          <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-3xl font-bold capitalize text-gray-700 flex items-center gap-2">
                  <FaFileAlt className="text-blue-600" /> Driver Credentials
                </h3>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {driver.documents.length} Total
                </span>
              </div>


              {/* Upload Section */}
              <div className="mb-10 pt-8 border-t border-slate-100">
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                  <h4 className="text-[10px] font-black text-blue-600 mb-5 flex items-center gap-2 uppercase tracking-[0.2em]">
                    <FaUpload className="animate-bounce" /> Register New Document
                  </h4>
                  <div className="flex flex-col md:flex-row gap-4">
                    <select 
                      value={newDoc.type} 
                      onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })} 
                      className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-sm text-slate-700 transition-all shadow-sm"
                    >
                      <option value="">Select Category</option>
                      <option value="licence">Driving Licence</option>
                      <option value="national_id">National ID</option>
                      <option value="passport">Passport</option>
                    </select>
                    
                    <div className="flex-1 relative">
                      <input 
                        type="file" 
                        id="file-upload"
                        onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })} 
                        className="hidden"
                      />
                      <label 
                        htmlFor="file-upload" 
                        className="flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-500 transition-all shadow-sm"
                      >
                        <span className="text-sm font-medium text-slate-500 truncate">
                          {newDoc.file ? newDoc.file.name : "Choose file..."}
                        </span>
                        <FaFileAlt className="text-slate-300" />
                      </label>
                    </div>

                    <button 
                      onClick={uploadDocument} 
                      disabled={!newDoc.file || !newDoc.type}
                      className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none shadow-xl shadow-blue-100 transition-all active:scale-95"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driver.documents.map((doc: any) => (
                  <div 
                    key={doc.id} 
                    className="flex flex-col p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:border-blue-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() => setSelectedDoc({ url: doc.fileUrl, type: doc.type })}
                      >
                        <div className="p-3 bg-white shadow-sm rounded-2xl group-hover:scale-110 transition-transform">
                          <FaFileAlt className="text-blue-500 text-xl" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block capitalize text-sm">
                            {doc.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover:underline">
                            View File
                          </span>
                        </div>
                      </div>
                      
                      {doc.verified ? (
                        <div className="bg-emerald-100 p-1.5 rounded-full">
                          <FaCheckCircle className="text-emerald-600 text-sm" />
                        </div>
                      ) : (
                        <div className="bg-rose-100 p-1.5 rounded-full">
                          <FaTimesCircle className="text-rose-600 text-sm" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => updateDocument(doc.id, !doc.verified)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          doc.verified 
                          ? "bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100" 
                          : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                        }`}
                      >
                        <FaEdit /> {doc.verified ? "Unverify" : "Verify Now"}
                      </button>
                      {/* Added the AI Scan button to the list item */}
                      <button 
                        onClick={() => scanDocument(doc.fileUrl)}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"
                        title="AI Analysis"
                      >
                        <FaHandSparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>


              {/* AI Intelligence Report Section */}
              {(aiLoading || aiSummary) && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="bg-white border-2 border-blue-50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-100/50">
                    
                    {/* Report Header */}
                    <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                          <FaHandSparkles className="text-white text-xl animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Intelligence Report</h3>
                          <p className="text-slate-900 font-black text-lg mt-1">Automated Document Audit</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 text-slate-600 font-bold text-xs transition-all active:scale-95"
                        >
                          {copied ? (
                            <><FaCheckCircle className="text-emerald-500" /> Copied</>
                          ) : (
                            <><FaCopy /> Copy Analysis</>
                          )}
                        </button>
                        <button 
                          onClick={() => setAiSummary("")}
                          className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-10">
                      {aiLoading ? (
                        <div className="space-y-6">
                          <div className="flex gap-4">
                            <div className="h-4 bg-slate-100 rounded-full w-1/4 animate-pulse" />
                            <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-slate-50 rounded-full w-full animate-pulse" />
                            <div className="h-4 bg-slate-50 rounded-full w-11/12 animate-pulse" />
                            <div className="h-4 bg-slate-50 rounded-full w-4/5 animate-pulse" />
                          </div>
                          <div className="pt-4 flex justify-center">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-bounce">
                              Gemini 2.0 Reading Document...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                          {/* Main Summary Text */}
                          <div className="md:col-span-8">
                            <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">Analysis Findings</h4>
                            <div className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap bg-blue-50/30 p-6 rounded-3xl border border-blue-100/50">
                              {aiSummary}
                            </div>
                          </div>

                          {/* Quick Audit Sidebar */}
                          <div className="md:col-span-4 space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Audit Context</h4>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Confidence Score</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-[94%]" />
                                </div>
                                <span className="text-xs font-bold text-emerald-600">94%</span>
                              </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Detection Mode</p>
                              <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                                <FaShieldAlt className="text-blue-500" /> Multimodal OCR
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Info */}
                    {!aiLoading && (
                      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Always verify AI-generated summaries against the original document.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>
          
          {/* Biometric Verification Card */}
          <div className="bg-white p-6">
             <h3 className="text-3xl font-bold mb-4 flex items-center gap-2 text-gray-700 border-b border-gray-100 pb-3">
              <FaUserShield className="text-indigo-500" /> Biometric Identity Match
            </h3>
            <FaceMatchWithHighlight />
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
