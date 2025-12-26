
import React from 'react';

interface SidebarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  locationTerm: string;
  setLocationTerm: (val: string) => void;
  statusFilters: string[];
  setStatusFilters: React.Dispatch<React.SetStateAction<string[]>>;
  floorsFilter: string;
  setFloorsFilter: (val: string) => void;
  floorOptions: string[];
  sizeFilter: string;
  setSizeFilter: (val: string) => void;
  sizeOptions: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  searchTerm, setSearchTerm,
  locationTerm, setLocationTerm,
  statusFilters, setStatusFilters,
  floorsFilter, setFloorsFilter,
  floorOptions,
  sizeFilter, setSizeFilter,
  sizeOptions
}) => {
  const toggleStatus = (status: string) => {
    setStatusFilters(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0 bg-white dark:bg-[#1a2632] border-r border-[#f0f2f4] dark:border-[#2a3b4d] md:h-[calc(100vh-64px)] md:sticky md:top-16 overflow-y-auto custom-scrollbar z-40">
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_list</span>
            Filtros
          </h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setLocationTerm('');
              setStatusFilters([]); // Todos deseleccionados
              setFloorsFilter('');
              setSizeFilter('');
            }}
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

        <div className="space-y-3">
          <label className="text-sm font-medium text-[#111418] dark:text-white block">Estado del proyecto</label>
          <div className="space-y-2">
            {['En proyecto', 'En Construcción', 'Completado', 'Concurso'].map(status => (
              <label key={status} className="flex items-center gap-3 cursor-pointer group">
                <input
                  checked={statusFilters.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="size-5 rounded border-[#dbe0e6] dark:border-[#374151] text-primary focus:ring-primary/20 bg-white dark:bg-background-dark"
                  type="checkbox"
                />
                <span className="text-sm text-[#617589] dark:text-[#9ca3af] group-hover:text-[#111418] dark:group-hover:text-white">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <hr className="border-[#f0f2f4] dark:border-[#2a3b4d]" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#111418] dark:text-white">Número de plantas</label>
          <select
            value={floorsFilter}
            onChange={(e) => setFloorsFilter(e.target.value)}
            className="w-full h-12 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-background-dark text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Todas las plantas</option>
            {floorOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#111418] dark:text-white">Rango / Tamaño</label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full h-12 rounded-lg border border-[#dbe0e6] dark:border-[#374151] bg-white dark:bg-background-dark text-[#111418] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Cualquier tamaño</option>
            {sizeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;