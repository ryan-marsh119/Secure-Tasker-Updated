import { createContext, useState, useEffect, useContext } from 'react';
import { 
    login as authLogin,
    register as authRegister, 
    logout as authLogout, 
    isAuthenticated, 
    refreshToken 
} from '../services/auth';
import api from '../services/api';  // Add import for API calls

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [userRole, setUserRole] = useState('unknown');  // Add role state
    const [userPermissions, setUserPermissions] = useState({});  // Add permissions state
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (isAuthenticated()) {
                setIsAuth(true);
                await fetchUserData();  // Fetch permissions if authenticated
            } else {
                try {
                    await refreshToken();
                    setIsAuth(true);
                    await fetchUserData();
                } catch {
                    setIsAuth(false);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/api/secret/user-permissions/');
            const permissions = response.data || {};
            if (permissions.groups?.includes('Supervisor')) {
                setUserRole('supervisor');
                setUserPermissions({
                    canCreate: true,
                    canUpdate: true,
                    canDelete: true,
                    canView: true
                });
            } else if (permissions.groups?.includes('Secret')) {
                setUserRole('secret');
                setUserPermissions({
                    canCreate: false,
                    canUpdate: true,
                    canDelete: false,
                    canView: true
                });
            } else {
                setUserRole('unknown');
                setUserPermissions({
                    canCreate: false,
                    canUpdate: false,
                    canDelete: false,
                    canView: false
                });
            }
        } catch (error) {
            console.error('Failed to fetch user permissions:', error);
            setUserRole('unknown');
            setUserPermissions({
                canCreate: false,
                canUpdate: false,
                canDelete: false,
                canView: false
            });
        }
    };

    const login = async (username, password) => {
        const data = await authLogin(username, password);
        setIsAuth(true);
        await fetchUserPermissions();  // Fetch after login
        return data;
    };

    const register = async (username, email, password, confirmPassword) => {
        const data = await authRegister(username, email, password, confirmPassword);
        setIsAuth(true);
        await fetchUserPermissions();  // Fetch after register
        return data;
    };

    const logout = () => {
        authLogout();
        setIsAuth(false);
        setUserRole('unknown');  // Reset on logout
        setUserPermissions({});
    };

    return (
        <AuthContext.Provider value={{ 
            isAuth, 
            isLoading, 
            login, 
            register, 
            logout,
            userRole,  // Expose role
            userPermissions  // Expose permissions
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);