// FILE: C:\Users\moham\Downloads\PriceOrbit\frontend\src\components\ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// ─── ProtectedRoute ────────────────────────────────────────────────────────
// Wraps any page that requires the user to be logged in.
// If a JWT token exists in localStorage → render the page normally.
// If no token → silently redirect to /signin.
//
// We also pass the current URL as ?redirect=/saved so that after login,
// SignIn.jsx can send the user back to the page they were trying to reach.
//
// Usage in App.js:
//   <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check for a JWT token in localStorage — same key used by AuthService.java
  const token = localStorage.getItem('token');

  if (!token) {
    // Not logged in — redirect to /signin
    // state={{ from: location }} lets SignIn.jsx know where to redirect back after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Logged in — render the actual page
  return children;
};

export default ProtectedRoute;

