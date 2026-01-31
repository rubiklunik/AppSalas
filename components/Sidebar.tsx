
import React from 'react';
import MultiSelectDropdown from './MultiSelectDropdown';
import { useProjects } from '../hooks/useProjects';

const Sidebar: React.FC = () => {
  const {
    searchTerm, setSearchTerm,
    locationTerm, setLocationTerm,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    regimeFilter, setRegimeFilter,
    floorsFilter, setFloorsFilter,
    sizeFilter, setSizeFilter,
    options,
    clearFilters
  } = useProjects();

  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0 bg-white dark:bg-[#1a2632] border-r border-[#f0f2f4] dark:border-[#2a3b4d] md:h-[calc(100vh-64px)] md:sticky md:top-16 overflow-y-auto custom-scrollbar z-40">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            Filtros
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-[#617589] dark:text-[#9ca3af] hover:text-primary underline"
          >
            Limpiar todo
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#111418] dark:text-white">Búsqueda rápida</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] dark:text-[#9ca3af] text-xl">search</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-12 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-background-dark text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Nombre, referencia..."
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#111418] dark:text-white">Ubicación / Ciudad</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#617589] dark:text-[#9ca3af] text-xl">location_on</span>
            <input
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-12 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-background-dark text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Ej. Madrid, Barcelona..."
              type="text"
            />
          </div>
        </div>

        <hr className="border-[#f0f2f4] dark:border-[#2a3b4d]" />

        <MultiSelectDropdown
          label="Estado del proyecto"
          options={options.status}
          selectedValues={statusFilter}
          onChange={setStatusFilter}
          placeholder="Todos los estados"
        />

        <MultiSelectDropdown
          label="Tipo de promoción"
          options={options.type}
          selectedValues={typeFilter}
          onChange={setTypeFilter}
          placeholder="Todos los tipos"
        />

        <MultiSelectDropdown
          label="Regímenes"
          options={options.regime}
          selectedValues={regimeFilter}
          onChange={setRegimeFilter}
          placeholder="Todos los regímenes"
        />

        <hr className="border-[#f0f2f4] dark:border-[#2a3b4d]" />

        <MultiSelectDropdown
          label="Número de plantas"
          options={options.floors}
          selectedValues={floorsFilter}
          onChange={setFloorsFilter}
          placeholder="Todas las plantas"
        />

        <MultiSelectDropdown
          label="Rango / Tamaño"
          options={options.size}
          selectedValues={sizeFilter}
          onChange={setSizeFilter}
          placeholder="Cualquier tamaño"
        />

      </div>
    </aside>
  );
};

export default Sidebar;