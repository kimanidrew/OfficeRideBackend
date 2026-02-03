"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaUserCircle, FaCamera } from "react-icons/fa";
import Image from "next/image";

export default function PersonalInfoForm({ form, setForm, updateDriver, loading }: any) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Handle local image preview and cleanup memory
  useEffect(() => {
    if (form.profilePicFile) {
      const objectUrl = URL.createObjectURL(form.profilePicFile);
      setLocalPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLocalPreview(null);
    }
  }, [form.profilePicFile]);

  const previewSource = localPreview || form.previewUrl;

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
       <div className="flex items-center gap-3 p-8">
                <div className="bg-indigo-50 p-2.5 rounded-xl">
                  <FaEdit className="text-indigo-600 text-lg" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                  Profile details
                </h3>
        </div>

      <div className="p-8 space-y-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <label
              htmlFor="profile-upload"
              className="relative block w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 transition-all shadow-lg cursor-pointer"
            >
              {previewSource ? (
                <Image
                  src={previewSource}
                  alt="Profile Preview"
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <FaUserCircle size={80} />
                </div>
              )}

              {/* Black Overlay always visible */}
              <div className="absolute inset-0 bg-black/40"></div>

              {/* Camera Icon and Text always visible */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <FaCamera className="text-white mb-1" size={24} />
                <span className="text-[8px] text-white font-black uppercase tracking-tighter">
                  Update
                </span>
              </div>

              <input
                type="file"
                id="profile-upload"
                onChange={(e) =>
                  setForm({ ...form, profilePicFile: e.target.files?.[0] || null })
                }
                className="hidden"
                accept="image/*"
              />
            </label>

            {/* Status dot */}
            <div className="absolute bottom-1 right-2 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">
            Profile Photo
          </span>
        </div>

        {/* Personal Info Inputs */}
        {["firstName", "middleName", "lastName", "email"].map((key) => (
          <div key={key}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={`Enter ${key}`}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 text-sm shadow-sm"
            />
          </div>
        ))}

        {/* Save Button */}
        <button
          onClick={updateDriver}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:bg-slate-300 mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </span>
          ) : (
            "Save Records"
          )}
        </button>
      </div>
    </section>
  );
}
