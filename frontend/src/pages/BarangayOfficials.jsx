import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';

import Breadcrumbs from '../components/Breadcrumbs'
import { useAuth } from '../components/AuthContext';
import cfg from '../../../server/config/domain';

const BarangayOfficials = () => {
  const { barangayId } = useAuth();
  const [barangayOfficials, setBarangayOfficials] = useState([]);

  useEffect(() => {
    if (barangayId) {
      fetchBarangayOfficials();
    }
  }, [barangayId]);

  const fetchBarangayOfficials = async () => {
    try {
      const response = await axios.get(`http://${cfg.domainname}:${cfg.serverport}/official/` + barangayId, {
        withCredentials: true,
      });
      if (response.status !== 200) throw new Error("Something went wrong with fetching data");
      setBarangayOfficials(response.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="flex-grow p-6 bg-gray-100">
      <Breadcrumbs />
      <div className="mx-auto bg-white p-10 rounded-lg">
        <div className='mb-10 leading-3 text-center'>
          <h2 className="text-2xl text-gray-500 font-bold mb-2">Barangay Officials Organizational Chart</h2>
          <p className="text-sm text-gray-500 mb-6">This is the barangay officials organizational chart, highlighting the Barangay Chairman at the top followed by other officials in the hierarchy.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {barangayOfficials.length > 0 ? (
            barangayOfficials.map((official) => (
              <div
                key={official.official_id}
                className="w-64 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-md text-center"
              >
                <div className="mb-4">
                  {official.profile_image ? (
                    <img
                      src={`http://${cfg.domainname}:${cfg.serverport}${official.profile_image}`}
                      alt={`${official.full_name}'s profile`}
                      className="w-24 h-24 mx-auto rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">No Image</span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{official.full_name}</h3>
                <p className="text-gray-600">{official.cms_position}</p>
                <p className="text-blue-600 text-sm">{official.committee}</p>
                <p className="mt-2 text-sm text-gray-700">Contact: {official.contact_number || "N/A"}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No barangay officials found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default BarangayOfficials;