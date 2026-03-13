"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loginWithPasskey: (email: string) => Promise<void>;
    registerPasskey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in (token exists)
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');

        if (token && userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify({
                _id: data._id,
                name: data.name,
                email: data.email
            }));
            setUser({
                _id: data._id,
                name: data.name,
                email: data.email
            });
            router.push('/dashboard'); // or modules
        } catch (error: any) {
            console.error(error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const { data } = await api.post('/users', { name, email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify({
                _id: data._id,
                name: data.name,
                email: data.email
            }));
            setUser({
                _id: data._id,
                name: data.name,
                email: data.email
            });
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
        router.push('/login');
    };

    const loginWithPasskey = async (email: string) => {
        try {
            // 1. Get Challenge
            const resp = await api.post('/webauthn/login-challenge', { email });
            const options = resp.data;

            // 2. Browser Prompt
            const asseResp = await startAuthentication(options);

            // 3. Verify
            const verificationResp = await api.post('/webauthn/login-verify', {
                email,
                ...asseResp
            });

            if (verificationResp.data.verified) {
                const { token, user } = verificationResp.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userInfo', JSON.stringify(user));
                setUser(user);
                router.push('/dashboard');
            }
        } catch (error: any) {
            console.error(error);
            throw new Error(error.response?.data?.error || 'Passkey login failed');
        }
    };

    const registerPasskey = async () => {
        try {
            // 1. Get Challenge
            const resp = await api.get('/webauthn/register-challenge');
            const options = resp.data;

            // 2. Browser Prompt
            const attResp = await startRegistration(options);

            // 3. Verify
            const verificationResp = await api.post('/webauthn/register-verify', attResp);

            if (verificationResp.data.verified) {
                alert('Passkey registered successfully!');
            }
        } catch (error: any) {
            console.error(error);
            alert('Passkey registration failed: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithPasskey, registerPasskey }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
