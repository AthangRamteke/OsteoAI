/**
 * ngrok's free plan answers browser requests with an HTML warning page
 * unless this header is present, which breaks every JSON API call.
 * Patched once here so each service does not have to remember it.
 */
const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";

  if (!/^https?:\/\/[^/]*ngrok/i.test(url)) {
    return originalFetch(input, init);
  }

  const headers = new Headers(init.headers || {});
  headers.set("ngrok-skip-browser-warning", "true");

  return originalFetch(input, { ...init, headers });
};
