"use client";
import { useState } from "react";
import {
  IoCloudUploadOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";

export default function DocumentSummary() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setSummary("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];

      try {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64String,
            mimeType: file.type,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Server failed to respond");

        setSummary(data.summary);
      } catch (err: any) {
        setSummary(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Fleet<span className="text-blue-600">Scanner</span> AI
          </h1>
          <p className="text-slate-500 font-medium">
            Instant OCR & analysis for maintenance, insurance, and fleet logs.
          </p>
        </div>

        {/* Upload Zone */}
        {!summary && !loading && (
          <div>
            <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-slate-300 bg-white rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group shadow-sm">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFile}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="p-5 bg-slate-100 rounded-xl mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                  <IoCloudUploadOutline className="text-slate-600 group-hover:text-blue-600 w-10 h-10" />
                </div>
                <p className="text-lg font-bold text-slate-700">
                  Click to upload document
                </p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
                  PDF • PNG • JPG
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-black uppercase tracking-widest text-xs">
              Analyzing with Gemini 2.0...
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Reading document: {fileName}
            </p>
          </div>
        )}

        {/* Result Area */}
        {summary && (
          <div>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
              <div className="w-full flex flex-col mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 w-full mb-5">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <IoCheckmarkCircleOutline className="text-white w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h2 className="mb-2 text-xs font-black uppercase tracking-tight text-slate-400">
                      Analysis Result
                    </h2>
                    <p className="w-3/4 text-slate-900 font-bold leading-6">
                      {fileName}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-slate-600 font-bold text-sm"
                  >
                    {copied ? (
                      <IoCheckmarkCircleOutline className="text-emerald-600" />
                    ) : (
                      <IoCopyOutline />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSummary("");
                      setFileName("");
                    }}
                    className="cursor-pointer p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-slate-600"
                  >
                    <IoRefreshOutline className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-semibold">
                {summary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
