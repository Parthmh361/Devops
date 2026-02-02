import { User, AuthResponse } from '../types/user';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
};

export const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as User;
    } catch (error) {
        console.error('Error parsing user from local storage', error);
        return null;
    }
};

export const setUser = (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
};

export const getUserFromToken = (token: string): User | null => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub || payload.id,
            name: payload.name || '',
            email: payload.email || '',
            role: payload.role as any,
            createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : new Date().toISOString(),
        };
    } catch (e) {
        console.error('Failed to decode token', e);
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

export const logout = (): void => {
    removeToken();
    removeUser();
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};
