"use client";
import React, { useState, useEffect } from "react";

interface Company {
  id: string;
  companyName: string;
  domainName: string;
  createdAt: string;
}

function CompanyList({ companies }: { companies: Company[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Companies</h2>
      {companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {companies.map((company) => (
            <li key={company.id} className="py-2">
              <p className="font-semibold">{company.companyName}</p>
              <p className="text-sm text-gray-600">{company.domainName}</p>
              <p className="text-xs text-gray-400">
                Created: {new Date(company.createdAt).toLocaleString()}
              </p>
            </li>
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
  const [message, setMessage] = useState(""); // ✅ added missing state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
        setMessage(`Company "${data.companyName}" added successfully!`);
        onAdded(); // trigger refresh
      } else {
        const err = await res.json();
        setMessage(err.error || "Something went wrong");
      }
    } catch (error) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Domain Name</label>
        <input
          type="text"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Adding..." : "Add Company"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  const loadCompanies = async () => {
    const res = await fetch("/api/company");
    if (res.ok) {
      setCompanies(await res.json());
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <div className="flex space-x-20">
      <AddCompany onAdded={loadCompanies} />
      <CompanyList companies={companies} />
    </div>
  );
}
