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
import VehicleSection from "../components/VehicleSection";
import VehicleEditModal from "../components/VehicleEditModal";

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
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
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

const uploadDocument = async () => {
  if (!newDoc.type || !newDoc.file) {
    alert("Please select both a document type and a file.");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("type", newDoc.type);
  formData.append("file", newDoc.file);
  formData.append("driverId", driverId as string); // Body ID

  try {
    // ✅ ADD driverId to the URL search params for the API to catch it easily
    const res = await fetch(`/api/drivers/documents?driverId=${driverId}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upload document");

    setNewDoc({ type: "", file: null });
    await refreshData();
    alert("Document registered successfully!");
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
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

const handleSaveVehicle = async (vehicleData: any) => {
  setLoading(true);
  const isNew = !vehicleData.id;
  // Use id param for updates, otherwise POST to the general endpoint
  const url = isNew ? `/api/drivers/vehicles` : `/api/drivers/vehicles?id=${vehicleData.id}`;
  const method = isNew ? "POST" : "PUT";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      // Attach the driverId for new vehicles
      body: JSON.stringify({ ...vehicleData, driverId }),
    });

    if (!res.ok) throw new Error(`Failed to ${isNew ? 'add' : 'update'} vehicle`);
    
    setEditingVehicle(null);
    setIsAddingVehicle(false);
    await refreshData();
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

const updateVehicle = async (vehicleId: string, updatedData: any) => {
  setLoading(true); // Reuse existing loading state for the save button
  try {
    const res = await fetch(`/api/drivers/vehicles?id=${vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error("Failed to update vehicle");
    
    // Close the modal and refresh UI
    setEditingVehicle(null);
    await refreshData();
    // Optional: add a toast/notification here
  } catch (err: any) {
    console.error("Vehicle Update Error:", err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

const toggleVehicleVerification = async (vehicleId: string, currentStatus: boolean) => {
  try {
    const response = await fetch(`/api/drivers/vehicles/verify?id=${vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: !currentStatus }),
    });

    if (!response.ok) throw new Error("Failed to update vehicle status");
    await refreshData();
  } catch (err: any) {
    alert("Error updating vehicle verification.");
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
          <VehicleSection 
            driver={driver} 
            onEdit={(vehicle: any) => setEditingVehicle(vehicle)} 
            onAdd={() => setIsAddingVehicle(true)} 
            toggleVehicleVerification={toggleVehicleVerification}
          />
          <DocumentSection 
            driver={driver} 
            newDoc={newDoc} 
            setNewDoc={setNewDoc} 
            setSelectedDoc={setSelectedDoc} 
            scanDocument={scanDocument} 
            refreshData={refreshData} 
            driverId={driverId} 
            updateDocument={updateDocument}
            uploadDocument={uploadDocument}
            loading={loading}
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
    
    {/* Show Modal for either Editing or Adding */}
    {(editingVehicle || isAddingVehicle) && (
      <VehicleEditModal 
        vehicle={editingVehicle || { make: "", model: "", plateNumber: "", year: 2024, color: "" }} 
        loading={loading}
        onClose={() => {
          setEditingVehicle(null);
          setIsAddingVehicle(false);
        }} 
        onSave={handleSaveVehicle} 
      />
    )}
    </div>
  );
}
