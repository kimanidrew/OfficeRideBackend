"use client";

import { 
  FaFileAlt, FaUpload, FaCheckCircle, 
  FaTimesCircle, FaHandSparkles, FaShieldAlt, 
  FaExclamationTriangle, FaEye 
} from "react-icons/fa";

export default function DocumentSection({ 
  driver, newDoc, setNewDoc, uploadDocument, 
  updateDocument, scanDocument, setSelectedDoc, loading 
}: any) {
  
  /** 
   * Update these values to match your Prisma Schema @default or Enum.
   * Common keys: 'licence', 'national_id', 'insurance', 'road_worthiness'
   */
  const documentCategories = [
    { value: "licence", label: "Driving Licence" },
    { value: "national_id", label: "National ID Card" },
    { value: "insurance", label: "Vehicle Insurance" },
    { value: "road_worthiness", label: "Road Worthiness (Logbook)" },
  ];

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl">
            <FaShieldAlt className="text-indigo-600 text-lg" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            Credentials
          </h3>
        </div>
        <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
          {driver?.documents?.length || 0} Records
        </span>
      </div>

      {/* Upload Box */}
      <div className="bg-indigo-50/40 p-6 rounded-[2rem] border border-indigo-100/50 mb-8">
        <h4 className="text-[10px] font-black text-indigo-600 mb-5 flex items-center gap-2 uppercase tracking-[0.2em]">
          <FaUpload className="animate-bounce" /> Register New Document
        </h4>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            value={newDoc.type} 
            onChange={(e) => setNewDoc({...newDoc, type: e.target.value})} 
            className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
          >
            <option value="">Select Category</option>
            {documentCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <input 
            type="file" 
            id="doc-up" 
            onChange={(e) => setNewDoc({...newDoc, file: e.target.files?.[0]})} 
            className="hidden" 
          />
          <label htmlFor="doc-up" className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm truncate text-slate-500 font-medium cursor-pointer flex items-center gap-2">
            <FaFileAlt className="text-indigo-300" />
            {newDoc.file ? newDoc.file.name : "Choose File"}
          </label>
          <button 
            disabled={loading}
            onClick={uploadDocument} 
            className="cursor-pointer bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none"
          >
           {loading ? "Submitting..." : "Submit"} 
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {driver?.documents?.map((doc: any) => (
          <div key={doc.id} className={`p-6 border rounded-[2rem] group transition-all duration-300 ${doc.verified ? 'bg-white border-slate-100 shadow-sm' : 'bg-rose-50/30 border-rose-100'}`}>
            <div className="flex justify-between items-start mb-5">
              <div 
                onClick={() => setSelectedDoc({ url: doc.fileUrl, type: doc.type })} 
                className="flex items-center gap-4 cursor-pointer"
              >
                <div className={`p-3 rounded-2xl transition-all group-hover:scale-105 ${doc.verified ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                  <FaFileAlt size={20} />
                </div>
                <div>
                  <span className="font-black text-slate-800 block capitalize text-sm">{doc.type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FaEye size={10} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:underline">Preview File</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {doc.verified ? (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    <FaCheckCircle size={10} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 animate-pulse">
                    <FaExclamationTriangle size={10} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Pending</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => updateDocument(doc.id, !doc.verified)} 
                className={`cursor-pointer flex-[2] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  doc.verified 
                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 hover:bg-emerald-700'
                }`}
              >
                {doc.verified ? "Remove Approval" : "Approve Record"}
              </button>

              <button 
                onClick={() => scanDocument(doc.fileUrl)} 
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn"
              >
                <FaHandSparkles className="group-hover/btn:animate-spin" size={12} />
                <span className="cursor-pointer text-[9px] font-black uppercase tracking-widest">AI Audit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
