
import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    label,
    options,
    selectedValues,
    onChange,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter(v => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) return selectedValues[0];
        return `${selectedValues.length} seleccionados`;
    };

    return (
        <div className="space-y-2" ref={dropdownRef}>
            <label className="text-sm font-medium text-[#111418] dark:text-white block">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full h-12 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-background-dark text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer px-4 flex items-center justify-between"
                >
                    <span className={selectedValues.length === 0 ? 'text-[#617589] dark:text-[#9ca3af]' : ''}>
                        {getDisplayText()}
                    </span>
                    <span className={`material-symbols-outlined text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a2632] border border-[#dbe0e6] dark:border-[#374151] rounded-lg shadow-lg max-h-64 overflow-y-auto custom-scrollbar">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-[#617589] dark:text-[#9ca3af]">
                                No hay opciones disponibles
                            </div>
                        ) : (
                            options.map(option => (
                                <label
                                    key={option}
                                    className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#0d1117] cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option)}
                                        onChange={() => toggleOption(option)}
                                        className="w-4 h-4 text-primary bg-white dark:bg-background-dark border-[#dbe0e6] dark:border-[#374151] rounded focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <span className="ml-3 text-sm text-[#111418] dark:text-white">
                                        {option}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiSelectDropdown;
