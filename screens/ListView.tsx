
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import { fetchAllProjects } from '../services/dataService';

const ListView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['En proyecto', 'En Construcción', 'Completado', 'Concurso']);
  const [floorsFilter, setFloorsFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchAllProjects();
      setProjects(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const floorOptions = Array.from(new Set(projects.map(p => p.floors))).filter((f): f is string => typeof f === 'string' && f !== '' && f !== '-').sort((a, b) => {
    // Intentar ordenar numéricamente si es posible
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const sizeOptions = Array.from(new Set(projects.map(p => p.size))).filter((s): s is string => typeof s === 'string' && s !== '' && s !== '-').sort();

  const filteredProjects = projects.filter(p => {
    // Aseguramos que 'ref' (Cod) se compare como texto para la búsqueda
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.ref).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = p.location.toLowerCase().includes(locationTerm.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
    const matchesFloors = floorsFilter === '' || p.floors === floorsFilter;
    const matchesSize = sizeFilter === '' || p.size === sizeFilter;
    return matchesSearch && matchesLocation && matchesStatus && matchesFloors && matchesSize;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'units') {
      const unitsA = parseInt(a.units) || 0;
      const unitsB = parseInt(b.units) || 0;
      return unitsA - unitsB;
    }
    // Default: Más recientes (por Cod descendente)
    return parseInt(b.ref) - parseInt(a.ref);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
        <Sidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          locationTerm={locationTerm}
          setLocationTerm={setLocationTerm}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          floorsFilter={floorsFilter}
          setFloorsFilter={setFloorsFilter}
          floorOptions={floorOptions}
          sizeFilter={sizeFilter}
          setSizeFilter={setSizeFilter}
          sizeOptions={sizeOptions}
        />

        <main className="flex-1 min-w-0">
          <div className="sticky top-16 z-30 bg-white dark:bg-[#0d1117] border-b border-[#f0f2f4] dark:border-[#2a3b4d] px-6 md:px-8 lg:px-10 py-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#111418] dark:text-white tracking-tight mb-1">Histórico de Promociones</h1>
                <p className="text-[#617589] dark:text-[#9ca3af] text-base">Consulta datos en tiempo real desde Supabase</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a2632] p-1.5 rounded-xl border border-[#f0f2f4] dark:border-[#2a3b4d]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-background-dark text-primary shadow-sm' : 'text-[#617589] dark:text-[#9ca3af] hover:text-[#111418] dark:hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Cuadrícula</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-background-dark text-primary shadow-sm' : 'text-[#617589] dark:text-[#9ca3af] hover:text-[#111418] dark:hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">view_list</span>
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#f0f2f4] dark:border-[#2a3b4d]">
              <p className="text-sm font-semibold text-[#111418] dark:text-white">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                    Sincronizando con Supabase...
                  </span>
                ) : (
                  <>
                    <span className="text-primary font-black">{filteredProjects.length}</span> resultados encontrados
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#617589] dark:text-[#9ca3af]">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-bold bg-gray-50 dark:bg-[#1a2632] border border-[#f0f2f4] dark:border-[#2a3b4d] rounded-lg text-[#111418] dark:text-white focus:ring-primary focus:border-primary cursor-pointer py-1.5 px-3 outline-none"
                >
                  <option value="recent">Más recientes</option>
                  <option value="name">Nombre (A-Z)</option>
                  <option value="units">Viviendas (Menor a mayor)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">

            {isLoading ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className={`bg-white dark:bg-[#1a2632] rounded-xl border border-[#f0f2f4] dark:border-[#2a3b4d] animate-pulse ${viewMode === 'list' ? 'h-64' : 'h-96'}`}>
                    <div className={`bg-gray-200 dark:bg-gray-800 rounded-t-xl ${viewMode === 'list' ? 'h-full w-80' : 'h-48 w-full'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} viewMode={viewMode} />
                ))}
              </div>
            )}

            {!isLoading && filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2632] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
                <p className="text-xl font-bold text-gray-500">No se encontraron promociones</p>
                <p className="text-gray-400">Intenta ajustar los filtros o los términos de búsqueda</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ListView;