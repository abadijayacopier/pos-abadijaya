import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('pos_session');
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user: userData } = response.data;

            const session = { ...userData, token };
            setUser(session);
            localStorage.setItem('pos_session', JSON.stringify(session));

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Koneksi ke server gagal!'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pos_session');
    };

    const hasAccess = (requiredRoles) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        return requiredRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasAccess }}>
            {children}
        </AuthContext.Provider>
    );
};
