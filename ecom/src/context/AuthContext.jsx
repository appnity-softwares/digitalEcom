import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to get the appropriate token key based on user role
    const getTokenKey = (userRole) => {
        return userRole === 'ADMIN' ? 'adminToken' : 'userToken';
    };

    // Helper function to get current token (checks both admin and user tokens)
    const getCurrentToken = () => {
        // Check if we're in admin route
        const isAdminRoute = window.location.pathname.startsWith('/admin');

        if (isAdminRoute) {
            return localStorage.getItem('adminToken') || localStorage.getItem('token');
        } else {
            return localStorage.getItem('userToken') || localStorage.getItem('token');
        }
    };

    // Check if user is logged in
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const token = getCurrentToken();
            if (!token) {
                setLoading(false);
                return;
            }

            // Verify token with backend
            const data = await authService.getMe();
            setUser(data);

            // Migrate old token to role-specific key if needed
            if (localStorage.getItem('token')) {
                const tokenKey = getTokenKey(data.role);
                localStorage.setItem(tokenKey, token);
                localStorage.removeItem('token');
            }
        } catch (err) {
            console.error("Auth Check Error", err);
            // Clear all tokens on error
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUser(data);

            // Store token with role-specific key
            const tokenKey = getTokenKey(data.role);
            localStorage.setItem(tokenKey, data.token);

            // Remove old token if exists
            localStorage.removeItem('token');

            return { success: true, user: data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await authService.register(name, email, password);
            setUser(data);

            // Store token with role-specific key (register is always for regular users)
            localStorage.setItem('userToken', data.token);

            // Remove old token if exists
            localStorage.removeItem('token');

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        // Clear token based on current user role
        if (user) {
            const tokenKey = getTokenKey(user.role);
            localStorage.removeItem(tokenKey);
        }

        // Also clear old token format if exists
        localStorage.removeItem('token');

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
