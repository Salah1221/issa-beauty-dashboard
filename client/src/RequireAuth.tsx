import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { checkAuth } from "./lib/auth";

type Status = "loading" | "in" | "out";

const RequireAuth: React.FC = () => {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let active = true;
    checkAuth()
      .then(() => active && setStatus("in"))
      .catch(() => active && setStatus("out"));
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (status === "out") return <Navigate to="/login" replace />;
  return <Outlet />;
};

export default RequireAuth;
