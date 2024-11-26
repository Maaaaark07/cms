import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegFileLines } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";

const BlotterList = ({ blotterData }) => {
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  return (
    <div className="p-4 bg-white rounded-md">
      <h3 className="text-gray-500 text-xl font-bold mb-4">Incident Report</h3>
      {blotterData
        .sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date))
        .slice(0, 5)
        .map((incident) => (
          <div
            key={incident.blotter_id}
            className="flex items-center bg-blue-50 rounded-md p-4 justify-between mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-200 rounded-full p-4">
                <FaRegFileLines className="w-5 h-5 text-blue-600" />
              </div>
              <div className="leading-3 flex flex-col">
                <span className="text-sm font-bold text-gray-500">
                  {capitalizeFirstLetter(incident.incident_type)}
                </span>
                <span className="text-sm text-gray-500">
                  Incident Report ID:{" "}
                  <span className="text-blue-500">#{incident.blotter_id}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Complainant:{" "}
                  <span className="text-blue-500">{incident.complainant}</span>
                </span>
              </div>
            </div>
            <Link
              to={`/Incident-Report-View/` + incident.blotter_id}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-blue-500">View</span>
              <FaArrowRightLong className="w-3 h-3 text-blue-600" />
            </Link>
          </div>
        ))}
      <Link
        to="/Incident-Report"
        className="flex items-center w-full justify-center gap-2 mt-4 text-center"
      >
        <span className="text-sm text-blue-500">View All</span>
        <FaArrowRightLong className="w-3 h-3 text-blue-600" />
      </Link>
    </div>
  );
};

export default BlotterList;
