
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] flex flex-col">
            {/* Header Corporativo Simple */}
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-6xl mx-auto w-full">
                {/* Hero Section */}
                <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-4">Bienvenido al Ecosistema Digital</h2>
                    <h1 className="text-5xl md:text-7xl font-black text-[#111418] dark:text-white tracking-tighter mb-6 leading-tight">
                        Gestión Inteligente de <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#C594C5]">Promociones Inmobiliarias</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Accede a las herramientas de control, visualización y análisis de datos de SALAS. Optimiza cada fase del ciclo inmobiliario.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    {/* Card 1: Gestión de Promociones */}
                    <Link
                        to="/promociones"
                        className="group relative bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#2a3846] p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-[#23303d] rounded-bl-[100px] transition-colors group-hover:bg-primary/5 z-0"></div>

                        <div className="relative z-10">
                            <div className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-3xl">apartment</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111418] dark:text-white mb-3">Gestión de Promociones</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Visualización técnica, análisis de entorno con IA y seguimiento detallado del histórico de promociones.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <span>Acceder</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Estadísticas */}
                    <Link
                        to="/estadisticas"
                        className="group relative bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#2a3846] p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-[#23303d] rounded-bl-[100px] transition-colors group-hover:bg-primary/5 z-0"></div>

                        <div className="relative z-10">
                            <div className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-3xl">bar_chart</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111418] dark:text-white mb-3">Estadísticas</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Análisis visual de la cartera por ubicación, tipologías y datos dimensionales en tiempo real.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <span>Ver Gráficos</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">insights</span>
                            </div>
                        </div>
                    </Link>

                    {/* Card 3: Decisor de Industrialización */}
                    <Link
                        to="/decisor-industrializacion"
                        className="group relative bg-white dark:bg-[#1a2632] border border-gray-200 dark:border-[#2a3846] p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-[#23303d] rounded-bl-[100px] transition-colors group-hover:bg-primary/5 z-0"></div>

                        <div className="relative z-10">
                            <div className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111418] dark:text-white mb-3 text-balance">Criterios de Industrialización</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Evalúa la viabilidad de industrializar tu promoción con un sistema de puntuación estratégico.
                            </p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <span>Iniciar Evaluación</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">analytics</span>
                            </div>
                        </div>
                    </Link>

                    {/* Card 4: Libro Blanco */}
                    <div className="group relative bg-gray-50/50 dark:bg-[#121b24] border border-gray-200 dark:border-[#2a3846] p-8 rounded-3xl transition-all duration-500 text-left grayscale hover:grayscale-0 opacity-80 hover:opacity-100 cursor-not-allowed">
                        <div className="absolute top-6 right-6 px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Próximamente
                        </div>

                        <div className="relative z-10">
                            <div className="size-16 bg-gray-400 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-400/20 group-hover:bg-[#C594C5] transition-colors duration-500">
                                <span className="material-symbols-outlined text-3xl">menu_book</span>
                            </div>
                            <h3 className="text-2xl font-black text-[#111418] dark:text-white mb-3 text-balance">Libro Blanco</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                Estandarización de procesos, normativas y guías de calidad para el desarrollo de promociones.
                            </p>
                            <div className="flex items-center gap-2 text-gray-400 font-bold group-hover:text-[#C594C5] transition-colors">
                                <span>En desarrollo</span>
                                <span className="material-symbols-outlined">hourglass_top</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-20 text-gray-400 dark:text-gray-500 text-sm font-medium">
                    © {new Date().getFullYear()} SALAS. Todos los derechos reservados.
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
