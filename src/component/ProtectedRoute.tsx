import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Appcontext"; // Ensure this path is correct
import { auth } from "../firebase";
import { Alert, Button } from "@mui/material";
import Navbar from "../pages/public/Navbar";
import Footer from "../pages/public/Footer";
import { sendEmailVerification } from "firebase/auth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  // 1. Grab everything from your global context
  const { currentUser, isAdmin, authReady } = useAuth();

  // 2. Wait for the Global Context to finish its Firebase + MongoDB sync
  if (!authReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
        Checking authentication...
      </div>
    );
  }

  // 3. If no user is logged in (Firebase returned null)
  if (!currentUser) {
    return <Navigate to="/userlogin" replace />;
  }

  // 4. If the route is Admin-Only, but the MongoDB role isn't 'admin'
  if (adminOnly && !isAdmin) {
    console.warn("Access denied: User does not have Admin privileges.");
    return <Navigate to="/userlogin" replace />;
  }

  // 5. If the user is logged in, but hasn't verified their email
  if (auth.currentUser != null && !auth.currentUser.emailVerified) {
    const user = auth.currentUser;
    console.warn("Access denied: User has not verified their email.");
    return (
      <>
        <Navbar />
        <Alert severity="error">Access denied: User has not verified their email.</Alert>
        <Button onClick={() => sendEmailVerification(user, {url: 'http://localhost:5173/'})}>Send Verification Link</Button>
        <Footer />
      </>
    )
  }
  
  // 6. Success: Render children (for wrappers) or Outlet (for nested route groups)
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;