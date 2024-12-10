import React from 'react'
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Breadcrumbs from "../components/Breadcrumbs";
import SearchDropdown from '../components/SearchDropdown';
import SearchModal from '../components/SearchModal';
import { useAuth } from '../components/AuthContext';

import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { PDFViewer } from '@react-pdf/renderer';
import CertificatePreview from '../components/CertificatePreview';
import axios from 'axios';

const AddCertificationPage = () => {

    const [errorMessage, setErrorMessage] = useState(null);
    const [certificateTypes, setCertificateTypes] = useState([]);
    const [brgyOfficials, setBrgyOfficials] = useState([]);
    const [selectedCertificateType, setSelectedCertificateType] = useState();
    const [isComplainantModalOpen, setIsComplainantModalOpen] = useState(false);
    const [complainantName, setComplainantName] = useState("");
    const [complainantAddress, setComplainantAddress] = useState("");
    const [applicantMiddleName, setApplicantMiddleName] = useState("");
    const [certificateTitle, setCertificateTitle] = useState("");
    const [ApplicantAge, setApplicantAge] = useState("");
    const [civilStatus, setCivilStatus] = useState("")
    const [message, setMessage] = useState("")
    const [complainantContact, setComplainantContact] = useState("");

    const [certificateDetails, setCertificateDetails] = useState({
        barangayCaptain: '',
        businessName: '',
        address: '',
        closureDate: '',
        issuedDate: ''
    });

    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const [loading, setLoading] = useState(false);
    const { barangayId } = useAuth();
    console.log(barangayId)

    useEffect(() => {
        fetchCertificateType()
        fetchBarangayOfficials()
    }, []);

    async function fetchCertificateType() {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/certificate/", {
                withCredentials: true,
            });
            setCertificateTypes(response.data);

        } catch (error) {
            console.error("Error fetching certificate types:", error);
            setError("Failed to fetch certificate types. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchBarangayOfficials() {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/official/' + barangayId, {
                withCredentials: true,
            });
            setBrgyOfficials(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching barangay officials:', error);
            setError('Failed to fetch barangay officials. Please try again later.');
        } finally {
            setLoading(false);
        }
    }


    const handleCertifacteType = (selectedValue) => {
        const selectedCertificate = certificateTypes.find(cert => cert.iid === selectedValue.iid);
        setSelectedCertificateType(selectedCertificate);
        setCertificateTitle(selectedCertificate.iname)

        if (selectedCertificate) {
            setCertificateDetails(prev => ({
                ...prev,
                template: selectedCertificate.body_text || ''
            }));
        }
    };

    const renderCertificateMessage = (resident) => {
        if (!selectedCertificateType) {
            return "Please select a certificate type first";
        }

        let message = selectedCertificateType.body_text || '';

        message = message.replace('[BARANGAY_CAPTAIN]', brgyOfficials[0].full_name)
            .replace('[BUSINESS_NAME]', certificateDetails.businessName || 'MilkTeahanNgInaMo')
            .replace('[ADDRESS]', complainantAddress || '[Address]')
            .replace('[APPLICANT_NAME]', complainantName)
            .replace('[CLOSURE_DATE]', certificateDetails.closureDate || 'Mamayang Gabi')
            .replace('[DATE]', new Date().getDate().toString())
            .replace('[MONTH]', new Date().toLocaleString('default', { month: 'long' }))
            .replace('[YEAR]', new Date().getFullYear().toString())
            .replace('[RESIDENT_NAME]', complainantName)
            .replace('[CIVIL_STATUS]', civilStatus)
            .replace('[AGE]', ApplicantAge)

        return message;
    };

    const handleSelectComplainant = (resident) => {
        setComplainantName(`${resident.first_name} ${resident.last_name}`);
        setComplainantAddress(`${resident.address || ""} ${resident.purok}, ${resident.barangay}`);
        setApplicantMiddleName(`${resident.middle_name}`)
        setComplainantContact(resident.contact_number || "");
        setCivilStatus(resident.civil_status)
        setApplicantAge(resident.age || "")

        setIsComplainantModalOpen(false);
    }

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-row flex-grow">
                <Sidebar />
                <main className="flex-grow p-4 bg-gray-100">
                    <div className="flex-grow p-6 bg-gray-100">
                        <Breadcrumbs />
                        <div className="mx-auto bg-white p-10 rounded-lg">
                            <div className="mb-6 leading-3">
                                <h1 className="text-xl font-semibold text-gray-500">Add Certification</h1>
                                <p className="text-sm text-gray-400 mt-2">Fill out the form below to add a new certificate to the system.</p>
                            </div>
                            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                            <div className="col-span-1 md:col-span-3 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6  mb-8">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Certifcation Type<span className="text-red-600">*</span></label>
                                        <SearchDropdown onSelect={handleCertifacteType} options={certificateTypes} uniqueKey={'iname'} />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Insuance Date<span className="text-red-600">*</span></label>
                                        <input
                                            type='date'
                                            name="InsuanceDate"
                                            className=" text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md  focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Name<span className="text-red-600">*</span></label>
                                        <div className="relative rounded-md ">
                                            <input type="text" name="applicantName" placeholder="Type or Search Complainant Name" className=" text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md  focus:ring-2 focus:ring-blue-500" value={complainantName} onChange={(e) => setComplainantName(e.target.value)} />
                                            <div className="h-full w-9 absolute flex items-center justify-center right-0 top-0 bg-blue-600 cursor-pointer rounded-r-md" onClick={() => setIsComplainantModalOpen((prev) => !prev)}>
                                                <IoSearch className="w-5 h-5 text-white" />
                                            </div>
                                            <SearchModal
                                                title="Select Complainant"
                                                isOpen={isComplainantModalOpen}
                                                onClose={() => setIsComplainantModalOpen(false)}
                                                onSelect={handleSelectComplainant} />
                                        </div>
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Middle Name<span className="text-red-600">*</span></label>
                                        <input type="text" name="applicantAddress" placeholder="Type Complainant Address" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={applicantMiddleName} onChange={(e) => setApplicantMiddleName(e.target.value)} />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Age</label>
                                        <input type="text" name="applicantAge" placeholder="Type Complainant Contact Number" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={ApplicantAge} onChange={(e) => setApplicantAge(e.target.value)} />
                                    </div>
                                    <div className='flex-1'>
                                        <label className="block mb-2 text-sm font-medium text-gray-500">Address<span className="text-red-600">*</span></label>
                                        <input type="text" name="applicantAddress" placeholder="Type Complainant Address" className="border text-sm border-gray-300 p-2 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={complainantAddress} onChange={(e) => setComplainantAddress(e.target.value)} />
                                    </div>
                                </div>
                                <div></div>
                                <div className='grid grid-cols-1'>
                                    <label className="block mb-2 text-sm font-medium text-gray-500">Purpose<span className="text-red-600">*</span></label>
                                    {selectedCertificateType ? (
                                        <textarea
                                            className="border text-sm border-gray-300 p-2 h-32 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            name="certificateDetails"
                                            value={renderCertificateMessage()}
                                        />
                                    ) : (
                                        <textarea
                                            className="border text-sm border-gray-300 p-2 h-32 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Please select a certificate type first"
                                            readOnly
                                        />
                                    )}

                                    <PDFViewer style={{ width: '100%', height: '100vh' }}>
                                        <CertificatePreview
                                            message={renderCertificateMessage()}
                                            brgyOfficials={brgyOfficials}
                                            certificateTitle={certificateTitle}
                                            date={new Intl.DateTimeFormat('en-US', options).format(now)}
                                        />
                                    </PDFViewer>

                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AddCertificationPage