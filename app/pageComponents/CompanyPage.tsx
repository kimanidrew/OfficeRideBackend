"use client";
import React, { useState, useEffect } from "react";
import { 
  FaCity, FaPlus, FaGlobe, FaCalendarAlt, 
  FaRegBuilding, FaCheckCircle, FaExclamationCircle 
} from "react-icons/fa";

interface Company {
  id: string;
  companyName: string;
  domainName: string;
  createdAt: string;
}

function CompanyList({ companies }: { companies: Company[] }) {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <FaRegBuilding className="text-indigo-600" /> Registered Partners
        </h2>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          {companies.length} Total
        </span>
      </div>

      {companies.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <FaCity className="mx-auto text-slate-200 mb-4" size={48} />
           <p className="text-slate-400 font-bold italic">No corporate partners registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div key={company.id} className="group p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-black text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                    {company.companyName}
                  </p>
                  <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                    <FaGlobe size={12} />
                    <span>{company.domainName}</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                  <FaCity size={18} />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <FaCalendarAlt />
                <span>Joined {new Date(company.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCompany({ onAdded }: { onAdded: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, domainName }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompanyName("");
        setDomainName("");
        setMessage({ text: `Successfully registered ${data.companyName}`, type: "success" });
        onAdded();
      } else {
        const err = await res.json();
        setMessage({ text: err.error || "Registration failed", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network connection error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-5 shadow-inner">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
            <FaPlus />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Add Company</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold shadow-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Domain Name</label>
            <div className="relative">
              <FaGlobe className="absolute left-4 top-4 text-slate-300" size={14} />
              <input
                type="text"
                placeholder="acme.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="w-full p-3 pl-12 bg-white border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? "Registering..." : <><FaPlus size={12}/> Register Partner</>}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <p className="text-xs font-bold">{message.text}</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const loadCompanies = async () => {
    try {
      const res = await fetch("/api/company");
      if (res.ok) {
        setCompanies(await res.json());
      }
    } catch (e) {
      console.error("Failed to load companies");
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <AddCompany onAdded={loadCompanies} />
      <CompanyList companies={companies} />
    </div>
  );
}
