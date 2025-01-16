import React, { useState, useRef, useEffect } from 'react';
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
        isSelectMotherModalOpen,
        isSelectFatherModalOpen,
        formData,
        setIsComplainantModalOpen,
        setIsApplicantModalOpen,
        setIsSelectMotherModalOpen,
        setIsSelectFatherModalOpen,
        handleCertificateTypeChange,
        handleInputChange,
        handleSelectComplainant,
        handleSelectApplicant,
        handleSelectMother,
        handleSelectFather,
        renderCertificateMessage,
        setIsIssuedToModalOpen,
        isIssuedToModalOpen,
        handleIssuedTo,
        handlePartnerName,
        isPartnerNameModalOpen,
        setIsPartnerNameModalOpen,
    } = useCertificationForm();

    const [customPurpose, setCustomPurpose] = useState('');
    const [showCustomPurpose, setShowCustomPurpose] = useState(false);
    const [overrideMessage, setOverrideMessage] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerateButtonDisabled, setIsGenerateButtonDisabled] = useState(false);
    const textareaRef = useRef(null);

    const handleGenerateTextContent = () => {
        if (renderCertificateMessage && renderCertificateMessage.length > 0) {

            setShowCustomPurpose(true);

            setIsGenerateButtonDisabled(true);
            setIsGenerating(true);

            const initialMessages = renderCertificateMessage;
            let currentText = '';
            let currentIndex = 0;

            const typeText = () => {
                if (currentIndex < initialMessages.length) {
                    const currentMessage = initialMessages[currentIndex];

                    // If this message is bold, wrap it in strong tags
                    const messageText = currentMessage.isBold
                        ? `<strong>${currentMessage.text}</strong>`
                        : currentMessage.text;

                    currentText += messageText + ' ';

                    // Create a temp div to safely render HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = currentText;
                    setCustomPurpose(tempDiv.innerText);

                    currentIndex++;

                    // Randomize typing speed within 3-second total generation time
                    const delay = 5000 / initialMessages.length;
                    setTimeout(typeText, delay);
                } else {
                    // Set the final message with original bold formatting
                    setIsGenerating(false);
                    setOverrideMessage(initialMessages);
                    setIsGenerateButtonDisabled(false);
                }
            };

            // Start typing
            typeText();
        }
    };

    const handleEditTextContent = (e) => {
        const newValue = e.target.value;
        setCustomPurpose(newValue);
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to correctly calculate the scroll height
            textareaRef.current.style.height = 'auto';
            // Set height based on scroll height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [customPurpose]);

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
                <div className='flex-1'>
                    <label className="block mb-2 text-sm font-medium text-gray-500">
                        Amount<span className="text-red-600">*</span>
                    </label>
                    <input
                        type='date'
                        name="amount"
                        value={formData.amount}
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
                    isSelectMotherModalOpen,
                    isSelectFatherModalOpen,
                    setIsComplainantModalOpen,
                    setIsApplicantModalOpen,
                    setIsSelectMotherModalOpen,
                    setIsSelectFatherModalOpen,
                    handleSelectComplainant,
                    handleSelectApplicant,
                    handleSelectMother,
                    handleSelectFather,
                    setIsIssuedToModalOpen,
                    isIssuedToModalOpen,
                    handleIssuedTo,
                    handlePartnerName,
                    isPartnerNameModalOpen,
                    setIsPartnerNameModalOpen,
                })}
            </div>

            <div className='grid grid-cols-1'>
                <div className="flex items- justify-end space-x-2 mb-2">
                    <button
                        onClick={handleGenerateTextContent}
                        disabled={!selectedCertificateType || isGenerateButtonDisabled}
                        className={`
                            bg-blue-500 text-white px-4 py-2 rounded-md text-sm 
                            hover:bg-blue-600 
                            ${isGenerateButtonDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-600'}
                            ${!selectedCertificateType ? 'disabled:bg-gray-300 disabled:cursor-not-allowed' : ''}
                        `}
                    >
                        {isGenerateButtonDisabled ? 'Generating...' : 'Generate'}
                    </button>
                </div>

                {showCustomPurpose && (
                    <>
                        <label className="block mb-2 text-sm font-medium text-gray-500">
                            Certificate text content:
                        </label>
                        <div className="relative w-full">
                            <textarea
                                ref={textareaRef}
                                className={`
                                    border text-sm border-gray-300 p-2 w-full 
                                    text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${isGenerating ? 'bg-gray-100 cursor-wait' : ''}
                                    resize-none overflow-hidden min-h-[100px]
                                `}
                                value={customPurpose}
                                onChange={handleEditTextContent}
                                disabled={isGenerating}
                                placeholder={isGenerating ? 'Generating text...' : 'Edit your purpose here'}
                            />
                            {isGenerating && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-pulse text-gray-400">
                                        Generating text...
                                    </div>
                                </div>
                            )}
                        </div>
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