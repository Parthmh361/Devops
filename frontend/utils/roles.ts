import { Role, User } from '../types/user';

export const ROLES = {
    ORGANIZER: 'organizer' as Role,
    SPONSOR: 'sponsor' as Role,
    ADMIN: 'admin' as Role,
};

export const isOrganizer = (user: User | null): boolean => {
    return user?.role === ROLES.ORGANIZER;
};

export const isSponsor = (user: User | null): boolean => {
    return user?.role === ROLES.SPONSOR;
};

export const isAdmin = (user: User | null): boolean => {
    return user?.role === ROLES.ADMIN;
};

export const getDashboardPath = (role: Role): string => {
    switch (role) {
        case 'organizer':
            return '/organizer';
        case 'sponsor':
            return '/sponsor';
        case 'admin':
            return '/admin';
        default:
            return '/';
    }
};
