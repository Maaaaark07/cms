import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cfg from '../../../server/config/domain.js';

const selectClass = 'text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';

const LocationCascade = ({ value = {}, onChange, required = false }) => {
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const regionId = value.regionId || '';
    const provinceId = value.provinceId || '';
    const cityId = value.cityId || '';
    const barangayId = value.barangayId || '';

    useEffect(() => {
        axios.get(`http://${cfg.domainname}:${cfg.serverport}/location/region`, { withCredentials: true })
            .then((response) => setRegions(response.data || []))
            .catch(() => setRegions([]));
    }, []);

    useEffect(() => {
        if (!regionId) {
            setProvinces([]);
            return;
        }
        axios.get(`http://${cfg.domainname}:${cfg.serverport}/location/provinces/${regionId}`, { withCredentials: true })
            .then((response) => setProvinces(response.data || []))
            .catch(() => setProvinces([]));
    }, [regionId]);

    useEffect(() => {
        if (!provinceId) {
            setCities([]);
            return;
        }
        axios.get(`http://${cfg.domainname}:${cfg.serverport}/location/cities/${provinceId}`, { withCredentials: true })
            .then((response) => setCities(response.data || []))
            .catch(() => setCities([]));
    }, [provinceId]);

    useEffect(() => {
        if (!cityId) {
            setBarangays([]);
            return;
        }
        axios.get(`http://${cfg.domainname}:${cfg.serverport}/location/barangay/${cityId}`, { withCredentials: true })
            .then((response) => setBarangays(response.data || []))
            .catch(() => setBarangays([]));
    }, [cityId]);

    const update = (next) => {
        onChange({
            regionId,
            provinceId,
            cityId,
            barangayId,
            ...next,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
            <select
                value={regionId}
                required={required}
                className={selectClass}
                onChange={(event) => update({
                    regionId: event.target.value,
                    provinceId: '',
                    cityId: '',
                    barangayId: '',
                })}
            >
                <option value="">Select Region</option>
                {regions.map((region) => (
                    <option key={region.iid} value={region.iid}>{region.iname}</option>
                ))}
            </select>
            <select
                value={provinceId}
                required={required}
                disabled={!regionId}
                className={selectClass}
                onChange={(event) => update({
                    provinceId: event.target.value,
                    cityId: '',
                    barangayId: '',
                })}
            >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                    <option key={province.iid} value={province.iid}>{province.iname}</option>
                ))}
            </select>
            <select
                value={cityId}
                required={required}
                disabled={!provinceId}
                className={selectClass}
                onChange={(event) => update({
                    cityId: event.target.value,
                    barangayId: '',
                })}
            >
                <option value="">Select City / Municipality</option>
                {cities.map((city) => (
                    <option key={city.iid} value={city.iid}>{city.iname}</option>
                ))}
            </select>
            <select
                value={barangayId}
                required={required}
                disabled={!cityId}
                className={selectClass}
                onChange={(event) => update({ barangayId: event.target.value })}
            >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                    <option key={barangay.iid} value={barangay.iid}>{barangay.iname}</option>
                ))}
            </select>
        </div>
    );
};

export default LocationCascade;
