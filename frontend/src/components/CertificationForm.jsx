import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

import SearchDropdown from '../components/SearchDropdown';
import CertificatePreview from '../components/CertificatePreview';
import { useCertificationForm } from '../hooks/useCertificationForm';
import renderAdditionalFields from '../utils/certificateFieldRenderer.jsx';

const CertificationForm = () => {
    let {
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
        renderCertificateMessage
    } = useCertificationForm();

    const [customPurpose, setCustomPurpose] = useState('');
    const [showCustomPurpose, setShowCustomPurpose] = useState(false);
    const [overrideMessage, setOverrideMessage] = useState(null);

    const handleGenerateTextContent = () => {
        if (renderCertificateMessage && renderCertificateMessage.length > 0) {
            const initialText = renderCertificateMessage.map((message) => message.text).join(' ');
            setCustomPurpose(initialText);
        }
        setShowCustomPurpose(true);
    };

    const handleEditTextContent = (e) => {
        const newValue = e.target.value;
        setCustomPurpose(newValue);
        setOverrideMessage([{ text: newValue, isBold: false }]);
    };

    const finalMessage = overrideMessage || renderCertificateMessage;

    return (
        <div className="col-span-1 md:col-span-3 mb-4">
            {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className='flex-1'>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                        Certification Type<span className="text-red-600">*</span>
                    </label>
                    <SearchDropdown
                        onSelect={handleCertificateTypeChange}
                        options={certificateTypes}
                        uniqueKey={'iname'}
                    />
                </div>
                <div className='flex-1'>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                        Issuance Date<span className="text-red-600">*</span>
                    </label>
                    <input
                        type='date'
                        name="issuanceDate"
                        value={formData.issuanceDate}
                        onChange={handleInputChange}
                        className="text-sm border border-gray-300 p-2 w-full text-gray-500 focus:outline-none rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="">
                {renderAdditionalFields({
                    selectedCertificateType,
                    formData,
                    handleInputChange,
                    isComplainantModalOpen,
                    isApplicantModalOpen,
                    setIsComplainantModalOpen,
                    setIsApplicantModalOpen,
                    handleSelectComplainant,
                    handleSelectApplicant
                })}
            </div>

            <div className='grid grid-cols-1'>

                <div className="flex items-center space-x-2 mb-2">
                    <button
                        onClick={handleGenerateTextContent}
                        disabled={!selectedCertificateType}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Generate Purpose
                    </button>
                </div>
                {showCustomPurpose && (
                    <>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Purpose<span className="text-red-600">*</span>
                        </label>
                        <textarea
                            className="border text-sm border-gray-300 p-2 h-32 w-full text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={customPurpose}
                            onChange={handleEditTextContent}
                        />
                    </>
                )}

                <PDFViewer style={{ width: '100%', height: '100vh' }}>
                    <CertificatePreview
                        message={finalMessage}
                        brgyOfficials={brgyOfficials}
                        certificateTitle={selectedCertificateType?.iname || ''}
                        date={formData.issuanceDate
                            ? new Date(formData.issuanceDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                            : new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })
                        }
                    />
                </PDFViewer>
            </div>
        </div>
    );
};

export default CertificationForm;