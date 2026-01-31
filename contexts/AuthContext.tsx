
import React, { createContext, useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export interface Profile {
    id: string;
    username: string;
    role: 'admin' | 'user';
}

export interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('AuthContext: Error cargando perfil:', error.message);
                setProfile(null);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('AuthContext: Error fetchProfile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Timeout de seguridad de 6 segundos
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 6000);

        // 1. Sesión inicial
        supabase.auth.getSession().then(({ data: { session: s }, error }) => {
            clearTimeout(safetyTimeout);
            if (error) {
                setLoading(false);
                return;
            }
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                fetchProfile(s.user.id);
            } else {
                setLoading(false);
            }
        }).catch(() => {
            clearTimeout(safetyTimeout);
            setLoading(false);
        });

        // 2. Suscripción
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                await fetchProfile(s.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
