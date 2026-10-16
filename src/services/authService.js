/*
 * Account API client.
 *
 * Every failure is thrown as an AuthError whose `code` the forms map to
 * a translated message, so no raw server text reaches the UI.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export class AuthError extends Error {
  constructor(code, status = 0) {
    super(code);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

const CODE_BY_STATUS = {
  401: "invalidCredentials",
  409: "emailTaken",
  422: "invalidEmail",
  503: "unavailable",
};

async function request(path, { method = "GET", body, token } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only rejects when the request never got a response.
    throw new AuthError("network");
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Empty or non-JSON body; the status code still decides.
  }

  if (!response.ok) {
    throw new AuthError(
      CODE_BY_STATUS[response.status] || "generic",
      response.status
    );
  }

  return data;
}

export const registerAccount = ({ name, email, password }) =>
  request("/auth/register", {
    method: "POST",
    body: { name, email, password, remember: true },
  });

export const loginAccount = ({ email, password, remember }) =>
  request("/auth/login", {
    method: "POST",
    body: { email, password, remember },
  });

export const fetchCurrentUser = (token) =>
  request("/auth/me", { token });
