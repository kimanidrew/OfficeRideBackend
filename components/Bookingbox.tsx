"use client";
import React from "react";
import CustomSelect from "@/components/CustomSelect"; // adjust path
import { useDrawer } from "./Drawer";
import { IoLocationSharp, IoHomeSharp, IoCarSportSharp, IoHomeOutline, IoLocationOutline, IoTrailSignOutline, IoMapOutline } from "react-icons/io5";
import AvailableVehicles from "@/app/pageComponents/AvailableVehicles";

export default function BookingBox() {
  const { openDrawer } = useDrawer();

  return (
    <div className="absolute bottom-[-40] w-3/4 mx-auto bg-black/50 backdrop-blur-3xl rounded-4xl shadow-lg py-10 px-15 text-left">
      <p className="font-[700] text-[#2e7d32] mb-20 flex items-center space-x-3">
        <IoCarSportSharp className="text-[#2e7d32] mt-2" size={50} />
        <span className="text-5xl">Book a Ride</span>
      </p>

      <div className="space-y-6">
        <div className="flex space-x-4">
          <div className="relative w-1/2">
            <IoLocationOutline className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="From (e.g. Office)"
              className="font-[600] w-full pl-12 pr-5 py-4 border-2 border-gray-700 focus:border-white text-gray-500 focus:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="relative w-1/2">
            <IoHomeOutline className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="To (e.g. Home)"
              className="font-[600] w-full pl-12 pr-5 py-4 border-2 border-gray-700 focus:border-white text-gray-500 focus:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {/* Custom Select with background + text color props */}
        <CustomSelect
          options={["Route A", "Route B", "Route C"]}
          placeholder="Choose Route"
          bgColor="bg-black"
          textColor="text-white"
          icon={<IoMapOutline className="text-[#2e7d32] " size={20} />}
          onChange={(value) => console.log("Selected route:", value)}
        />

        <button
            onClick={() =>
            openDrawer(
              "right",
               <AvailableVehicles />,
              "Check availability" // heading passed here
            )
          }
          className="cursor-pointer w-full bg-[#2e7d32] text-xl text-white py-4 rounded-full font-[600] opacity-90 hover:opacity-100 transition flex items-center justify-center"
        >
          <span>Check availability</span>
        </button>
      </div>
    </div>
  );
}
