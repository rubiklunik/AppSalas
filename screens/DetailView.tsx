
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Project, GroundingSource } from '../types';
import Header from '../components/Header';
import { getNearbyAmenities } from '../services/geminiService';
import { fetchProjectByCod } from '../services/dataService';

const DetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [geminiSources, setGeminiSources] = useState<GroundingSource[]>([]);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      const p = await fetchProjectByCod(projectId);
      setProject(p);
      setIsLoading(false);
    };
    loadProject();
  }, [projectId]);

  const handleAskGemini = async () => {
    if (!project?.coordinates) return;
    setIsLoadingGemini(true);
    try {
      const result = await getNearbyAmenities(
        project.coordinates.lat,
        project.coordinates.lng,
        `¿Qué hay cerca de ${project.name} en ${project.location}, calle ${project.address}?`
      );
      setGeminiResponse(result.text);
      setGeminiSources(result.sources);
    } catch (error) {
      setGeminiResponse("No se pudo obtener información de servicios en este momento.");
    } finally {
      setIsLoadingGemini(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500 font-bold">Cargando detalles de la promoción...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
          <h2 className="text-2xl font-bold mb-2">Promoción no encontrada</h2>
          <p className="text-gray-500 mb-6">No hemos podido localizar los datos del proyecto con Cod: {projectId}</p>
          <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Volver a la lista</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex justify-center py-6 px-4 md:px-8">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          <div>
            <Link to="/promociones" className="group flex items-center justify-center min-w-[84px] cursor-pointer rounded-lg h-10 px-4 bg-white dark:bg-[#1a2632] text-[#111418] dark:text-white border border-[#e5e7eb] dark:border-[#2a3846] hover:bg-gray-50 dark:hover:bg-[#23303d] transition-all shadow-sm gap-2 text-sm font-bold w-fit">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              <span>Volver a lista</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">{project.name}</h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${project.statusColor.replace('bg-', 'ring-').replace('text-', 'text-')}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {project.status}
                </span>
              </div>
              <p className="text-[#617589] dark:text-gray-400 text-base font-normal flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                Cod: {project.ref}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-white dark:bg-transparent border border-[#e5e7eb] dark:border-[#3f4f60] text-[#111418] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#2a3846] transition-colors gap-2">
                <span className="material-symbols-outlined text-[20px]">map</span>
                <span className="hidden sm:inline">Ver Mapa</span>
              </button>
              <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm gap-2">
                <span className="material-symbols-outlined text-[20px]">download</span>
                <span>Exportar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Información General
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Dirección del Proyecto</p>
                    <p className="font-medium text-base">{project.address || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Municipio / Provincia</p>
                    <p className="font-medium text-base">{project.location} / {project.province}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Comunidad Autónoma</p>
                    <p className="font-medium text-base">{project.community}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Referencia Catastral</p>
                    <p className="font-medium text-base font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded w-fit text-sm">{project.cadastralRef || 'PENDIENTE'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Tipo de Negocio</p>
                    <p className="font-medium text-base">{project.businessType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Régimen</p>
                    <p className="font-medium text-base">{project.regime}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">category</span>
                    Información Tipológica
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Tipología</p>
                    <p className="font-medium text-base">{project.typology || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Subtipología</p>
                    <p className="font-medium text-base">{project.subtypology || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Cubierta</p>
                    <p className="font-medium text-base">{project.roofType || '-'}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3b4d]">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Datos Técnicos y Financieros
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-background-light dark:bg-[#101922] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Presupuesto</p>
                      <p className="text-xl font-black">{project.budget || '-'}</p>
                    </div>
                    <div className="bg-background-light dark:bg-[#101922] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Tamaño</p>
                      <p className="text-xl font-black">{project.size || '-'}</p>
                    </div>
                    <div className="bg-background-light dark:bg-[#101922] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Superficie</p>
                      <p className="text-xl font-black">{project.surface || '-'}</p>
                    </div>
                    <div className="bg-background-light dark:bg-[#101922] p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Unidades</p>
                      <p className="text-xl font-black">{project.units}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Arquitecto</p>
                      <p className="font-medium">{project.architect || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Constructora</p>
                      <p className="font-medium">{project.builder || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Plantas</p>
                      <p className="font-medium">{project.floors || '-'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    Análisis de Entorno (IA Gemini)
                  </h3>
                  <button
                    onClick={handleAskGemini}
                    disabled={isLoadingGemini}
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    {isLoadingGemini ? <span className="animate-spin material-symbols-outlined text-[16px]">sync</span> : <span className="material-symbols-outlined text-[16px]">psychology</span>}
                    Analizar con Google Maps
                  </button>
                </div>

                {geminiResponse ? (
                  <div className="space-y-4">
                    <div className="text-sm text-[#617589] dark:text-gray-300 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100/50 dark:border-blue-800/20">
                      {geminiResponse}
                    </div>
                    {geminiSources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {geminiSources.map((source, idx) => (
                          <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Haz clic para analizar los servicios y puntos de interés cercanos a este proyecto.</p>
                )}
              </section>

              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm p-6">
                <h3 className="text-lg font-bold mb-3">Descripción / Notas Técnicas</h3>
                <p className="text-[#617589] dark:text-gray-300 leading-relaxed">
                  {project.description || 'Sin descripción adicional en la hoja de cálculo.'}
                </p>
              </section>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm overflow-hidden sticky top-24">
                <div className="flex flex-col">
                  <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                    <h3 className="text-lg font-bold">Ubicación</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                    <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 h-64 relative group">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        srcDoc={`
                          <style>
                            body { margin: 0; overflow: hidden; }
                            .map-container { width: 100%; height: 100%; position: relative; }
                            iframe { border: 0; width: 100%; height: 100%; }
                            .overlay { 
                              position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                              display: flex; align-items: center; justify-content: center;
                              background: rgba(0,0,0,0.05); cursor: pointer; transition: background 0.3s;
                            }
                            .overlay:hover { background: rgba(0,0,0,0); }
                          </style>
                          <div class="map-container" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.address || ''} ${project.location} ${project.province}`)}', '_blank')">
                            <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(`${project.address || ''} ${project.location} ${project.province}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed"></iframe>
                            <div class="overlay"></div>
                          </div>
                        `}
                        title="Google Maps"
                      ></iframe>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.address || ''} ${project.location} ${project.province}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-[#23303d] border border-gray-200 dark:border-[#3f4f60] rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#2a3846] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">directions</span>
                      Ver en Google Maps
                    </a>
                  </div>

                  <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846] bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="text-lg font-bold">Imagen del proyecto</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-4 border-b border-[#f0f2f4] dark:border-[#2a3846]">
                    <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                      {project.detailImgUrl ? (
                        <a href={project.detailImgUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
                          <img src={project.img} className="w-full aspect-video object-cover" alt="Render" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg">
                              <span className="material-symbols-outlined">open_in_new</span>
                              <span className="font-bold">Abrir imagen</span>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <img src={project.img} className="w-full aspect-video object-cover" alt="Render" />
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846] bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="text-lg font-bold">Plano</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      {project.pdfUrl ? (
                        <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
                          <img
                            src={project.planImg || project.img}
                            className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            alt="Plano"
                          />
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white bg-primary px-4 py-2 rounded-lg shadow-lg">
                              <span className="material-symbols-outlined">picture_as_pdf</span>
                              <span className="font-bold">Abrir archivo PDF</span>
                            </div>
                          </div>
                        </a>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video p-6 text-center text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2">picture_as_pdf</span>
                          <p className="text-xs">No hay plano PDF disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailView;