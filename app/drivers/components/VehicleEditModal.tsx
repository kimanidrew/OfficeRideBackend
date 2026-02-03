"use client";

import { useState } from "react";
import { FaCar, FaTimes, FaSave, FaHashtag, FaPalette, FaCalendarAlt } from "react-icons/fa";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plateNumber: string;
  year: string | number;
  color: string;
}

interface VehicleEditModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (data: Vehicle) => void;
  loading: boolean;
}

export default function VehicleEditModal({ vehicle, onClose, onSave, loading }: VehicleEditModalProps) {
  // Initialize local state with current vehicle data
  const [formData, setFormData] = useState<Vehicle>({ ...vehicle });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-8 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <FaCar size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">Modify Vehicle</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Fleet Management System</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-10 grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">
              License Plate Number
            </label>
            <div className="relative">
              <FaHashtag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="ABC-1234"
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Brand / Make</label>
            <input 
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Model Name</label>
            <input 
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Corolla"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Manufacturing Year</label>
            <FaCalendarAlt className="absolute right-6 bottom-5 text-slate-300 pointer-events-none" size={14} />
            <input 
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Exterior Color</label>
            <FaPalette className="absolute right-6 bottom-5 text-slate-300 pointer-events-none" size={14} />
            <input 
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Discard Changes
          </button>
          <button 
            disabled={loading}
            onClick={() => onSave(formData)}
            className="cursor-pointer flex-[1.5] bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-300"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FaSave size={14} />
                Confirm Update
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
