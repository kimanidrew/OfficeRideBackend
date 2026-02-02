"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaCity, FaUsers, FaRoute, FaCog, 
  FaChevronRight, FaThLarge 
} from "react-icons/fa";

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", path: "/admin", icon: <FaThLarge /> },
    { name: "Companies", path: "/admin/companies", icon: <FaCity /> },
    { name: "Drivers", path: "/admin/drivers", icon: <FaUsers /> },
    { name: "Routes", path: "/admin/routes", icon: <FaRoute /> },
    { name: "Settings", path: "/admin/settings", icon: <FaCog /> },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-[60] flex flex-col shadow-2xl ${isOpen ? "w-72" : "w-20"}`}>
      {/* Brand Area */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
          <FaRoute size={20} />
        </div>
        {isOpen && <span className="font-black text-xl tracking-tighter">FleetAdmin</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group mb-2 ${
                isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
                <div className="flex items-center gap-4">
                  <span className={`${isActive ? "text-white" : "group-hover:text-indigo-400"}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="font-bold text-sm">{item.name}</span>}
                </div>
                {isOpen && isActive && <FaChevronRight size={10} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Version Info */}
      {isOpen && (
        <div className="p-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800">
          v1.0.4 Premium
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
