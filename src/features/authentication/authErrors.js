/** AuthError codes (services/authService.js) -> translation keys. */
const ERROR_KEYS = {
  invalidCredentials: "auth.errorInvalidCredentials",
  emailTaken: "auth.errorEmailTaken",
  invalidEmail: "auth.errorInvalidEmail",
  network: "auth.errorNetwork",
  unavailable: "auth.errorUnavailable",
  generic: "auth.errorGeneric",
};

export function authErrorKey(error) {
  return ERROR_KEYS[error?.code] || ERROR_KEYS.generic;
}
