"use client";

import { 
  FaHandSparkles, FaCopy, FaTrash, FaCheckCircle, 
  FaShieldAlt, FaFileMedical, FaClock 
} from "react-icons/fa";

export default function AISummaryReport({ 
  aiLoading, 
  aiSummary, 
  setAiSummary, 
  copyToClipboard, 
  copied 
}: any) {
  
  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white border-2 border-emerald-50 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500">
          
          {/* Header Section */}
          <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-100">
                <FaHandSparkles className={`text-white text-xl ${aiLoading ? 'animate-spin' : 'animate-pulse'}`} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Intelligence Report</h3>
                <p className="text-slate-900 font-black text-lg mt-1">
                  {aiLoading ? "Gemini Analysis in Progress" : "Automated Audit"}
                </p>
              </div>
            </div>
            
            {/* Actions: Hide buttons while loading */}
            {!aiLoading && aiSummary && (
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard} 
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  {copied ? <FaCheckCircle className="text-emerald-500" /> : <FaCopy />} 
                  {copied ? "Copied" : "Copy"}
                </button>
                <button 
                  onClick={() => setAiSummary("")} 
                  className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

        {!aiLoading && !aiSummary && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaFileMedical className="text-slate-300 text-2xl" />
          </div>
          <h3 className="text-slate-900 font-black text-lg">Validate Documents Here</h3>
          <p className="text-slate-400 text-sm font-medium mt-1 max-w-xs mx-auto">
            Please select a document above and click "Scan" to begin the AI Intelligence Audit.
          </p>
        </div>
            )} 

          {/* Content Section */}
          <div className="p-10">
            {aiLoading && !aiSummary ? (
              /* Scanning UI */
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                   <FaShieldAlt className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="text-emerald-600 font-black text-sm uppercase tracking-[0.3em] animate-pulse">
                    Gemini 2.0 Reading Multimodal Data...
                  </p>
                  <p className="text-slate-400 text-xs mt-2 font-medium italic tracking-wide">Extracting text and verifying identity markers</p>
                </div>
              </div>
            ) : (
              /* Results Grid */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="md:col-span-8 text-slate-700 text-sm font-medium whitespace-pre-wrap bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50 leading-relaxed shadow-inner">
                  {aiSummary}
                </div>
                
                <div className="md:col-span-4 space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Detection Mode</p>
                    <p className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-2">
                      <FaShieldAlt className="text-emerald-500" /> Multimodal OCR
                    </p>
                  </div>
                  
                  <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-xl shadow-emerald-100">
                    <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest leading-none">Security Status</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold">Encrypted Audit</p>
                      <FaClock className="text-emerald-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
