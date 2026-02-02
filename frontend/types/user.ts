export type Role = 'organizer' | 'sponsor' | 'admin';

export interface User {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    organizationName?: string;
    designation?: string;
    phone?: string;
    bio?: string;
    logo?: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
