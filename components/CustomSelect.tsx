"use client";
import React, { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5"; // Ionicons chevrons

interface CustomSelectProps {
  options: string[];
  placeholder?: string;
  onChange?: (value: string) => void;
  bgColor?: string;   // Tailwind background color class
  textColor?: string; // Tailwind text color class
  icon?: React.ReactNode;
}

export default function CustomSelect({
  options,
  placeholder,
  onChange,
  bgColor = "bg-white",
  textColor = "text-black",
  icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className="relative w-full">
      {/* Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-5 pr-10 py-4 flex items-center justify-between border-2 border-gray-700 focus:border-white rounded-full font-[600] text-left focus:outline-none focus:ring-2 focus:ring-green-600 bg-transparent text-gray-500 focus:${textColor}`}
      >
        <span className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{selected || placeholder || "Select an option"}</span>
        </span>
        {isOpen ? (
          <IoChevronUp className="ml-2 text-gray-500" size={20} />
        ) : (
          <IoChevronDown className="ml-2 text-gray-500" size={20} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <ul
          className={`absolute mt-2 py-3 w-full shadow-lg rounded-lg z-10 ${bgColor} backdrop-opacity-90 backdrop-blur-3xl ${textColor}`}
        >
          {options.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(option)}
              className={`px-6 py-3 cursor-pointer bg-transparent hover:bg-[#2e7d32] transition`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
