import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import React from "react";
import FullPageLoader from "./FullPageLoader";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.user);
    // console.log("Private: ", loading," - ", isAuthenticated);
  if (loading) {
    return <FullPageLoader/>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.user);
    // console.log("Public: ", loading," - ", isAuthenticated);
  if (loading) {
    return <FullPageLoader/>;
  }

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};
