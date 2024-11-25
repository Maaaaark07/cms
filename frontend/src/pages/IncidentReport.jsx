import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import axios from "axios";

const IncidentReport = () => {
  const [blotters, setBlooters] = useState(null);

  useEffect(() => {
    fetchBlotters();
  }, []);

  async function fetchBlotters() {
    try {
      const response = await axios.get("http://localhost:8080/blotter", {
        withCredentials: true,
      });
      setBlooters(response.data);
      console.log(blotters);
    } catch (error) {
      console.error("Error fetching blotters data:", error);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row flex-grow">
        <Sidebar />
        <main className="flex-grow p-4 bg-gray-100">
          <div className="flex-grow p-6 bg-gray-100">
            <Breadcrumbs />
            <h1>Incident Report</h1>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncidentReport;
