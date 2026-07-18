import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/actions/authaction";
import "./RequireAuth.css";

/**
 * Route guard: renders children only when the user is authenticated.
 * Otherwise shows a login-required screen with a Google login button.
 */
const RequireAuth = ({ children, pageName = "this page" }) => {
  const { accessToken, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (accessToken) {
    return children;
  }

  return (
    <div className="require-auth">
      <div className="require-auth__card">
        <h1 className="require-auth__title">Login required</h1>
        <p className="require-auth__text">
          Please log in to access {pageName}.
        </p>
        <button
          type="button"
          className="require-auth__btn"
          onClick={() => dispatch(login())}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Login with Google"}
        </button>
      </div>
    </div>
  );
};

export default RequireAuth;
