import Cookies from "js-cookie";
export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:8000"
    : "https://eathubbackend-1.onrender.com")
).replace(/\/$/, "");
const origins = new Set([
  "https://eathubbackend-1.onrender.com",
  "http://localhost:8000",
  new URL(API_BASE_URL).origin,
]);
const sessions = new Map();
function valid(token) {
  try {
    const c = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return c.exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
}
async function guestToken(table, restaurant) {
  const key = `eathub-guest:${restaurant}:${table}`,
    saved = sessionStorage.getItem(key);
  if (saved && valid(saved)) return saved;
  if (!sessions.has(key))
    sessions.set(
      key,
      window
        .fetch(`${API_BASE_URL}/public/guest-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurant_id: restaurant, table_id: table }),
        })
        .then(async (r) => {
          if (!r.ok)
            throw new Error("This table is unavailable. Please ask staff.");
          const { token } = await r.json();
          sessionStorage.setItem(key, token);
          return token;
        })
        .finally(() => sessions.delete(key)),
    );
  return sessions.get(key);
}
export default async function apiFetch(input, init = {}) {
  const url = new URL(input, API_BASE_URL);
  if (!origins.has(url.origin)) throw new Error("Unexpected API destination");
  const page = window.location.pathname,
    customer = page.match(/^\/customerDashboard\/([^/]+)\/([^/]+)/),
    headers = new Headers(init.headers || {});
  const key = page.startsWith("/superAdmin")
    ? "sa_user"
    : page.startsWith("/waiterDashboard")
      ? "w_user"
      : page.startsWith("/kotDashboard")
        ? "k_user"
        : "t_user";
  const token = customer
    ? await guestToken(customer[1], customer[2])
    : Cookies.get(key);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res;
  try {
    res = await window.fetch(`${API_BASE_URL}${url.pathname}${url.search}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot connect to the server. Check your connection and try again.",
    );
  }
  if (
    res.status === 401 &&
    !customer &&
    !/Login$|\/login$|\/restaurant$/.test(url.pathname)
  ) {
    Cookies.remove(key);
    if (!page.endsWith("Login") && page !== "/login")
      window.location.assign(key === "sa_user" ? "/superAdminLogin" : "/login");
  }
  return res;
}

export async function request(path, method = "GET", body, options = {}) {
  const res = await apiFetch(path, {
    ...options,
    method,
    headers: { "Content-Type": "application/json", ...options.headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }
  if (!res.ok)
    throw Object.assign(
      new Error(
        data.error || `Request failed (${res.status}). Please try again.`,
      ),
      { status: res.status },
    );
  return data;
}
