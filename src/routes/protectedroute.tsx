import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Appcontext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const ctx = useContext(AuthContext);
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  if (!ctx) return <Navigate to="/userlogin" replace />;

  const { currentUser, setCurrentUser } = ctx;

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admins/checkAuth", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setValid(false);
          setCurrentUser(null);
        } else {
          const data = await res.json();
          setCurrentUser(data.admin);
          setValid(true);
        }
      } catch {
        setValid(false);
        setCurrentUser(null);
      } finally {
        setChecking(false);
      }
    };

    if (!currentUser) {
      verify();
    } else {
      setValid(true);
      setChecking(false);
    }
  }, [currentUser, setCurrentUser]);

  if (checking) return <div>Checking authentication...</div>;
  if (!valid && !isActionInProgress) {
    return <Navigate to="/userlogin" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
