import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Route guard: guests are redirected to the login/register page.
export default function RequireAuth({ children }: { children: React.ReactElement }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}
