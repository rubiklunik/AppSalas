
import { createClient } from '@supabase/supabase-js';
import { Project } from '../types';

// Configuración del cliente de Supabase
const supabaseUrl = 'https://zwwqlugkuctsqfigimog.supabase.co';
// IMPORTANTE: Reemplaza esta clave con tu clave anónima (anon key) de Supabase.
// Es seguro exponerla en el frontend. La puedes encontrar en la configuración de API de tu proyecto Supabase.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3d3FsdWdrdWN0c3FmaWdpbW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzU5MDgsImV4cCI6MjA4MTkxMTkwOH0.CruBIZRK0b82uznRMo49qj3KwRt643gkihNJMO-5Ymo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper para mapear el estado del proyecto a su color correspondiente en la UI
const getStatusColor = (status: Project['status']): string => {
    const statusColors: Record<string, string> = {
        'Completado': 'bg-orange-100 text-orange-800 border-orange-200',
        'En proyecto': 'bg-blue-100 text-blue-800 border-blue-200',
        'En Construcción': 'bg-cyan-100 text-cyan-800 border-cyan-200',
        'Concurso': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusColors[status] || statusColors['En proyecto'];
};

// Mapea una fila de la base de datos del usuario (con columnas en español) a nuestro objeto Project
const mapSupabaseRowToProject = (row: any): Project => {
    // Usamos el nombre del estado de la tabla del usuario, con un valor por defecto.
    const status = (row.Estado2 || 'En proyecto') as Project['status'];
    return {
        // El ID para la navegación será el 'Cod'
        id: String(row.Cod),
        // El 'ref' que se muestra en la UI también será el 'Cod'
        ref: String(row.Cod),
        // Mapeo de columnas de la tabla del usuario a las propiedades del objeto Project
        name: row.Promoción || 'Promoción sin nombre',
        location: row.Municipio || 'Municipio no especificado',
        status: status,
        statusColor: getStatusColor(status),
        floors: row['Nº Plantas SR'] || '-',
        units: row['Nº VIV./Nº HAB.'] || '-',
        surface: row['Sup Const. SR'] || '-',
        size: row.Rango || '-',
        community: row.CCAA || '-',
        province: row.Província || '-',
        businessType: row['TIPO de Negocio'] || '-',
        regime: row['Régimen'] || '-',
        // Se usa `Link IMG` para la imagen como se solicitó.
        img: row['Link IMG'] || row['LINK MIN'] || row.Imagen || row.img || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
        // Se añade la URL de la imagen de detalle para el enlace.
        detailImgUrl: row['Link IMG'],
        address: row.Dirección,
        cadastralRef: row['Referencia Catastral'],
        developer: row.Promotora,
        architect: row.Arquitecto,
        builder: row.Constructora,
        budget: row.Presupuesto,
        costPerM2: row['Coste m2'],
        salesVolume: row.Ventas,
        description: row.Descripción,
        planImg: row['LINK MIN'],
        pdfUrl: row['LINK PDF'],
        typology: row['Tipología'],
        subtypology: row['Subtipología'],
        roofType: row['Tipo CUB.'],
        floorsAboveGround: String(row['Nº Plantas SR'] || '-'),
        surfaceAboveGround: String(row['Sup Const. SR'] || '-'),
        floorsBelowGround: String(row['Nº Pl. BR'] || '-'),
        surfaceBelowGround: String(row['Sup Const. BR'] || '-'),
        totalFloors: String(row['Nº TOT Pl'] || '-'),
        notes: row.Notas || '',
        coordinates: {
            lat: row.Latitud || 40.4168,
            lng: row.Longitud || -3.7038
        },
        profiles: [],
        profileCount: null,
        grayscale: status === 'Concurso'
    };
};

/**
 * Actualiza la columna 'Notas' de un proyecto en Supabase
 * @param projectId El Cod (referencia) del proyecto
 * @param notes El nuevo contenido de las notas
 */
export const updateProjectNotes = async (projectId: string, notes: string): Promise<{ success: boolean; message?: string }> => {
    const { error } = await supabase
        .from('projects')
        .update({ Notas: notes })
        .eq('Cod', projectId);

    if (error) {
        console.error(`Error updating notes for project ${projectId}:`, error.message, error);
        return { success: false, message: error.message };
    }
    return { success: true };
};

// Obtiene todos los proyectos de la tabla 'projects' en Supabase
export const fetchAllProjects = async (): Promise<Project[]> => {
    // Ordenar por 'Cod' para mostrar los más recientes (si es un número incremental)
    const { data, error } = await supabase.from('projects').select('*').order('Cod', { ascending: false });
    if (error) {
        console.error("Error fetching from Supabase:", error.message, error);
        return [];
    }
    return data.map(mapSupabaseRowToProject);
};

// Obtiene un único proyecto por su 'Cod'
export const fetchProjectByCod = async (cod: string): Promise<Project | null> => {
    const { data, error } = await supabase.from('projects').select('*').eq('Cod', cod).single();
    if (error) {
        console.error(`Error fetching project by Cod (${cod}):`, error.message, error);
        return null;
    }
    return data ? mapSupabaseRowToProject(data) : null;
};
