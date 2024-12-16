import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

export const useCertificationForm = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [certificateTypes, setCertificateTypes] = useState([]);
    const [brgyOfficials, setBrgyOfficials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCertificateType, setSelectedCertificateType] = useState(null);
    const [isComplainantModalOpen, setIsComplainantModalOpen] = useState(false);
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);

    const { barangayId } = useAuth();

    const initialFormData = {
        certificateType: null,
        issuanceDate: '',
        complainantName: '',
        complainantMiddleName: '',
        complainantAddress: '',
        complainantContact: '',
        complainantAge: '',
        civilStatus: '',
        businessName: '',
        businessAddress: '',
        closureDate: '',
        startDate: '',
        endDate: '',
        calamityName: '',
        dateOfDeath: '',
        placeOfDeath: '',
        deceasedName: '',
        purpose: '',
        relationship: '',
        lotLocation: '',
        permitType: '',
        solo_parent_type: '',
        calamity_type: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchCertificateType(),
                    fetchBarangayOfficials()
                ]);
            } catch (error) {
                setErrorMessage("Failed to load initial data");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [barangayId]);

    const fetchCertificateType = async () => {
        try {
            const response = await axios.get("http://localhost:8080/certificate/", {
                withCredentials: true,
            });
            setCertificateTypes(response.data);
        } catch (error) {
            console.error("Error fetching certificate types:", error);
            setErrorMessage("Failed to fetch certificate types");
        }
    };

    const fetchBarangayOfficials = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/official/${barangayId}`, {
                withCredentials: true,
            });
            setBrgyOfficials(response.data);
        } catch (error) {
            console.error('Error fetching barangay officials:', error);
            setErrorMessage('Failed to fetch barangay officials');
        }
    };

    const handleCertificateTypeChange = (selectedValue) => {
        const selectedCertificate = certificateTypes.find(cert => cert.iid === selectedValue.iid);
        
        setFormData(prev => ({
            ...initialFormData,
            certificateType: selectedCertificate,
        }));

        setSelectedCertificateType(selectedCertificate);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectComplainant = (resident) => {
        setFormData(prev => ({
            ...prev,
            complainantName: `${resident.first_name} ${resident.last_name}`,
            complainantMiddleName: resident.middle_name || '',
            complainantAddress: `${resident.address || ""} ${resident.purok}, ${resident.barangay}`,
            completeAddress: `${resident.address || ""} ${resident.purok}, ${resident.barangay} ${resident.city} ${resident.province}`,
            complainantContact: resident.contact_number || "",
            complainantAge: resident.age || "",
            civilStatus: resident.civil_status
        }));

        setIsComplainantModalOpen(false);
    };

    const handleSelectApplicant = (resident) => {
        setFormData(prev => ({
            ...prev,
            applicantName: `${resident.first_name} ${resident.last_name} ${resident.middle_name}`,
        }));
        setIsApplicantModalOpen(false);
    };

    const renderCertificateMessage = useMemo(() => {
        if (!selectedCertificateType || !brgyOfficials.length) {
            return [{ text: "Please select a certificate type first", isBold: false }];
        }

        let message = selectedCertificateType.body_text || '';

        // Replacement map for dynamic values
        const replacements = {
            '[BARANGAY_CAPTAIN]': brgyOfficials[0]?.full_name || '[BARANGAY_CAPTAIN]',
            '[APPLICANT_NAME]': formData.applicantName || formData.complainantName || '[APPLICANT_NAME]',
            '[RESIDENT_NAME]': formData.complainantName || '[RESIDENT_NAME]',
            '[BUSINESS_NAME]': formData.businessName || '[BUSINESS_NAME]',
            '[ADDRESS]': formData.complainantAddress || formData.businessAddress || '[ADDRESS]',
            '[CIVIL_STATUS]': formData.civilStatus || '[CIVIL_STATUS]',
            '[AGE]': formData.complainantAge || '[AGE]',
            '[PURPOSE]': formData.purpose || '[PURPOSE]',
            '[DECEASED_NAME]': formData.complainantName || '[DECEASED_NAME]',
            '[PLACE_OF_DEATH]': formData.placeOfDeath || '[PLACE_OF_DEATH]',
            '[LOT_LOCATION]': formData.lotLocation || '[LOT_LOCATION]',
            '[RELATIONSHIP]': formData.relationship || '[RELATIONSHIP]',
            '[CALAMITY_NAME]': formData.calamityName || '[CALAMITY_NAME]',
            '[DATE]': (() => {
                const date = new Date().getDate();
                const suffix = (date % 10 === 1 && date !== 11) ? 'st' :
                    (date % 10 === 2 && date !== 12) ? 'nd' :
                        (date % 10 === 3 && date !== 13) ? 'rd' : 'th';
                return date + suffix;
            })(),
            '[MONTH]': new Date().toLocaleString('default', { month: 'long' }),
            '[YEAR]': new Date().getFullYear().toString(),
            '[CLOSURE_DATE]': formData.closureDate ? new Date(formData.closureDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '[CLOSURE_DATE]',
            '[START_DATE]': formData.startDate ? new Date(formData.startDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '[START_DATE]',
            '[END_DATE]': formData.endDate ? new Date(formData.endDate).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '[END_DATE]',
            '[DATE_OF_DEATH]': formData.dateOfDeath ? new Date(formData.dateOfDeath).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '[DATE_OF_DEATH]',
        };

        const excludeBoldKeys = [
            '[DATE]', '[MONTH]', '[YEAR]', '[CLOSURE_DATE]', '[START_DATE]', '[END_DATE]', '[DATE_OF_DEATH]'
        ];

        const parts = message.split(/(\[[A-Z_]+\])/g).map(part => {
            if (replacements[part]) {
                const isBold = !excludeBoldKeys.includes(part);
                return { text: replacements[part], isBold };
            }
            return { text: part, isBold: false };
        });

        return parts;
    }, [selectedCertificateType, brgyOfficials, formData]);

    return {
        errorMessage,
        certificateTypes,
        brgyOfficials,
        loading,
        selectedCertificateType,
        isComplainantModalOpen,
        isApplicantModalOpen,
        formData,
        setIsComplainantModalOpen,
        setIsApplicantModalOpen,
        handleCertificateTypeChange,
        handleInputChange,
        handleSelectComplainant,
        handleSelectApplicant,
        renderCertificateMessage,
    };
};