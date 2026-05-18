import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
    id: string;
    email: string;
    role?: string;
    [key: string]: any;
}

interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwt = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded) {
                setUser({
                    id: decoded.sub || decoded.nameid,
                    email: decoded.email,
                    role: decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                });
            } else {
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('jwt_token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};