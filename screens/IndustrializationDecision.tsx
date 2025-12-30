
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Question {
    id: number;
    criterion: string;
    text: string;
    info: string;
    options: { text: string; value: number }[];
    weight: number;
}

const PHASE1_QUESTIONS: Question[] = [
    {
        id: 1,
        criterion: "Escala del Proyecto",
        text: "¿Cuál es la dimensión aproximada de la promoción?",
        info: "Promociones de un tamaño más reducido son, a priori, menos óptimas para industrializar.",
        options: [
            { text: "Pequeña (< 50 uds)", value: 1 },
            { text: "Mediana", value: 3 },
            { text: "Grande (> 50 uds)", value: 5 }
        ],
        weight: 3
    },
    {
        id: 2,
        criterion: "Estandarización del Diseño",
        text: "¿Qué nivel de repetición tienen las unidades (viviendas, habitaciones)?",
        info: "La repetición de unidades permite amortizar los moldes y optimizar los procesos de fábrica.",
        options: [
            { text: "Diseño único y personalizado", value: 1 },
            { text: "Moderadamente repetitivo", value: 3 },
            { text: "Altamente estandarizado (unidades idénticas)", value: 5 }
        ],
        weight: 3
    },
    {
        id: 3,
        criterion: "Altura del Edificio",
        text: "¿Cuál es la altura prevista para el edificio?",
        info: "La altura influye en el tipo de sistema (p. ej., el hormigón es más eficiente en alturas elevadas).",
        options: [
            { text: "Baja altura (<3 plantas)", value: 1 },
            { text: "Altura media (3-8 plantas)", value: 3 },
            { text: "Gran altura (>8 plantas)", value: 5 }
        ],
        weight: 2
    },
    {
        id: 4,
        criterion: "Accesibilidad del Solar",
        text: "¿Cómo describirías el acceso al solar para camiones y maquinaria pesada?",
        info: "El transporte de grandes módulos o paneles requiere accesos amplios y despejados.",
        options: [
            { text: "Complicado (calles estrechas, centro histórico)", value: 1 },
            { text: "Moderado", value: 3 },
            { text: "Excelente (viales anchos, acceso directo)", value: 5 }
        ],
        weight: 2
    },
    {
        id: 5,
        criterion: "Espacio en Parcela",
        text: "¿Cuánto espacio libre quedará en la parcela durante la construcción para almacenaje y grúas?",
        info: "Se necesita espacio para el acopio de piezas y la maniobra de grúas de gran tonelaje.",
        options: [
            { text: "Mínimo (edificio entre medianeras)", value: 1 },
            { text: "Espacio funcional", value: 3 },
            { text: "Amplio espacio de maniobra", value: 5 }
        ],
        weight: 2
    },
    {
        id: 6,
        criterion: "Urgencia del Plazo",
        text: "¿Qué tan crítico es el plazo de entrega para el éxito del negocio?",
        info: "La industrialización puede reducir los plazos de entrega hasta en un 50% frente a lo tradicional.",
        options: [
            { text: "Flexible, sin penalizaciones", value: 1 },
            { text: "Importante, pero con margen", value: 3 },
            { text: "Crítico, con fecha de entrega inamovible", value: 5 }
        ],
        weight: 2
    },
    {
        id: 7,
        criterion: "Objetivos de Sostenibilidad",
        text: "¿La promoción necesita cumplir con altos estándares de sostenibilidad o certificaciones (BREEAM, LEED)?",
        info: "Los sistemas industrializados (como la madera) reducen drásticamente la huella de carbono.",
        options: [
            { text: "No es una prioridad", value: 1 },
            { text: "Es un factor deseable", value: 3 },
            { text: "Es un requisito indispensable (ESG)", value: 5 }
        ],
        weight: 2
    },
    {
        id: 8,
        criterion: "Financiación Específica",
        text: "¿Se contempla el acceso a financiación verde o incentivos específicos para construcción innovadora (ej. fondos Next Generation)?",
        info: "El uso de métodos innovadores facilita el acceso a fondos verdes (ej. Next Generation).",
        options: [
            { text: "No, financiación estándar", value: 1 },
            { text: "Se está explorando", value: 3 },
            { text: "Sí, es parte de la estrategia financiera", value: 5 }
        ],
        weight: 1
    },
    {
        id: 9,
        criterion: "Experiencia del Equipo",
        text: "¿Qué experiencia tiene la empresa en la gestión de proyectos industrializados?",
        info: "La gestión de proyectos industrializados requiere una planificación más integrada y temprana.",
        options: [
            { text: "Ninguna, sería el primero", value: 1 },
            { text: "Alguna experiencia indirecta", value: 3 },
            { text: "Experiencia directa y consolidada", value: 5 }
        ],
        weight: 3
    },
    {
        id: 10,
        criterion: "Mano de Obra Local",
        text: "¿Cómo afecta la escasez de mano de obra cualificada tradicional a la viabilidad de nuestros proyectos en la zona?",
        info: "La escasez de mano de obra en el lugar de obra hace que la fabricación en entorno controlado sea clave.",
        options: [
            { text: "No es un problema relevante", value: 1 },
            { text: "Es un desafío moderado", value: 3 },
            { text: "Es un cuello de botella crítico", value: 5 }
        ],
        weight: 1
    },
    {
        id: 11,
        criterion: "Percepción del Mercado",
        text: "¿Cómo valoran nuestros clientes objetivo los inmuebles construidos con métodos modernos e innovadores?",
        info: "El cliente final valora cada vez más la precisión milimétrica y la calidad del acabado industrial.",
        options: [
            { text: "Prefieren lo tradicional", value: 1 },
            { text: "Son neutrales", value: 3 },
            { text: "Lo valoran positivamente como un plus", value: 5 }
        ],
        weight: 1
    },
    {
        id: 12,
        criterion: "Estrategia de Costes",
        text: "¿Cuál es el enfoque principal del presupuesto?",
        info: "Aunque el coste inicial sea similar, se reduce el riesgo de desviaciones y mejora el ROI financiero.",
        options: [
            { text: "Minimizar el coste inicial a toda costa", value: 1 },
            { text: "Equilibrar coste y plazo", value: 3 },
            { text: "Optimizar el ROI a largo plazo y reducir riesgos de ejecución", value: 5 }
        ],
        weight: 2
    }
];

