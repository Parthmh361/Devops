'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '../../utils/auth';
import { Role } from '../../types/user';
import { Loader } from '../common/Loader';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = isAuthenticated();
            const user = getUser();

            if (!isAuth || !user) {
                router.push('/login');
                return;
            }

            if (allowedRoles && !allowedRoles.includes(user.role)) {
                // Redirect to their appropriate dashboard if unauthorized for this specific route
                // or just to home if no specific dashboard
                switch (user.role) {
                    case 'organizer': router.push('/organizer'); break;
                    case 'sponsor': router.push('/sponsor'); break;
                    case 'admin': router.push('/admin'); break;
                    default: router.push('/');
                }
                return;
            }

            setIsAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, allowedRoles]);

    if (loading) {
        return <Loader />;
    }

    return isAuthorized ? <>{children}</> : null;
};
