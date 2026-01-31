
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/promociones';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#f0f2f4] p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-12 bg-[#A61933] rounded-xl flex items-center justify-center text-white mb-4">
                        <span className="material-symbols-outlined text-3xl">apartment</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418]">Acceso al Portal</h1>
                    <p className="text-[#617589] text-sm mt-2 text-center">
                        Introduce tus credenciales para acceder a la gestión inmobiliaria
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#111418] mb-2" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] focus:ring-2 focus:ring-[#A61933]/20 focus:border-[#A61933] outline-none transition-all text-[#111418]"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111418] mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-[#dce0e5] focus:ring-2 focus:ring-[#A61933]/20 focus:border-[#A61933] outline-none transition-all text-[#111418]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#A61933] hover:bg-[#8B152A] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
