import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
    email: string;
    name: string;
    token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function persist(data: { token: string; email: string; name: string }) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.name);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        const name = localStorage.getItem('name');
        return token && email && name ? { token, email, name } : null;
    });

    const login = async (email: string, password: string) => {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error('Invalid email or password');

        const data = await res.json();
        persist(data);
        setUser({ token: data.token, email: data.email, name: data.name });
    };

    const register = async (email: string, name: string, password: string) => {
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password }),
        });

        if (!res.ok) {
            const msg = res.status === 409 ? 'Email already in use' : 'Registration failed';
            throw new Error(msg);
        }

        const data = await res.json();
        persist(data);
        setUser({ token: data.token, email: data.email, name: data.name });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
