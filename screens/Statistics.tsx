import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import html2pdf from 'html2pdf.js';

const Statistics: React.FC = () => {
    const { filteredProjects: projects, isLoading: loading } = useProjects();
    const [isExporting, setIsExporting] = useState(false);

    // States for toggling chart visibility
    const [showGeneral, setShowGeneral] = useState(true); // Default to true now that it's integrated
    const [showTypology, setShowTypology] = useState(true);
    const [showDimensional, setShowDimensional] = useState(true);

    // Helper function to group data for charts with percentage
    const groupData = (key: keyof Project) => {
        const counts: Record<string, number> = {};
        const total = projects.length || 1;
        projects.forEach(p => {
            const val = p[key];
            if (val && typeof val === 'string' && val !== '-') {
                counts[val] = (counts[val] || 0) + 1;
            } else if (val === null || val === undefined || val === '-') {
                counts['N/A'] = (counts['N/A'] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: ((value / total) * 100).toFixed(1)
        }));
    };

    // Calculate Summary Data
    const generateSummary = () => {
        const charts = [
            { key: 'community', label: 'ubicada en', suffix: 'mayoritariamente' },
            { key: 'businessType', label: 'de tipo de negocio', suffix: '' },
            { key: 'regime', label: 'en régimen de', suffix: '' },
            { key: 'typology', label: 'con tipología', suffix: '' },
            { key: 'subtypology', label: 'con subtipología', suffix: '' },
            { key: 'roofType', label: 'con tipo de cubierta', suffix: '' },
            { key: 'size', label: 'con un rango de unidades de', suffix: '' },
            { key: 'totalFloors', label: 'con un total de alturas de', suffix: '' },
            { key: 'floorsBelowGround', label: 'con plantas sótano de', suffix: '' }
        ];

        const results = charts.map(c => {
            const data = groupData(c.key as keyof Project);
            const top = data.reduce((prev, current) => (prev.value > current.value) ? prev : current, data[0] || { name: 'N/A', value: 0, percentage: '0' });
            return `${c.label} ${top.name} ${c.suffix} (${top.percentage}%)`;
        });

        if (projects.length === 0) return "No hay datos disponibles con los filtros actuales.";

        return `La promoción promedio según los filtros seleccionados está ${results[0]}, ${results[1]}, ${results[2]}, ${results[3]}, ${results[4]}, ${results[5]}, ${results[6]}, ${results[7]} y ${results[8]}.`;
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        const element = document.createElement('div');
        element.id = 'stats-pdf-template';

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Prepare data for the PDF
        const sections = [
            {
                title: "1. Datos Generales",
                charts: [
                    { key: 'community', label: 'Ubicación (CCAA)' },
                    { key: 'businessType', label: 'Tipo de Promoción' },
                    { key: 'regime', label: 'Régimen de Venta' }
                ]
            },
            {
                title: "2. Datos de Tipología",
                charts: [
                    { key: 'typology', label: 'Tipología' },
                    { key: 'subtypology', label: 'Subtipología' },
                    { key: 'roofType', label: 'Tipo de Cubierta' }
                ]
            },
            {
                title: "3. Datos Dimensionales",
                charts: [
                    { key: 'size', label: 'Nº Viviendas (Rango)' },
                    { key: 'totalFloors', label: 'Nº de Alturas Total' },
                    { key: 'floorsBelowGround', label: 'Plantas Sótano' }
                ]
            }
        ];

        let sectionsHTML = '';
        sections.forEach(s => {
            sectionsHTML += `
                <div style="margin-bottom: 25px; page-break-inside: avoid;">
                    <h2 style="font-size: 16px; font-weight: 900; color: #A61933; border-bottom: 2px solid #f3f4f6; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">${s.title}</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        ${s.charts.map(c => {
                const data = groupData(c.key as keyof Project);
                return `
                                <div style="background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
                                    <h3 style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px; text-align: center;">${c.label}</h3>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        ${data.map((d, i) => `
                                            <tr>
                                                <td style="font-size: 9px; color: #1e293b; padding: 2px 0; font-weight: 600;">${d.name}</td>
                                                <td style="font-size: 9px; color: #A61933; text-align: right; font-weight: 900;">${d.value} (${d.percentage}%)</td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="padding-bottom: 5px;">
                                                    <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden;">
                                                        <div style="width: ${d.percentage}%; height: 100%; background: ${COLORS[i % COLORS.length]};"></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </table>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        });

        element.innerHTML = `
            <div style="font-family: 'Inter', sans-serif; padding: 40px 50px; color: #111418; background: white; width: 790px; min-height: 1100px; box-sizing: border-box; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #A61933; padding-bottom: 18px; margin-bottom: 25px;">
                    <div>
                        <h1 style="font-size: 26px; font-weight: 900; color: #A61933; margin: 0; letter-spacing: -1px;">DASHBOARD ESTADÍSTICO</h1>
                        <p style="font-size: 13px; color: #64748b; font-weight: 600; margin-top: 4px;">Análisis de Cartera Inmobiliaria - SALAS</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 12px; font-weight: 800; color: #111418; margin: 0;">Fecha del Informe</p>
                        <p style="font-size: 13px; font-weight: 600; color: #64748b; margin: 0;">${now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                ${sectionsHTML}

                <div style="margin-top: 20px; background: #A61933; padding: 25px; border-radius: 18px; color: white; page-break-inside: avoid;">
                    <h2 style="font-size: 16px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                        RESUMEN AUTOMÁTICO DEL INFORME
                    </h2>
                    <p style="font-size: 14px; line-height: 1.5; font-weight: 500; font-style: italic; opacity: 0.95; margin: 0;">
                        “${generateSummary()}”
                    </p>
                </div>

                <div style="margin-top: auto; padding-top: 30px; text-align: center;">
                    <p style="font-size: 10px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; margin: 0;">SALAS - GESTIÓN DE PROMOCIONES INMOBILIARIAS © ${now.getFullYear()}</p>
                </div>
            </div>
        `;

        document.body.appendChild(element);

        const filename = `Estadisticas_${dateStr}.pdf`;
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        try {
            await html2pdf().from(element).set(opt).save();
        } catch (err) {
            console.error('Error generating Statistics PDF:', err);
        } finally {
            document.body.removeChild(element);
            setIsExporting(false);
        }
    };

    const COLORS = ['#A61933', '#C594C5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A61933]"></div>
            </div>
        );
    }

    const renderChartGroup = (title: string, description: string, show: boolean, onShow: () => void, charts: { key: keyof Project; label: string }[]) => {
        return (
            <div className="bg-white dark:bg-[#1a2632] rounded-3xl p-8 border border-gray-100 dark:border-[#2a3846] shadow-xl mb-12 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-[#111418] dark:text-white mb-2">{title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{description}</p>
                    </div>
                    <button
                        onClick={onShow}
                        className="px-8 py-3 bg-[#A61933] text-white font-bold rounded-xl shadow-lg shadow-[#A61933]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 w-fit whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined">{show ? 'visibility_off' : 'visibility'}</span>
                        {show ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
                    </button>
                </div>

                {show && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {charts.map(item => {
                            const data = groupData(item.key);
                            return (
                                <div key={item.key} className="bg-gray-50 dark:bg-[#0d1117]/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 transition-all hover:border-[#A61933]/20">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">{item.label}</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="name"
                                                    fontSize={9}
                                                    tick={{ fill: '#9CA3AF' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor="end"
                                                />
                                                <YAxis
                                                    fontSize={9}
                                                    tick={{ fill: '#9CA3AF' }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white/95 dark:bg-[#1a2632]/95 backdrop-blur-sm p-3 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">{data.name}</p>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-xl font-black text-[#A61933]">{data.value}</span>
                                                                        <span className="text-sm font-bold text-gray-500">{data.percentage}%</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                    <LabelList
                                                        dataKey="percentage"
                                                        position="top"
                                                        content={(props: any) => {
                                                            const { x, y, width, value } = props;
                                                            return (
                                                                <text x={x + width / 2} y={y - 10} fill="#9CA3AF" fontSize={8} fontWeight="bold" textAnchor="middle">
                                                                    {value}%
                                                                </text>
                                                            );
                                                        }}
                                                    />
                                                    {data.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex-1 flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
                <Sidebar />

                <main className="flex-1 min-w-0 bg-[#f8fafc] dark:bg-[#0d1117] p-6 md:p-10">
                    <header className="mb-12">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                                {projects.length} promociones filtradas
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-[#111418] dark:text-white tracking-tighter mb-4">
                            Dashboard de <span className="text-[#A61933]">Estadísticas</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed font-medium">
                            Analiza la distribución de activos y tipologías de la selección actual.
                        </p>
                    </header>

                    {/* Section 1: Datos Generales */}
                    {renderChartGroup(
                        "1. Datos Generales",
                        "Distribución por ubicación, tipo de negocio y régimen de explotación.",
                        showGeneral,
                        () => setShowGeneral(!showGeneral),
                        [
                            { key: 'community', label: 'Por Ubicación (CCAA)' },
                            { key: 'businessType', label: 'Tipo de Promoción' },
                            { key: 'regime', label: 'Régimen de Venta' }
                        ]
                    )}

                    {/* Section 2: Datos de Tipología */}
                    {renderChartGroup(
                        "2. Datos de Tipología",
                        "Análisis detallado de tipologías estructurales, subtipologías y tipos de cubierta.",
                        showTypology,
                        () => setShowTypology(!showTypology),
                        [
                            { key: 'typology', label: 'Por Tipología' },
                            { key: 'subtypology', label: 'Por Subtipología' },
                            { key: 'roofType', label: 'Tipo de Cubierta' }
                        ]
                    )}

                    {/* Section 3: Datos Dimensionales */}
                    {renderChartGroup(
                        "3. Datos Dimensionales",
                        "Estadísticas sobre volumetría: número de viviendas, alturas totales y plantas bajo rasante.",
                        showDimensional,
                        () => setShowDimensional(!showDimensional),
                        [
                            { key: 'size', label: 'Nº Viviendas (Rango)' },
                            { key: 'totalFloors', label: 'Nº de Alturas Total' },
                            { key: 'floorsBelowGround', label: 'Plantas Sótano' }
                        ]
                    )}

                    {/* Summary Section - Only visible when all are active */}
                    {showGeneral && showTypology && showDimensional && (
                        <div className="mt-16 bg-[#A61933] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-1000">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-4xl">auto_awesome</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase whitespace-nowrap">Resumen Automático</h2>
                                    </div>

                                    <button
                                        onClick={exportToPDF}
                                        disabled={isExporting}
                                        className="px-8 py-4 bg-white text-[#A61933] font-black rounded-2xl shadow-2xl hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isExporting ? (
                                            <div className="size-5 border-2 border-[#A61933] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="material-symbols-outlined text-2xl group-hover:bounce">download</span>
                                        )}
                                        {isExporting ? 'Generando PDF...' : 'Exportar Informe PDF'}
                                    </button>
                                </div>

                                <p className="text-xl md:text-3xl font-medium leading-relaxed italic opacity-95 first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                                    “{generateSummary()}”
                                </p>

                                <div className="mt-10 flex items-center gap-2 text-white/60 text-sm font-bold uppercase tracking-[0.2em]">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    Análisis inteligente basado en la selección actual
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <footer className="p-8 text-center text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800">
                © {new Date().getFullYear()} SALAS. Análisis de datos en tiempo real.
            </footer>
        </div>
    );
};

export default Statistics;
