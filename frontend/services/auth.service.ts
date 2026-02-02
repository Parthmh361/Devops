import api from './api';
import { AuthResponse } from '../types/user';
import { setToken, setUser, logout as authLogout } from '../utils/auth';

interface LoginPayload {
    email: string;
    password?: string;
}

interface RegisterPayload {
    email: string;
    name: string;
    password?: string;
    role: string;
}

export const authService = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await api.post<any>('/auth/login', {
            email: payload.email,
            password: payload.password
        });

        const { user, token } = response.data.data;
        setToken(token);
        setUser(user);
        return { user, token };
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await api.post<any>('/auth/register', {
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role
        });

        const { user, token } = response.data.data;
        setToken(token);
        setUser(user);
        return { user, token };
    },

    logout: () => {
        authLogout();
    },
};
