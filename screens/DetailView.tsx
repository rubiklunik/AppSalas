
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Project } from '../types';
import Header from '../components/Header';
import { fetchProjectByCod, updateProjectNotes } from '../services/dataService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const DetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      setIsLoading(true);
      const p = await fetchProjectByCod(projectId);
      setProject(p);
      if (p) setNotes(p.notes || '');
      setIsLoading(false);
    };
    loadProject();
  }, [projectId]);

  const handleSaveNotes = async () => {
    if (!project) return;
    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMessage(null);
    const result = await updateProjectNotes(project.ref, notes);
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.message || 'Error desconocido');
    }
    setIsSaving(false);
  };

  const exportToPDF = async () => {
    if (!project) return;
    setIsExporting(true);

    const getProxiedUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('data:')) return url;
      const cleanUrl = url.replace(/^https?:\/\//, '');
      return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg&q=80`;
    };

    const loadImageAsBase64 = async (url: string): Promise<string> => {
      if (!url) return '';
      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Error loading image (Base64):', url, err);
        return '';
      }
    };

    // Geocoding robusto con Nominatim
    const getCoordinates = async (address: string, city: string, province: string) => {
      const tryFetch = async (q: string) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'es' }
          });
          const data = await response.json();
          return (data && data.length > 0) ? { lat: data[0].lat, lon: data[0].lon } : null;
        } catch (err) {
          console.error('Geocoding error for:', q, err);
          return null;
        }
      };

      // 1. Intentar Dirección completa + Ciudad
      let result = await tryFetch(`${address}, ${city}`);
      if (result) return result;

      // 2. Intentar solo Ciudad + Provincia
      result = await tryFetch(`${city}, ${province}`);
      if (result) return result;

      // 3. Solo Ciudad
      result = await tryFetch(city);
      return result;
    };

    // Mapping Tailwind colors to Hex for PDF (Matching web version)
    const getStatusStyles = (colorClass: string) => {
      // ... (no changes here but keeping structure for context)
      if (colorClass.includes('blue')) return { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' }; // En proyecto
      if (colorClass.includes('cyan')) return { bg: '#ecfeff', border: '#a5f3fc', text: '#155e75' }; // En construcción
      if (colorClass.includes('orange')) return { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412' }; // Completado
      if (colorClass.includes('gray')) return { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' }; // Concurso
      return { bg: '#f3f4f6', border: '#e5e7eb', text: '#374151' };
    };

    const statusStyles = getStatusStyles(project.statusColor);

    try {
      // 1. Obtener coordenadas de forma secuencial (Dirección > Ciudad > Provincia)
      const coords = await getCoordinates(project.address || '', project.location, project.province);

      // Solo usar el default de Madrid si NO hay coordenadas en el proyecto Y falla el geocoding
      const defaultMadrid = { lat: 40.4168, lng: -3.7038 };
      let latLon: any = coords;

      if (!latLon) {
        // Si el geocoding falló, miramos si el proyecto tiene coordenadas reales (no el default)
        const hasRealCoords = project.coordinates && project.coordinates.lat !== 40.4168;
        latLon = hasRealCoords ? project.coordinates : defaultMadrid;
      }

      // 2. Cargar imágenes
      // Usar Yandex (muy estable) pero forzando idioma español para evitar alfabeto cirílico
      const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${latLon.lon || latLon.lng},${latLon.lat}&size=600,400&z=15&l=map&pt=${latLon.lon || latLon.lng},${latLon.lat},pm2rdl&lang=es_ES`;

      const [mainImgBase64, planImgBase64, mapImgBase64] = await Promise.all([
        loadImageAsBase64(getProxiedUrl(project.img)),
        project.planImg ? loadImageAsBase64(getProxiedUrl(project.planImg)) : Promise.resolve(''),
        loadImageAsBase64(getProxiedUrl(mapUrl))
      ]);

      // Calcular Superficie Total Real (SR + BR)
      const parseVal = (v: string | undefined) => {
        if (!v || v === '-') return 0;
        return parseFloat(v.toString().replace(/\./g, '').replace(',', '.')) || 0;
      };
      const totalSurfCalculated = parseVal(project.surfaceAboveGround) + parseVal(project.surfaceBelowGround);
      const totalSurfFormatted = totalSurfCalculated.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

      const element = document.createElement('div');
      element.id = 'pdf-template';
      element.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; padding: 25px 35px; color: #111418; background: white; width: 800px; min-height: 1120px; box-sizing: border-box;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #A61933; padding-bottom: 15px;">
            <div>
              <h1 style="font-size: 26px; font-weight: 900; margin: 0; color: #A61933; letter-spacing: -0.02em;">${project.name}</h1>
              <p style="margin: 4px 0 0; color: #617589; font-size: 13px; font-weight: 600;">Referencia: ${project.ref}</p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 5px 14px; background: ${statusStyles.bg}; border: 1px solid ${statusStyles.border}; border-radius: 999px; font-size: 11px; font-weight: 800; color: ${statusStyles.text}; text-transform: uppercase;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${statusStyles.text}; margin-right: 6px;"></span>
                ${project.status}
              </span>
            </div>
          </div>

          <!-- Content Grid -->
          <div style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 35px; margin-bottom: 20px;">
            <!-- Left Column: Information -->
            <div>
              <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #A61933; margin-bottom: 12px; letter-spacing: 0.05em; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">Información General</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 20px;">
                <tr><td style="padding: 5px 0; color: #617589; width: 45%;">Dirección</td><td style="font-weight: 700;">${project.address || '-'}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Población / Prov.</td><td style="font-weight: 700;">${project.location} / ${project.province}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Comunidad Aut.</td><td style="font-weight: 700;">${project.community}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Ref. Catastral</td><td style="font-weight: 700;">${project.cadastralRef || '-'}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Promotora</td><td style="font-weight: 700;">${project.developer || '-'}</td></tr>
              </table>

              <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #A61933; margin-bottom: 12px; letter-spacing: 0.05em; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">Información Tipológica</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 20px;">
                <tr><td style="padding: 5px 0; color: #617589; width: 45%;">Tipo de Negocio</td><td style="font-weight: 700;">${project.businessType}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Régimen</td><td style="font-weight: 700;">${project.regime}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Tipología</td><td style="font-weight: 700;">${project.typology || '-'}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Subtipología</td><td style="font-weight: 700;">${project.subtypology || '-'}</td></tr>
                <tr><td style="padding: 5px 0; color: #617589;">Tipo Cubierta</td><td style="font-weight: 700;">${project.roofType || '-'}</td></tr>
              </table>

              <h2 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #A61933; margin-bottom: 12px; letter-spacing: 0.05em; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">Datos Técnicos</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <tr><td style="padding: 4px 0; color: #617589; width: 45%;">Unidades</td><td style="font-weight: 700;">${project.units}</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Superficie Total (SR+BR)</td><td style="font-weight: 700;">${totalSurfFormatted} m²</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Nº Plantas Sobre Rasante</td><td style="font-weight: 700;">${project.floorsAboveGround || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Sup. Const. Sobre Rasante</td><td style="font-weight: 700;">${project.surfaceAboveGround || '-'} m²</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Nº Plantas Sótano</td><td style="font-weight: 700;">${project.floorsBelowGround || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Sup. Const. Bajo Rasante</td><td style="font-weight: 700;">${project.surfaceBelowGround || '-'} m²</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Nº Total Plantas SR</td><td style="font-weight: 700;">${project.totalFloors || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Presupuesto</td><td style="font-weight: 700;">${project.budget || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #617589;">Arquitecto / Constructora</td><td style="font-weight: 700;">${project.architect || '-'} / ${project.builder || '-'}</td></tr>
              </table>
            </div>

            <!-- Right Column: Media (Map -> Render -> Plan) -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <!-- 1. MAPA (Top) -->
              <div style="height: 190px; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb;">
                ${mapImgBase64 ? `<img src="${mapImgBase64}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px;">Mapa no disponible</div>'}
              </div>

              <!-- 2. RENDER (Middle) -->
              <div style="height: 190px; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb;">
                ${mainImgBase64 ? `<img src="${mainImgBase64}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px;">Imagen no disponible</div>'}
              </div>

              <!-- 3. PLANO (Bottom) -->
              <div style="height: 190px; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb;">
                 ${planImgBase64 ? `<img src="${planImgBase64}" style="width: 100%; height: 100%; object-fit: cover;">` : `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #9ca3af; background: #f8fafc;">
                      <p style="font-size: 26px; margin: 0;">📑</p>
                      <p style="font-size: 10px; font-weight: 700; margin-top: 6px; color: #64748b;">VISOR DE PLANO</p>
                    </div>
                 `}
              </div>
            </div>
          </div>

          <!-- Bottom: Description -->
          <div style="background: ${statusStyles.bg}; padding: 25px; border-radius: 15px; border: 1px solid ${statusStyles.border}; min-height: 150px;">
            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #A61933; margin: 0 0 12px; letter-spacing: 0.05em; border-bottom: 1px solid rgba(166, 25, 51, 0.1); padding-bottom: 5px;">Descripción General</h3>
            <div style="font-size: 11px; line-height: 1.7; color: #374151; white-space: pre-wrap;">${notes || 'No se dispone de descripción adicional para este proyecto inmobiliario.'}</div>
          </div>

          <!-- Footer -->
          <div style="margin-top: auto; padding-top: 25px; text-align: center; border-top: 1px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="font-size: 10px; color: #9ca3af; font-weight: 600; margin: 0;">SALAS - Gestión de Promociones Inmobiliarias</p>
              <p style="font-size: 10px; color: #9ca3af; font-weight: 600; margin: 0;">Ficha automatizada - ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const filename = `Ficha_${project.ref}_${project.name.replace(/\s+/g, '_')}_${dateStr}.pdf`;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: false,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().from(element).set(opt).save();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Se produjo un error al generar el documento PDF.');
    } finally {
      setIsExporting(false);
    }
  }; if (isLoading) {
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
              <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm gap-2 disabled:bg-gray-400"
              >
                {isExporting ? (
                  <span className="animate-spin material-symbols-outlined text-[20px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                )}
                <span>Exportar PDF</span>
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
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Presupuesto</p>
                      <p className="text-xl font-black">{project.budget || '-'}</p>
                    </div>
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Tamaño</p>
                      <p className="text-xl font-black">{project.size || '-'}</p>
                    </div>
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Superficie Total</p>
                      <p className="text-xl font-black">
                        {(() => {
                          const cleanNum = (str: string | undefined) => {
                            if (!str || str === '-') return 0;
                            // Remove dots (thousands), replace comma with dot, remove non-numeric
                            const cleaned = str.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
                            return parseFloat(cleaned) || 0;
                          };
                          const total = cleanNum(project.surfaceAboveGround) + cleanNum(project.surfaceBelowGround);
                          return total > 0 ? `${total.toLocaleString('es-ES')} m²` : (project.surface || '-');
                        })()}
                      </p>
                    </div>
                    <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                      <p className="text-xs font-bold text-[#617589] uppercase mb-1">Unidades</p>
                      <p className="text-xl font-black">{project.units}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-8 pb-8">
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Nº Plantas Sobre Rasante</p>
                      <p className="font-medium">{project.floorsAboveGround}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Superficie Const. Sobre Rasante</p>
                      <p className="font-medium">{project.surfaceAboveGround}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Nº Plantas Sótano</p>
                      <p className="font-medium">{project.floorsBelowGround}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Superficie Const. Bajo Rasante</p>
                      <p className="font-medium">{project.surfaceBelowGround}</p>
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
                      <p className="text-sm text-[#617589] dark:text-gray-400 mb-1">Nº Total de Plantas Sobre Rasante</p>
                      <p className="font-medium">{project.totalFloors || '-'}</p>
                    </div>
                  </div>
                </div>
              </section>


              <section className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#e5e7eb] dark:border-[#2a3846] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Descripción / Notas Técnicas</h3>
                  <div className="flex items-center gap-3">
                    {saveStatus === 'success' && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Guardado</span>}
                    {saveStatus === 'error' && (
                      <div className="flex flex-col items-end">
                        <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">error</span> Error al guardar
                        </span>
                        {errorMessage && <span className="text-[10px] text-red-400 max-w-[200px] text-right">{errorMessage}</span>}
                      </div>
                    )}
                    {(project?.notes !== notes || saveStatus === 'saving') && (
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:bg-gray-400"
                      >
                        {isSaving ? <span className="animate-spin material-symbols-outlined text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
                        Guardar cambios
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe aquí la descripción o notas técnicas del proyecto..."
                  className="w-full min-h-[200px] p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-background-dark text-sm text-[#617589] dark:text-gray-300 leading-relaxed focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-y"
                />
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
                            html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
                            .map-container { width: 100%; height: 100%; position: relative; }
                            iframe { border: 0; width: 100%; height: 100%; display: block; }
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
                        <button
                          onClick={() => setIsImageModalOpen(true)}
                          className="block w-full group relative"
                        >
                          <img src={project.img} className="w-full aspect-video object-cover" alt="Render" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-lg">
                              <span className="material-symbols-outlined">zoom_in</span>
                              <span className="font-bold">Ver imagen</span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <img src={project.img} className="w-full aspect-video object-cover" alt="Render" />
                      )}
                    </div>
                  </div>

                  {/* Modal de Imagen */}
                  {isImageModalOpen && (
                    <div
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                      onClick={() => setIsImageModalOpen(false)}
                    >
                      <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 bg-white text-black hover:bg-gray-200 w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-xl z-[200] group"
                        onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
                        aria-label="Cerrar"
                      >
                        <span className="material-symbols-outlined text-2xl font-bold">close</span>
                      </button>

                      <div
                        className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={project.detailImgUrl}
                          alt="Detalle del proyecto"
                          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="px-6 py-4 border-b border-[#f0f2f4] dark:border-[#2a3846] bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="text-lg font-bold">Plano</h3>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      {project.pdfUrl ? (
                        <button
                          onClick={() => setIsPlanModalOpen(true)}
                          className="block w-full group relative"
                        >
                          <img
                            src={project.planImg || project.img}
                            className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            alt="Plano"
                          />
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-2 text-white bg-primary px-4 py-2 rounded-lg shadow-lg">
                              <span className="material-symbols-outlined">zoom_in</span>
                              <span className="font-bold">Ver Plano</span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video p-6 text-center text-gray-400">
                          <span className="material-symbols-outlined text-4xl mb-2">picture_as_pdf</span>
                          <p className="text-xs">No hay plano PDF disponible</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal de Plano (PDF) */}
                  {isPlanModalOpen && (
                    <div
                      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
                      onClick={() => setIsPlanModalOpen(false)}
                    >
                      <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 bg-white text-black hover:bg-gray-200 w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-xl z-[200] group"
                        onClick={(e) => { e.stopPropagation(); setIsPlanModalOpen(false); }}
                        aria-label="Cerrar"
                      >
                        <span className="material-symbols-outlined text-2xl font-bold">close</span>
                      </button>

                      <div
                        className="relative max-w-7xl w-full h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <iframe
                          src={project.pdfUrl}
                          title="Plano del proyecto"
                          className="w-full h-full border-none"
                        ></iframe>
                      </div>
                    </div>
                  )}
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