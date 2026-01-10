import api from './api'

// Get token from localStorage
export const getToken = () => localStorage.getItem('access_token')

// Check if authenticated (token exists and not expired)
export const isAuthenticated = () => {
    const token = getToken();
    if (!token) return false;

    // Basic expiration check (decode JWT - assumes standard structure)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } catch {
        return false;
    }
};

// Login function
export const login = async (username, password) => {
    try {

        // Try to log in with a post request with provided credentials
        const response = await api.post('/api/token/', { username, password });
        const { access, refresh } = response.data;

        // If successful, add tokens to localStorage
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        return response.data;

    } catch (error){
        throw error.response?.data || {detail: 'Login failed'};
    }
};

// Register function (stub - backend endpoint needed later)
export const register = async (username, email, password, confirmPassword) => {
    if (password !== confirmPassword) {
        throw { detail: 'Passwords do not match' };
    }
    try {
        // TODO: Replace with actual /api/register/ when backend is ready
        const response = await api.post('/api/register', {username, email, password});
        // Auto=login agter register

        return await login(username, password);

    } catch (error) {
        throw error.response?.data || { detail: 'Registration faile' };
    }
};

// Refresh access token
export const refreshToken = async () => {
    const refresh = localStorage.geItem('refresh_token')
    if (!refresh) throw { detail: 'No refresh token' };
    try {
        const response = await api.post('/api/token/refresh/', { refresh });
        localStorage.setItem('access_token', response.data.access);
        return response.data.access;

    } catch (error) {
        logout();
        throw error.response?.data || { detail: 'Token refresh failed' };
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}