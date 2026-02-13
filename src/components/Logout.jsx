import { useEffect, useState } from "react";
import { useUser } from "../context/UserProvider";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useUser();

  useEffect(() => {
    (async () => {
      try {
        await logout();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [logout]);

  if (isLoading) {
    return (
      <div className="page">
        <div className="card">
          <div className="row-between">
            <div>
              <h3 className="title-sm">Logging out…</h3>
              <p className="muted">Please wait</p>
            </div>
            <div className="spinner" aria-label="loading" />
          </div>
        </div>
      </div>
    );
  }

  return <Navigate to="/login" replace />;
}
