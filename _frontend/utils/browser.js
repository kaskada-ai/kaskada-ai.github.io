/**
 * Get Cookie
 * Get a cookie from the browser
 *
 * @param {string} name
 * @return {string | null}
 */
export function getCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match && match[2]) return decodeURIComponent(match[2]);
  return null;
}

/**
 * Set a cookie
 * Set a cookie in browser
 * @param {string} name
 * @param {string} value
 * @param {Date} expires
 * @return {void}
 */
export function setCookie(name, value, expires) {
  if (typeof document === "undefined") {
    return;
  }
  const cookie = [`${name}=${value}`];
  if (expires) {
    cookie.push(`expires=${expires.toUTCString()}`);
  }
  cookie.push(`path=/`);
  document.cookie = cookie.join("; ");
}
