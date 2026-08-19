import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'
export default function ProtectedRoute({ adminOnly = false }) { const { user, isAuthenticated } = useAuth(); const location = useLocation(); if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />; if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />; return <Outlet /> }