interface Phase2Question {
    id: string;
    text: string;
    options: { id: string; text: string }[];
}

const PHASE2_QUESTIONS: Phase2Question[] = [
    {
        id: "motor",
        text: "¿Cuál es el principal motor estratégico del proyecto?",
        options: [
            { id: "a", text: "Velocidad y ROI: Necesitamos entregar el activo lo antes posible para acelerar el retorno de la inversión." },
            { id: "b", text: "Sostenibilidad y Marketing Verde: El principal valor diferencial será la baja huella de carbono y la eficiencia energética." },
            { id: "c", text: "Flexibilidad Estructural: El diseño requiere grandes espacios abiertos y pocas divisiones interiores (ej. oficinas, parkings)." },
            { id: "d", text: "Coste Competitivo: El objetivo es alcanzar un precio de construcción muy ajustado para vivienda social o similar." }
        ]
    },
    {
        id: "ligereza",
        text: "¿Qué importancia tiene la ligereza de la estructura?",
        options: [
            { id: "a", text: "Crítica, es una remonta sobre un edificio existente o el terreno tiene poca capacidad portante." },
            { id: "b", text: "Indiferente, el peso no es un factor limitante." }
        ]
    },
    {
        id: "acabado",
        text: "¿Qué acabado exterior se busca?",
        options: [
            { id: "a", text: "Un acabado arquitectónico de hormigón de alta calidad." },
            { id: "b", text: "Un acabado que evoque calidez y sostenibilidad, como la madera." },
            { id: "c", text: "Un sistema versátil que permita diferentes tipos de revestimiento." }
        ]
    }
];

