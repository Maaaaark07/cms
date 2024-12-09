import React, { useState, useRef } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const ComplaintTypes = [
    { title: "Noise Complaints" },
    { title: "Property Disputes" },
    { title: "Public Disorder" },
    { title: "Violation of Barangay Ordinances" },
    { title: "Domestic Issues" },
    { title: "Traffic Violations" },
    { title: "Drug-Related Concerns" },
    { title: "Health and Sanitation Issues" },
    { title: "Environmental Concerns" },
    { title: "Violations of Business Regulations" },
    { title: "Community or Public Safety Issues" },
    { title: "Electrical or Utility Issues" },
    { title: "Disturbance from Animals" },
    { title: "Illegal Construction" },
    { title: "Discrimination or Harassment" },
    { title: "Illegal Gambling" },
    { title: "Public Health Violations" },
    { title: "Illegal Logging or Deforestation" },
    { title: "Electricity or Power Issues" },
    { title: "Noise from Religious or Public Gatherings" },
];

const SearchDropdown = ({
    options = ComplaintTypes,
    placeholder = "Search complaint type...",
    onSelect,
    uniqueKey,
    onSelectOption
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const dropdownRef = useRef(null);
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleOptionClick = (option) => {
        setSelectedType(uniqueKey && option[uniqueKey] ? option[uniqueKey] : option.title);
        setIsOpen(false);
        setSearchTerm("");
        if (onSelect) {
            onSelect(option);
        }
    };

    const handleOptionRemove = (e) => {
        e.stopPropagation()
        setSelectedType("");
        setIsOpen(false);
        setSearchTerm("");
        onSelect(null);
    }

    const filteredOptions = options?.filter((option) => {
        const keyToUse = uniqueKey && option[uniqueKey] ? option[uniqueKey] : option.title;
        return keyToUse.toLowerCase().includes(searchTerm.toLowerCase())
    });

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOutsideClick = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="relative border text-sm border-gray-300 p-2 w-full rounded-md text-gray-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={toggleDropdown}
            >
                {selectedType || <span className="text-gray-400">Select complaint type</span>}
                {selectedType && <IoCloseCircleOutline onClick={handleOptionRemove} className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />}
            </div>
            {isOpen && (
                <div className="absolute bg-white border border-gray-300 px-4 py-6 rounded-md shadow-lg mt-1 w-full z-10">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder={placeholder}
                        className="text-sm border rounded border-gray-300 p-2 mb-4 w-full text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ul className="max-h-40 overflow-y-auto">
                        {filteredOptions?.map((option) => (
                            <li
                                key={option[uniqueKey] || option.title}
                                onClick={() => handleOptionClick(option)}
                                className={`p-2 text-sm hover:bg-blue-100 cursor-pointer ${(option[uniqueKey] || option.title) === selectedType ? "bg-blue-100" : ""}`}
                            >
                                {option[uniqueKey] || option.title}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
