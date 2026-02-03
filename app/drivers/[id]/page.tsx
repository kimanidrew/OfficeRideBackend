"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Sub-components
import DriverHeader from "../components/DriverHeader";
import PersonalInfoForm from "../components/PersonalInfoForm";
import DocumentSection from "../components/DocumentSection";
import AISummaryReport from "../components/AISummaryReport";
import DocumentModal from "../components/DocumentModal";
import DocumentSummary from "../components/DocumentSummary";

const FaceMatchWithHighlight = dynamic(
  () => import('../components/FaceMatchWithHighlight'),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
);

export default function DriverDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const driverId = id;

  // States
  const [driver, setDriver] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: "", middleName: "", lastName: "",
    email: "", licenseNumber: "", profilePicFile: null as File | null,
    previewUrl: "",
  });
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; type: string } | null>(null);
  const [newDoc, setNewDoc] = useState<{ type: string; file: File | null }>({ type: "", file: null });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Logic: Fetching, Updating, Deleting, Scanning
  const refreshData = async () => {
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

  useEffect(() => { refreshData(); }, [driverId]);

const scanDocument = async (docUrl: string) => {
  // 1. SET LOADING TRUE IMMEDIATELY
  setAiLoading(true); 
  setAiSummary("");

  try {
    const fileRes = await fetch(docUrl);
    const blob = await fileRes.blob();

    // 2. WRAP READER IN PROMISE SO 'await' WORKS
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const result = (reader.result as string).split(",")[1];
        resolve(result);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });

    // 3. CALL AI API
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileData: base64Data, mimeType: blob.type }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // 4. UPDATE SUMMARY
    setAiSummary(data.summary);
  } catch (err: any) {
    console.error(err);
    setAiSummary(`❌ Error: ${err.message}`);
  } finally {
    // 5. ONLY SET LOADING FALSE AFTER EVERYTHING IS DONE
    setAiLoading(false); 
  }
};

// Inside DriverDetailPage component
const updateDocument = async (docId: string, verified: boolean) => {
  try {
    const response = await fetch(`/api/drivers/documents?docId=${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });

    if (!response.ok) throw new Error("Failed to update document status");

    // Reload the driver data to reflect changes in the UI
    await refreshData();
  } catch (err: any) {
    console.error("❌ Update Error:", err);
    alert("Error updating document verification status.");
  }
};

// Assuming this is in DriverDetailPage or similar parent component:

const updateDriver = async () => {
  setLoading(true);
  const formData = new FormData();

  // Map your state to FormData
  formData.append("firstName", form.firstName);
  formData.append("middleName", form.middleName);
  formData.append("lastName", form.lastName);
  formData.append("email", form.email);
  formData.append("licenseNumber", form.licenseNumber);
  formData.append("profilePicUrl", form.previewUrl); // Keep existing if no new file

  if (form.profilePicFile) {
    formData.append("profilePic", form.profilePicFile); // The actual file
  }

  const res = await fetch(`/api/drivers/detail?driverId=${driverId}`, {
    method: "PUT",
    body: formData, // Do NOT set 'Content-Type' header; browser sets it for FormData
  });

  if (res.ok) {
    alert("Records Saved!");
    refreshData();
  } else {
    const err = await res.json();
    alert(err.error);
  }
  setLoading(false);
};



// Inside DriverDetailPage component
const toggleDriverVerification = async (currentStatus: boolean) => {
  const newStatus = !currentStatus;
  
  // Optional: Add a confirmation for destructive actions (unverifying)
  if (currentStatus && !window.confirm("Are you sure you want to unverify this driver?")) {
    return;
  }

  try {
    const response = await fetch(`/api/drivers/verify?driverId=${driverId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: newStatus }),
    });

    if (!response.ok) throw new Error("Failed to toggle driver verification");

    // Refresh UI to show updated status badges
    await refreshData();
    
    // Optional: Alert success
    // alert(`Driver ${newStatus ? 'Approved' : 'Unverified'} Successfully`);
  } catch (err: any) {
    console.error("❌ Verification Toggle Error:", err);
    alert("Error updating driver status.");
  }
};


  if (!driver) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full px-20 pt-30 bg-gray-50 min-h-screen pb-20">
      <DriverHeader driver={driver} form={form} refreshData={refreshData} router={router} driverId={driverId} toggleDriverVerification={toggleDriverVerification} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <PersonalInfoForm form={form} setForm={setForm} loading={loading} setLoading={setLoading} driver={driver} refreshData={refreshData} driverId={driverId} updateDriver={updateDriver}/>
          <DocumentSummary/>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DocumentSection 
            driver={driver} 
            newDoc={newDoc} 
            setNewDoc={setNewDoc} 
            setSelectedDoc={setSelectedDoc} 
            scanDocument={scanDocument} 
            refreshData={refreshData} 
            driverId={driverId} 
            updateDocument={updateDocument}
          />
          
          <AISummaryReport aiLoading={aiLoading} aiSummary={aiSummary} setAiSummary={setAiSummary} copied={copied} setCopied={setCopied} />
          
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200">
             <h3 className="text-xl font-bold pl-5 mb-4 flex items-center gap-2 text-slate-700 border-b border-gray-100 pb-3 font-black uppercase tracking-widest text-[10px]">
              Biometric Identity Match
            </h3>
            <FaceMatchWithHighlight />
          </div>
        </div>
      </div>

      {selectedDoc && <DocumentModal selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />}
    </div>
  );
}
