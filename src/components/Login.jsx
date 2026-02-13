import { useRef, useState } from "react";
import { useUser } from "../context/UserProvider";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
    isLoginOk: false,
  });

  const emailRef = useRef(null);
  const passRef = useRef(null);
  const { user, login } = useUser();

  async function onLogin() {
    setControlState((prev) => ({
      ...prev,
      isLoggingIn: true,
      isLoginError: false,
      isLoginOk: false,
    }));

    const email = emailRef.current?.value || "";
    const pass = passRef.current?.value || "";

    try {
      const result = await login(email, pass);
      setControlState({
        isLoggingIn: false,
        isLoginError: !result,
        isLoginOk: !!result,
      });
    } catch {
      setControlState({
        isLoggingIn: false,
        isLoginError: true,
        isLoginOk: false,
      });
    }
  }

  if (user.isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-dot" />
          <div>
            <h1 className="title">Welcome back</h1>
            <p className="subtitle">Sign in to continue</p>
          </div>
        </div>

        <div className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              ref={emailRef}
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              ref={passRef}
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={onLogin}
            disabled={controlState.isLoggingIn}
          >
            {controlState.isLoggingIn ? "Signing in..." : "Login"}
          </button>

          {controlState.isLoginError && (
            <div className="alert alert-error">Login incorrect</div>
          )}
          {controlState.isLoginOk && (
            <div className="alert alert-success">Login success</div>
          )}
        </div>

        <div className="auth-footer">
          <span className="muted">Tip:</span>{" "}
          <span className="muted">Make sure your API is running and cookies are enabled.</span>
        </div>
      </div>
    </div>
  );
}
