import { createContext, useState, useEffect, useContext } from 'react';
import { 
    login as authLogin,
    register as authRegister, 
    logout as authLogout, 
    isAuthenticated, 
    refreshToken 
} from '../services/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                setIsAuth(true);
            } else {
                try {
                    await refreshToken();
                    setIsAuth(true);
        
                } catch {
                    setIsAuth(false);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const data = await authLogin(username, password);
        setIsAuth(true);
        return data;
    };

    const register = async (username, email, password, confirmPassword) => {
        const data = await authRegister(username, email, password, confirmPassword);
        setIsAuth(true);
        return data;
    };

    const logout = () => {
        authLogout();
        setIsAuth(false);
    };

    return (
        <AuthContext.Provider value={{ isAuth, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);