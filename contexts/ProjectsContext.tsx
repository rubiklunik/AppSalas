
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { fetchAllProjects } from '../services/dataService';

interface ProjectsContextType {
    projects: Project[];
    filteredProjects: Project[];
    isLoading: boolean;

    // Filter states
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    locationTerm: string;
    setLocationTerm: (val: string) => void;
    statusFilter: string[];
    setStatusFilter: (val: string[]) => void;
    typeFilter: string[];
    setTypeFilter: (val: string[]) => void;
    regimeFilter: string[];
    setRegimeFilter: (val: string[]) => void;
    floorsFilter: string[];
    setFloorsFilter: (val: string[]) => void;
    sizeFilter: string[];
    setSizeFilter: (val: string[]) => void;

    // Sort and view
    sortBy: string;
    setSortBy: (val: string) => void;

    // Options for filters (computed from all projects)
    options: {
        status: string[];
        type: string[];
        regime: string[];
        floors: string[];
        size: string[];
    };

    refreshProjects: () => Promise<void>;
    clearFilters: () => void;
}

export const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [regimeFilter, setRegimeFilter] = useState<string[]>([]);
    const [floorsFilter, setFloorsFilter] = useState<string[]>([]);
    const [sizeFilter, setSizeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('recent');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const clearFilters = () => {
        setSearchTerm('');
        setLocationTerm('');
        setStatusFilter([]);
        setTypeFilter([]);
        setRegimeFilter([]);
        setFloorsFilter([]);
        setSizeFilter([]);
    };

    // Compute options for filters
    const options = useMemo(() => {
        const getUnique = (key: keyof Project) =>
            Array.from(new Set(projects.map(p => p[key] as string))).filter(Boolean).sort();

        const floors = Array.from(new Set(projects.map(p => p.floors)))
            .filter((f): f is string => typeof f === 'string' && f !== '' && f !== '-')
            .sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
            });

        return {
            status: getUnique('status'),
            type: getUnique('businessType'),
            regime: getUnique('regime'),
            floors,
            size: Array.from(new Set(projects.map(p => p.size)))
                .filter((s): s is string => typeof s === 'string' && s !== '' && s !== '-')
                .sort()
        };
    }, [projects]);

    // Apply filtering and sorting
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(p.ref).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = p.location.toLowerCase().includes(locationTerm.toLowerCase());
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(p.status);
            const matchesType = typeFilter.length === 0 || typeFilter.includes(p.businessType);
            const matchesRegime = regimeFilter.length === 0 || regimeFilter.includes(p.regime);
            const matchesFloors = floorsFilter.length === 0 || floorsFilter.includes(p.floors);
            const matchesSize = sizeFilter.length === 0 || sizeFilter.includes(p.size);

            return matchesSearch && matchesLocation && matchesStatus && matchesType && matchesRegime && matchesFloors && matchesSize;
        }).sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'units') {
                const unitsA = parseInt(a.units) || 0;
                const unitsB = parseInt(b.units) || 0;
                return unitsA - unitsB;
            }
            return parseInt(b.ref) - parseInt(a.ref);
        });
    }, [projects, searchTerm, locationTerm, statusFilter, typeFilter, regimeFilter, floorsFilter, sizeFilter, sortBy]);

    const value = {
        projects,
        filteredProjects,
        isLoading,
        searchTerm, setSearchTerm,
        locationTerm, setLocationTerm,
        statusFilter, setStatusFilter,
        typeFilter, setTypeFilter,
        regimeFilter, setRegimeFilter,
        floorsFilter, setFloorsFilter,
        sizeFilter, setSizeFilter,
        sortBy, setSortBy,
        options,
        refreshProjects: loadData,
        clearFilters
    };

    return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};
