import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const IncidentRepotViewPage = () => {
  const { blotter_id } = useParams();
  const [incidentDetails, setIncidentDetails] = useState(null);

  useEffect(() => {
    fetchIncidentDetails();
  }, [blotter_id]);

  const fetchIncidentDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/blotter/` + Number(blotter_id),
        {
          withCredentials: true,
        }
      );

      setIncidentDetails(response.data);
    } catch (error) {
      console.error("Error fetching residents data:", error);
    }
  };

  if (!incidentDetails) return <p>Loading...</p>;
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Incident Report Details</h1>
      {incidentDetails.map((incident, index) => (
        <div key={incident.id || index}>
          <p>Blotter ID: {incident.blotter_id}</p>
          <p>Incident Type: {incident.incident_type}</p>
          <p>Complainant: {incident.complainant}</p>
          <p>Description: {incident.incident_description}</p>{" "}
        </div>
      ))}
    </div>
  );
};

export default IncidentRepotViewPage;
