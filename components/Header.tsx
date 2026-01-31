
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const isPromotionFlow = location.pathname.startsWith('/promociones') ||
    location.pathname.startsWith('/estadisticas') ||
    location.pathname.startsWith('/details');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-[#1a2632] border-b border-[#f0f2f4] dark:border-[#2a3b4d] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          <div className="size-10 bg-[#A61933] rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">apartment</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] hidden sm:block text-[#111418] dark:text-white">Gestión de Promociones</h2>
        </Link>
        <div className="flex items-center gap-6">
          {isPromotionFlow && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link className="text-[#111418] dark:text-white hover:text-[#A61933] transition-colors" to="/promociones">Listado</Link>
              <Link className="text-[#111418] dark:text-white hover:text-[#A61933] transition-colors" to="/estadisticas">Estadísticas</Link>
            </nav>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-[#f0f2f4] dark:border-[#2a3b4d] pl-6 relative">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#111418] dark:text-white">
                  {profile?.username || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-[#617589] dark:text-[#9ca3af] capitalize">
                  {profile?.role || 'Usuario'}
                </p>
              </div>
              <button onClick={() => setShowMenu(!showMenu)} className="bg-[#f0f2f4] dark:bg-[#2a3b4d] rounded-full size-10 flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1a2632] rounded-xl shadow-lg border border-[#f0f2f4] dark:border-[#2a3b4d] py-2 overflow-hidden z-[100]">
                  <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-sm font-bold text-[#A61933] hover:underline pl-6 border-l border-[#f0f2f4]">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
