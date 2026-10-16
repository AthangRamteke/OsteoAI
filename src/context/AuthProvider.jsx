import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext";
import {
  AuthError,
  fetchCurrentUser,
  loginAccount,
  registerAccount,
} from "../services/authService";

/*
 * Session handling.
 *
 * The token lives in localStorage when "Remember me" is ticked (it
 * survives closing the browser) and in sessionStorage otherwise (it
 * survives a refresh but ends with the tab). On load the stored token
 * is checked against /auth/me before the app treats anyone as signed in.
 */

const TOKEN_KEY = "osteoai_auth_token";

function readStoredToken() {
  try {
    return (
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

function storeToken(token, remember) {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session lasts only while this page is open.
  }
}

function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}

function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [user, setUser] = useState(null);

  // Only "loading" while a stored token is still being verified.
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()));

  // Verify the token found at start-up, once.
  useEffect(() => {
    const storedToken = readStoredToken();

    if (!storedToken) {
      return undefined;
    }

    let cancelled = false;

    fetchCurrentUser(storedToken)
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch((error) => {
        if (cancelled) return;

        // A rejected token is discarded. A network failure keeps it, so
        // the next load can retry once the backend is back.
        if (!(error instanceof AuthError) || error.code !== "network") {
          clearStoredToken();
        }

        setToken(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((result, remember) => {
    storeToken(result.token, remember);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(
    async ({ email, password, remember }) =>
      startSession(
        await loginAccount({ email, password, remember }),
        remember
      ),
    [startSession]
  );

  const register = useCallback(
    async ({ name, email, password }) =>
      startSession(
        await registerAccount({ name, email, password }),
        true
      ),
    [startSession]
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
