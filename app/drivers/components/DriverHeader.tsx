import { FaUserCircle, FaIdCard, FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";

export default function DriverHeader({ driver, form, toggleDriverVerification, deleteDriver }: any) {
  return (
    <div className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 gap-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className={`absolute -inset-1 rounded-full blur opacity-25 transition duration-1000 ${driver.verified ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          {form.previewUrl ? (
            <img src={form.previewUrl} className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" />
          ) : (
            <FaUserCircle className="relative text-8xl text-slate-200 bg-white rounded-full" />
          )}
          <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white shadow-md flex items-center justify-center ${driver.verified ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {driver.verified ? <FaCheckCircle className="text-white text-[10px]" /> : <FaTimesCircle className="text-white text-[10px]" />}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{driver.user.firstName} {driver.user.middleName} {driver.user.lastName}</h1>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${driver.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {driver.verified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <p className="text-slate-500 flex items-center gap-2 mt-1 font-medium italic">
            <FaIdCard className="text-blue-600" /> 
            <span className="text-xs uppercase tracking-widest font-black text-slate-400">License:</span> 
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{driver.licenseNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button onClick={() => toggleDriverVerification(driver.verified)} className={`cursor-pointer flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${driver.verified ? 'bg-white border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {driver.verified ? <><FaTimesCircle /> Revoke Access</> : <><FaCheckCircle /> Authorize</>}
        </button>
        <button onClick={deleteDriver} className="cursor-pointer p-3.5 rounded-2xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"><FaTrash /></button>
      </div>
    </div>
  );
}
