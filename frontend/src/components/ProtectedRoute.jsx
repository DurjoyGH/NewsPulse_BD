import { Navigate } from 'react-router-dom';

// This component wraps protected routes and redirects to login if user is not authenticated
const ProtectedRoute = ({ children }) => {
  // Check if user is logged in
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the children (protected component)
  return children;
};

export default ProtectedRoute;