const IndustrializationDecision: React.FC = () => {
    const [step, setStep] = useState<'intro' | 'phase1' | 'result1' | 'phase2' | 'final' | 'error'>('intro');
    const [phase1Answers, setPhase1Answers] = useState<{ [key: number]: number }>({});
    const [phase2Answers, setPhase2Answers] = useState<{ [key: string]: string }>({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showInfoDetails, setShowInfoDetails] = useState(false);
    const [projectDetails, setProjectDetails] = useState({ name: '', location: '' });
    const [isExporting, setIsExporting] = useState(false);

    const totalScore = useMemo(() => {
        return Object.entries(phase1Answers).reduce((acc: number, [id, val]) => {
            const q = PHASE1_QUESTIONS.find(q => q.id === parseInt(id));
            return acc + (Number(val) * (q?.weight || 0));
        }, 0);
    }, [phase1Answers]);

    const handleBack = () => {
        if (step === 'phase1') {
            if (currentQIndex > 0) {
                setCurrentQIndex(currentQIndex - 1);
            } else {
                setStep('intro');
            }
        } else if (step === 'result1') {
            setStep('phase1');
            setCurrentQIndex(PHASE1_QUESTIONS.length - 1);
        } else if (step === 'phase2') {
            if (currentQIndex > 0) {
                setCurrentQIndex(currentQIndex - 1);
            } else {
                setStep('result1');
            }
        } else if (step === 'final') {
            setStep('phase2');
            setCurrentQIndex(PHASE2_QUESTIONS.length - 1);
        }
    };

    const handlePhase1Answer = (val: number) => {
        const qId = PHASE1_QUESTIONS[currentQIndex].id;
        setPhase1Answers(prev => ({ ...prev, [qId]: val }));

        if (currentQIndex < PHASE1_QUESTIONS.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            setStep('result1');
        }
    };

    const handlePhase2Answer = (val: string) => {
        const qId = PHASE2_QUESTIONS[currentQIndex].id;
        setPhase2Answers(prev => ({ ...prev, [qId]: val }));

        if (currentQIndex < PHASE2_QUESTIONS.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        } else {
            setStep('final');
        }
    };

    const exportToPDF = async () => {
        setIsExporting(true);
        const rec = getFinalRecommendation();
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 30px; color: #111418; background: white; width: 800px; box-sizing: border-box;">
                <div style="border-bottom: 3px solid #A61933; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
                  <div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #A61933;">CRITERIOS DE INDUSTRIALIZACIÓN</h1>
                    <p style="margin: 3px 0 0; color: #666; font-size: 13px; font-weight: bold;">Ficha Técnica de Evaluación</p>
                  </div>
                  <div style="text-align: right; color: #999; font-size: 10px; font-weight: bold;">
                    SALAS ECOSISTEMA DIGITAL<br/>${new Date().toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div style="margin-bottom: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <p style="font-size: 10px; color: #64748b; margin-bottom: 2px; font-weight: bold; text-transform: uppercase;">Proyecto</p>
                            <p style="font-size: 16px; font-weight: 900; margin: 0; color: #1e293b;">${projectDetails.name || 'Sin nombre'}</p>
                        </div>
                        <div>
                            <p style="font-size: 10px; color: #64748b; margin-bottom: 2px; font-weight: bold; text-transform: uppercase;">Ubicación</p>
                            <p style="font-size: 16px; font-weight: 900; margin: 0; color: #1e293b;">${projectDetails.location || 'Sin ubicación'}</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 20px;">
                    <h2 style="font-size: 10px; text-transform: uppercase; color: #A61933; margin-bottom: 10px; letter-spacing: 0.1em; font-weight: 900; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px;">Sistema Recomendado</h2>
                    <div style="border-left: 4px solid #A61933; padding-left: 15px;">
                        <h3 style="font-size: 30px; font-weight: 900; margin: 0 0 8px 0; color: #1e293b; letter-spacing: -1px;">${rec.system}</h3>
                        <p style="font-size: 13px; line-height: 1.5; color: #475569; margin: 0;">${rec.justification}</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 25px; margin-bottom: 20px;">
                    <div>
                        <h2 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; letter-spacing: 0.1em; font-weight: 900;">Características</h2>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${rec.features.map(f => `
                                <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #334155;">
                                    <span style="color: #22c55e; font-weight: bold;">✔</span> ${f}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div>
                        <h2 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; letter-spacing: 0.1em; font-weight: 900;">Referencia</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${rec.companies.map(c => `
                                <span style="background: #f1f5f9; padding: 4px 10px; border-radius: 5px; font-size: 10px; font-weight: 900; color: #475569; border: 1px solid #e2e8f0;">${c}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h2 style="font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.1em; font-weight: 900; display: flex; justify-content: space-between;">
                        Auditoría de Puntuación
                        <span style="color: #A61933;">Puntuación Final: ${totalScore} / 120</span>
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #cbd5e1; text-align: left; color: #64748b; text-transform: uppercase;">
                                <th style="padding: 6px 0;">Criterio</th>
                                <th style="padding: 6px 0; text-align: center;">Pts</th>
                                <th style="padding: 6px 0; text-align: center;">Peso</th>
                                <th style="padding: 6px 0; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${PHASE1_QUESTIONS.map(q => {
            const val = phase1Answers[q.id] || 0;
            return `
                                    <tr style="border-bottom: 1px solid #e2e8f0;">
                                        <td style="padding: 6px 0; font-weight: bold; color: #1e293b;">${q.criterion}</td>
                                        <td style="padding: 6px 0; text-align: center;">${val}</td>
                                        <td style="padding: 6px 0; text-align: center; color: #94a3b8;">x${q.weight}</td>
                                        <td style="padding: 6px 0; text-align: right; font-weight: 900; color: #A61933;">${val * q.weight}</td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const opt = {
            margin: 0,
            filename: `Criterios_${projectDetails.name.replace(/\s+/g, '_') || 'Industrializacion'}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        try {
            await html2pdf().from(element).set(opt).save();
        } catch (err) {
            console.error('Error generando PDF:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const getRecommendation1 = () => {
        const sorted = [...PHASE1_QUESTIONS].sort((a, b) => (phase1Answers[a.id] || 0) - (phase1Answers[b.id] || 0));
        const lowest1 = sorted[0];
        const lowest2 = sorted[1];
        const highest1 = sorted[sorted.length - 1];
        const highest2 = sorted[sorted.length - 2];
        const highest3 = sorted[sorted.length - 3];

        if (totalScore < 40) {
            return {
                title: "Construcción Tradicional Recomendada",
                color: "bg-red-500",
                text: `Para este proyecto, la construcción tradicional parece ser la opción más segura. Factores clave como ${lowest1.criterion} y ${lowest2.criterion} limitan los beneficios de la industrialización. Intentar industrializar sería como usar una imprenta industrial para un solo folleto: los costes de preparación superarían el beneficio. Recomendamos seguir el método constructivo tradicional para maximizar la flexibilidad y ajustarse a las características actuales de la promoción.`
            };
        } else if (totalScore <= 80) {
            return {
                title: "Potencial para Industrialización Híbrida o Parcial",
                color: "bg-amber-500",
                text: `El proyecto presenta un perfil mixto. Tiene puntos a favor de la industrialización como ${highest1.criterion}, pero también desafíos importantes como ${lowest1.criterion}. Se podría explorar un enfoque híbrido, como industrializar componentes específicos (ej. baños prefabricados) mientras el resto de la estructura es tradicional. Se recomienda un análisis más profundo para determinar qué partes del 'traje' se pueden encargar a la 'línea de producción industrial' y cuáles necesitan el trabajo de un 'sastre a medida'.`
            };
        } else {
            return {
                title: "Industrialización Altamente Recomendable",
                color: "bg-green-500",
                text: `¡Luz verde! Esta promoción es una candidata ideal para la industrialización. Su ${highest1.criterion}, ${highest2.criterion} y ${highest3.criterion} permiten aprovechar al máximo las ventajas de este método: reducción de plazos de hasta un 50%, control de costes y mayor calidad gracias a la producción en un entorno controlado. El diseño es como un 'ladrillo de LEGO' que permite a la fábrica trabajar a pleno rendimiento. Haga clic en 'Siguiente' para definir qué tipo de sistema industrializado es el más adecuado para usted.`
            };
        }
    };

    const getFinalRecommendation = () => {
        const motor = phase2Answers['motor'];
        const ligereza = phase2Answers['ligereza'];
        const acabado = phase2Answers['acabado'];
        const altura = phase1Answers[3]; // Altura value (1, 3, 5)
        const estandarizacion = phase1Answers[2];

        // Logic based on the script
        if (altura === 5 && motor === 'c') {
            return {
                system: "Sistemas de Pórticos",
                justification: "Basado en la altura elevada de la promoción y su necesidad de flexibilidad estructural, los Sistemas de Pórticos son la opción ideal. Permiten grandes luces diáfanas y son perfectos para edificios de oficinas o parkings que requieren espacios abiertos sin obstáculos.",
                features: ["Máxima flexibilidad interior", "Ideal para edificios de gran altura (>8 plantas)", "Integración sencilla de instalaciones"],
                companies: ["Hormipresa", "Grupo Avintia", "Precon"]
            };
        }

        if (motor === 'a' && estandarizacion === 5) {
            return {
                system: "Sistemas Volumétricos 3D",
                justification: "Dada la alta estandarización del diseño y la prioridad crítica en la velocidad y el ROI, los Sistemas Volumétricos 3D son la elección más eficiente. Estos módulos completamente terminados en fábrica permiten una reducción de plazos de hasta el 70%.",
                features: ["Reducción drástica del plazo (70%)", "Calidad de acabado industrial total", "Listo para entrar a vivir en tiempo récord"],
                companies: ["ExSitu", "Modunova", "Vigas de Hormigón"]
            };
        }

        if (motor === 'b' && acabado === 'b') {
            return {
                system: "Madera CLT y Entramado Ligero",
                justification: "Su enfoque estratégico en la sostenibilidad y su preferencia por acabados naturales hacen que la Madera Contralaminada (CLT) sea la opción óptima. Actúa como un sumidero de carbono natural y es ideal para proyectos de alta eficiencia energética.",
                features: ["Sostenibilidad superior (Sumidero de CO2)", "Precisión milimétrica y calidez natural", "Ahorro de tiempo en ejecución (30-40%)"],
                companies: ["Egoin", "011h", "Medgon", "Lignum Tech", "Arquima"]
            };
        }

        if (ligereza === 'a') {
            return {
                system: "Steel Frame (Entramado Ligero de Acero)",
                justification: "Debido a la importancia crítica de la ligereza de la estructura, recomendamos el sistema Steel Frame. Es ideal para remontas sobre edificios existentes o terrenos con baja capacidad portante.",
                features: ["Extremadamente ligero", "Alta precisión y rapidez", "Ideal para rehabilitaciones y ampliaciones"],
                companies: ["Metalcasa", "Viviendas Steel Frame", "IDOM"]
            };
        }

        if (motor === 'd' && acabado === 'a') {
            return {
                system: "Paneles 2D de Hormigón",
                justification: "Para un objetivo de coste competitivo con acabado en hormigón, los Paneles 2D prefabricados son la solución estándar en el mercado. Ofrecen una excelente relación calidad-precio para vivienda social.",
                features: ["Coste muy competitivo (~1.300 €/m²)", "Ideal para Vivienda de Protección Oficial (VPO)", "Precio cerrado y sin desviaciones"],
                companies: ["Hormipresa", "BauPanel", "Grupo Avintia"]
            };
        }

        // Default fallback
        return {
            system: "Sistema Híbrido Personalizado",
            justification: "Dadas las características mixtas de su proyecto, se recomienda un sistema híbrido que combine elementos prefabricados 2D con construcción tradicional en puntos críticos.",
            features: ["Adaptabilidad total", "Mejora de plazos en zonas repetitivas", "Control de costes"],
            companies: ["Consultar especialistas de SALAS"]
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] flex flex-col font-sans">
            {/* Nav */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="size-8 bg-primary rounded flex items-center justify-center text-white group-hover:rotate-[-10deg] transition-transform">
                        <span className="material-symbols-outlined text-xl">home</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-[#111418] dark:text-white uppercase italic">CRITERIOS</span>
                </Link>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Herramienta Estratégica
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center p-6 max-w-4xl mx-auto w-full">

                {step === 'intro' && (
                    <div className="flex flex-col items-center text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-black text-[#111418] dark:text-white tracking-tighter mb-6">
                            ¿Es tu promoción <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-[#C594C5]">Industrializable?</span>
                        </h1>

                        <div className="w-full max-w-3xl mb-10 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-700 delay-300">
                            <img
                                src="/assets/criterios_infographic.jpg"
                                alt="Criterios de Industrialización"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mb-12 leading-relaxed">
                            Evalúa la viabilidad estratégica de aplicar construcción industrializada en las fases más tempranas de tu proyecto inmobiliario.
                        </p>
                        <button
                            onClick={() => { setStep('phase1'); setCurrentQIndex(0); }}
                            className="px-10 py-4 bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Comenzar Evaluación
                        </button>
                    </div>
                )}

                {step === 'phase1' && (
                    <div className="w-full py-8">
                        {/* Progress */}
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-primary to-[#C594C5] transition-all duration-500"
                                style={{ width: `${((currentQIndex) / PHASE1_QUESTIONS.length) * 100}%` }}
                            />
                        </div>

                        <div className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center justify-between">
                            <span>Paso {currentQIndex + 1} de {PHASE1_QUESTIONS.length}</span>
                            <button onClick={handleBack} className="text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Volver
                            </button>
                        </div>
                        <h2 className="text-3xl font-black text-[#111418] dark:text-white mb-2 leading-tight">
                            {PHASE1_QUESTIONS[currentQIndex].text}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 italic text-sm">
                            {PHASE1_QUESTIONS[currentQIndex].info}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            {PHASE1_QUESTIONS[currentQIndex].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePhase1Answer(opt.value)}
                                    className="group flex items-center justify-between p-6 bg-white dark:bg-[#1a2632] border-2 border-transparent hover:border-primary rounded-2xl shadow-sm hover:shadow-xl transition-all text-left"
                                >
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                                        {opt.text}
                                    </span>
                                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                        arrow_forward
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'result1' && (
                    <div className="w-full py-8 text-center animate-in zoom-in-95 duration-500">
                        {(() => {
                            const rec = getRecommendation1();
                            return (
                                <div className="bg-white dark:bg-[#1a2632] rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
                                    <div className={`absolute top-0 left-0 w-full h-3 ${rec.color}`}></div>

                                    <span className="material-symbols-outlined text-7xl text-primary mb-6">analytics</span>
                                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Resultado de Viabilidad</h2>
                                    <h3 className="text-4xl font-black text-[#111418] dark:text-white mb-8 text-balance">
                                        {rec.title}
                                    </h3>

                                    <div className="p-8 bg-slate-50 dark:bg-black/20 rounded-3xl text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10 text-left border border-gray-100 dark:border-gray-800">
                                        {rec.text}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button
                                            onClick={handleBack}
                                            className="w-full sm:w-auto px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-colors"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            onClick={() => { setStep('intro'); setPhase1Answers({}); setPhase2Answers({}); setCurrentQIndex(0); setProjectDetails({ name: '', location: '' }); }}
                                            className="w-full sm:w-auto px-8 py-4 border-2 border-red-100 dark:border-red-900/30 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-colors"
                                        >
                                            Reiniciar
                                        </button>
                                        {totalScore > 80 && (
                                            <div className="w-full sm:w-auto flex flex-col gap-4">
                                                <div className="flex flex-col md:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre de la promoción"
                                                        value={projectDetails.name}
                                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))}
                                                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-w-[240px]"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Ubicación"
                                                        value={projectDetails.location}
                                                        onChange={(e) => setProjectDetails(prev => ({ ...prev, location: e.target.value }))}
                                                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold min-w-[200px]"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => { setStep('phase2'); setCurrentQIndex(0); }}
                                                    disabled={!projectDetails.name || !projectDetails.location}
                                                    className="w-full px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                                >
                                                    Siguiente: Definir Sistema
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Score Breakdown */}
                                    <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-8 text-left">
                                        <button
                                            onClick={() => setShowDetails(!showDetails)}
                                            className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                            Detalles de la Evaluación
                                        </button>

                                        {showDetails && (
                                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="mb-6 flex flex-col gap-2">
                                                    <button
                                                        onClick={() => setShowInfoDetails(!showInfoDetails)}
                                                        className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline transition-all w-fit"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">{showInfoDetails ? 'info_i' : 'info'}</span>
                                                        {showInfoDetails ? 'Ocultar información técnica' : 'Más información sobre el cálculo'}
                                                    </button>

                                                    {showInfoDetails && (
                                                        <div className="p-5 bg-white dark:bg-black/20 rounded-2xl border border-primary/10 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 animate-in zoom-in-95 duration-200">
                                                            <div className="mb-4">
                                                                <p className="font-black text-primary uppercase mb-1 tracking-wider">Los Tres Rangos de Decisión</p>
                                                                <p>La puntuación máxima posible es de <b>120 puntos</b> (obtenida si seleccionas la opción de mayor impacto en todas las preguntas). Los umbrales definidos son:</p>
                                                                <ul className="mt-1 list-disc list-inside space-y-0.5">
                                                                    <li><b>Menos de 40 puntos:</b> Construcción Tradicional Recomendada.</li>
                                                                    <li><b>Entre 40 y 80 puntos:</b> Potencial para Industrialización Híbrida o Parcial.</li>
                                                                    <li><b>Más de 80 puntos:</b> Industrialización Altamente Recomendable.</li>
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-primary uppercase mb-1 tracking-wider">Cómo se llega a la puntuación</p>
                                                                <p>Cada una de las 12 preguntas tiene un <b>peso estratégico</b> (multiplicador) y una puntuación según la respuesta elegida:</p>
                                                                <ul className="mt-1 list-disc list-inside space-y-0.5">
                                                                    <li><b>Respuesta favorable:</b> 5 puntos.</li>
                                                                    <li><b>Respuesta neutra:</b> 3 puntos.</li>
                                                                    <li><b>Respuesta desfavorable:</b> 1 punto.</li>
                                                                </ul>
                                                                <p className="mt-2">Los criterios con más peso (x3) son la <b>escala del proyecto</b>, la <b>estandarización del diseño</b> y la <b>experiencia del equipo</b>.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                                                                <th className="py-2 text-left font-black">Criterio</th>
                                                                <th className="py-2 text-left font-black">Respuesta</th>
                                                                <th className="py-2 text-center font-black">Pts</th>
                                                                <th className="py-2 text-center font-black">Peso</th>
                                                                <th className="py-2 text-right font-black">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                                            {PHASE1_QUESTIONS.map(q => {
                                                                const val = phase1Answers[q.id] || 0;
                                                                const opt = q.options.find(o => o.value === val);
                                                                return (
                                                                    <tr key={q.id} className="text-gray-600 dark:text-gray-400">
                                                                        <td className="py-3 font-bold pr-4">{q.criterion}</td>
                                                                        <td className="py-3 opacity-60 pr-4">{opt?.text || '-'}</td>
                                                                        <td className="py-3 text-center">{val}</td>
                                                                        <td className="py-3 text-center">{q.weight}</td>
                                                                        <td className="py-3 text-right font-black text-primary">{val * q.weight}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            <tr className="font-black text-sm bg-slate-50 dark:bg-black/20">
                                                                <td colSpan={4} className="py-3 px-2 text-right uppercase tracking-widest">Puntuación Final</td>
                                                                <td className="py-3 text-right text-primary pr-2">{totalScore}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {step === 'phase2' && (
                    <div className="w-full py-8">
                        {/* Progress */}
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-primary to-[#C594C5] transition-all duration-500"
                                style={{ width: `${((currentQIndex) / PHASE2_QUESTIONS.length) * 100}%` }}
                            />
                        </div>

                        <div className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center justify-between">
                            <span>Afinando Recomendación (Paso {currentQIndex + 1} de {PHASE2_QUESTIONS.length})</span>
                            <button onClick={handleBack} className="text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Volver
                            </button>
                        </div>
                        <h2 className="text-3xl font-black text-[#111418] dark:text-white mb-10 leading-tight">
                            {PHASE2_QUESTIONS[currentQIndex].text}
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {PHASE2_QUESTIONS[currentQIndex].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePhase2Answer(opt.id)}
                                    className="group flex items-center justify-between p-6 bg-white dark:bg-[#1a2632] border-2 border-transparent hover:border-primary rounded-2xl shadow-sm hover:shadow-xl transition-all text-left"
                                >
                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                                        {opt.text}
                                    </span>
                                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                        check_circle
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'final' && (
                    <div className="w-full py-8 animate-in zoom-in-95 duration-500">
                        {(() => {
                            const rec = getFinalRecommendation();
                            return (
                                <div className="bg-white dark:bg-[#1a2632] rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="flex flex-col md:flex-row gap-10">
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Proyecto Identificado</h4>
                                                    <h2 className="text-4xl font-black text-[#111418] dark:text-white leading-tight tracking-tighter">
                                                        {projectDetails.name}
                                                    </h2>
                                                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                                        {projectDetails.location}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={exportToPDF}
                                                    disabled={isExporting}
                                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:bg-gray-400"
                                                >
                                                    {isExporting ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined">picture_as_pdf</span>}
                                                    Exportar Informe PDF
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="size-12 bg-primary text-white rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined">architecture</span>
                                                </div>
                                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Sistema Recomendado</h2>
                                            </div>

                                            <h3 className="text-5xl font-black text-[#111418] dark:text-white mb-8 tracking-tighter leading-none">
                                                {rec.system}
                                            </h3>

                                            <div className="p-8 bg-slate-50 dark:bg-black/20 rounded-3xl text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10 text-left border border-gray-100 dark:border-gray-800">
                                                <p className="font-bold mb-2 text-primary">Justificación:</p>
                                                {rec.justification}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                                <div className="p-6 bg-white dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Características Clave</h4>
                                                    <ul className="space-y-3">
                                                        {rec.features.map((f, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <span className="material-symbols-outlined text-xs text-green-500 mt-0.5">verified</span>
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="p-6 bg-white dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Empresas de Referencia</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {rec.companies.map((c, i) => (
                                                            <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                                                {c}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                <button
                                                    onClick={handleBack}
                                                    className="w-full px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all"
                                                >
                                                    Atrás
                                                </button>
                                                <button
                                                    onClick={() => { setStep('intro'); setPhase1Answers({}); setPhase2Answers({}); setCurrentQIndex(0); }}
                                                    className="w-full px-8 py-4 bg-[#111418] dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                                                >
                                                    Nueva Simulación
                                                </button>
                                            </div>

                                            {/* Final Score Breakdown Dropdown */}
                                            <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6 text-left">
                                                <button
                                                    onClick={() => setShowDetails(!showDetails)}
                                                    className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                                                >
                                                    <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                                                    Auditoría de Puntuación
                                                </button>

                                                {showDetails && (
                                                    <div className="mt-4 overflow-x-auto animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <table className="w-full text-[10px] sm:text-xs">
                                                            <thead>
                                                                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400">
                                                                    <th className="py-2 text-left font-black">Criterio</th>
                                                                    <th className="py-2 text-center font-black">Pts</th>
                                                                    <th className="py-2 text-center font-black">Peso</th>
                                                                    <th className="py-2 text-right font-black">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                                                {PHASE1_QUESTIONS.map(q => {
                                                                    const val = phase1Answers[q.id] || 0;
                                                                    return (
                                                                        <tr key={q.id} className="text-gray-600 dark:text-gray-400">
                                                                            <td className="py-2 font-bold">{q.criterion}</td>
                                                                            <td className="py-2 text-center">{val}</td>
                                                                            <td className="py-2 text-center">{q.weight}</td>
                                                                            <td className="py-2 text-right font-black text-primary">{val * q.weight}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                <tr className="font-black bg-slate-50 dark:bg-black/20">
                                                                    <td colSpan={3} className="py-2 text-right uppercase">Total Viabilidad</td>
                                                                    <td className="py-2 text-right text-primary">{totalScore} / 120</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

            </main>

            <footer className="p-6 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} SALAS - Criterios de Industrialización
            </footer>
        </div>
    );
};

export default IndustrializationDecision;
