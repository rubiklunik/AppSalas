
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up the user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        if (user) {
            // 2. Create the profile manually (since RLS might prevent auto-creation if not set up with triggers)
            // Note: By default, users can't insert into profiles if policies don't allow it. 
            // But for a new user, they usually need to create their own profile.
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { id: user.id, username: username, role: 'user' }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // We don't necessarily want to fail registration if the profile creation fails (maybe a trigger did it)
            }

            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#f0f2f4] p-8 text-center">
                    <div className="size-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418] mb-2">¡Registro completado!</h1>
                    <p className="text-[#617589]">
                        Revisa tu correo para confirmar tu cuenta. Redirigiendo al inicio de sesión...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#f0f2f4] p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="size-12 bg-[#A61933] rounded-xl flex items-center justify-center text-white mb-4">
                        <span className="material-symbols-outlined text-3xl">person_add</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#111418]">Crear Cuenta</h1>
                    <p className="text-[#617589] text-sm mt-2 text-center">
                        Regístrate para acceder al panel de gestión
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#111418] mb-1" htmlFor="username">
                            Nombre de Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] focus:ring-2 focus:ring-[#A61933]/20 focus:border-[#A61933] outline-none transition-all text-[#111418]"
                            placeholder="jperez"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111418] mb-1" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] focus:ring-2 focus:ring-[#A61933]/20 focus:border-[#A61933] outline-none transition-all text-[#111418]"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#111418] mb-1" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] focus:ring-2 focus:ring-[#A61933]/20 focus:border-[#A61933] outline-none transition-all text-[#111418]"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#A61933] hover:bg-[#8B152A] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Registrarse'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#f0f2f4] text-center">
                    <p className="text-[#617589] text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-[#A61933] font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
