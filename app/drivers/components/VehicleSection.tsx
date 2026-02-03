"use client";
import { FaCar, FaEdit, FaPlus, FaCheckCircle, FaHashtag, FaTimesCircle } from "react-icons/fa";

export default function VehicleSection({ driver, onEdit, onAdd, toggleVehicleVerification }: any) {
  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-xl">
            <FaCar className="text-emerald-600 text-lg" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            Assigned Vehicles
          </h3>
        </div>
        <button
          onClick={onAdd}
          className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
        >
          <FaPlus size={10} /> Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {driver.vehicles?.map((vehicle: any) => (
          <div key={vehicle.id} className={`p-6 border rounded-[2rem] group transition-all ${vehicle.verified ? 'bg-white border-slate-100 shadow-sm' : 'bg-rose-50/30 border-rose-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${vehicle.verified ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-100 text-rose-600'}`}>
                  <FaCar size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{vehicle.make} {vehicle.model}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vehicle.year} • {vehicle.color}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => onEdit(vehicle)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all"
                >
                  <FaEdit />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
              <div className="flex items-center gap-2">
                <FaHashtag className={vehicle.verified ? "text-emerald-500" : "text-rose-400"} size={10} />
                <span className="text-xs font-black text-slate-700">{vehicle.plateNumber}</span>
              </div>
              
              {/* Verification Toggle Button */}
              <button 
                onClick={() => toggleVehicleVerification(vehicle.id, vehicle.verified)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                  vehicle.verified 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                }`}
              >
                {vehicle.verified ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  {vehicle.verified ? "Verified" : "Verify Now"}
                </span>
              </button>
            </div>
          </div>
        ))}
        {driver.vehicles?.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 font-medium italic text-sm">
            No vehicles assigned to this driver.
          </div>
        )}
      </div>
    </section>
  );
}
