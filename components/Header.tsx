
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-[#1a2632] border-b border-[#f0f2f4] dark:border-[#2a3b4d] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          <div className="size-10 bg-[#A61933] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">apartment</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block">Gestión de Promociones</h2>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#617589] dark:text-[#9ca3af]">
            <Link className="text-[#111418] dark:text-white hover:text-[#A61933] transition-colors" to="/promociones">Promociones</Link>
            <a className="hover:text-[#A61933] transition-colors" href="#">Informes</a>
            <a className="hover:text-[#A61933] transition-colors" href="#">Configuración</a>
          </nav>
          <div className="flex items-center gap-3 border-l border-[#f0f2f4] dark:border-[#2a3b4d] pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#111418] dark:text-white">Carlos M.</p>
              <p className="text-xs text-[#617589] dark:text-[#9ca3af]">Director Técnico</p>
            </div>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white dark:ring-[#1a2632]"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7W-bZCe49S9JXJWFxZTNnW7ob5qDWV0i0ZuUdML9FvyBjr7sLMcKw1nZwyIHGbiT08Z-evZm7yHIZsz2e2GJj-0QU5angsxWON7ca_a4PDH_8oj6cyIekGRiHUzdgDrCZrnnv4lAYeuwJXTVzGSVyTOH8--8zxI2rS0OM5rvckoaZM6PKyrmS6dECGXZrcNKTI9jRST2X6SHDBM32c2nAwXUWCbhzIqQ6-YZ5D3RkmC_UfRu5Qp1RuN8xSr9yhsR32MBqdDGZ7w")' }}
            ></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
