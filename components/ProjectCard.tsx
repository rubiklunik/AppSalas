
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = 'grid' }) => {
  const isList = viewMode === 'list';

  return (
    <article className={`group bg-white dark:bg-[#1a2632] rounded-xl border border-[#f0f2f4] dark:border-[#2a3b4d] overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer flex ${isList ? 'flex-col md:flex-row h-auto md:h-64' : 'flex-col'}`}>
      <Link to={`/details/${project.id}`} className={`flex ${isList ? 'flex-col md:flex-row w-full h-full' : 'flex-col w-full'}`}>
        <div className={`relative overflow-hidden ${isList ? 'h-48 md:h-full w-full md:w-80 shrink-0' : 'h-48 w-full'}`}>
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${project.statusColor}`}>
              {project.status}
            </span>
          </div>
          <img
            alt={project.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${project.grayscale ? 'grayscale' : ''}`}
            src={project.img}
          />
        </div>
        <div className="p-5 flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-[#111418] dark:text-white group-hover:text-primary transition-colors truncate">{project.name}</h3>
            <span className="text-xs font-mono bg-background-light dark:bg-background-dark px-2 py-1 rounded text-[#617589] dark:text-[#9ca3af] shrink-0 ml-2">{project.ref}</span>
          </div>
          <div className="flex items-center gap-1 text-[#617589] dark:text-[#9ca3af] mb-4 text-sm">
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="truncate">{project.location}</span>
          </div>

          <div className={`grid ${isList ? 'grid-cols-2 md:grid-cols-4 gap-x-6' : 'grid-cols-2 gap-x-4'} gap-y-3 mb-5 py-3 border-y border-[#f0f2f4] dark:border-[#2a3b4d]`}>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Comunidad</span>
              <span className="font-semibold text-[#111418] dark:text-white truncate" title={project.community}>{project.community}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Provincia</span>
              <span className="font-semibold text-[#111418] dark:text-white truncate" title={project.province}>{project.province}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Plantas</span>
              <span className="font-semibold text-[#111418] dark:text-white">{project.floors}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Viviendas</span>
              <span className="font-semibold text-[#111418] dark:text-white">{project.units}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Superficie</span>
              <span className="font-semibold text-[#111418] dark:text-white">{project.surface}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Tamaño</span>
              <span className="font-semibold text-[#111418] dark:text-white">{project.size}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Tipo</span>
              <span className="font-semibold text-[#111418] dark:text-white truncate" title={project.businessType}>{project.businessType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#617589] dark:text-[#9ca3af]">Régimen</span>
              <span className="font-semibold text-[#111418] dark:text-white truncate" title={project.regime}>{project.regime}</span>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.profiles.map((p, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2632] bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url('${p}')` }}></div>
              ))}
              {project.profileCount && (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a2632] bg-background-light dark:bg-background-dark flex items-center justify-center text-xs text-[#617589] font-medium">{project.profileCount}</div>
              )}
            </div>
            <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver detalle <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProjectCard;