import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  Link,
} from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  LuLayoutDashboard,
  LuClipboardList,
  LuUtensils,
  LuTable,
  LuBell,
  LuShoppingBag,
  LuUsers,
  LuCalendarDays,
  LuWallet,
  LuSettings,
  LuMessageSquare,
  LuLogOut,
  LuPanelLeft,
  LuSun,
  LuMoon,
  LuChefHat,
  LuRefreshCw,
} from "react-icons/lu";
import { request } from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import { Notice } from "./common";
import {
  Overview,
  OrdersPage,
  KitchenPage,
  RequestsPage,
  PaymentsPage,
  MessagesPage,
} from "./Operations";
import {
  MenuPage,
  TablesPage,
  StaffPage,
  ReservationsPage,
  SettingsPage,
  SetupPage,
} from "./Management";
import POS from "./POS";
import "./workspace.css";
const Context = createContext();
export const useWorkspace = () => useContext(Context);
export const bases = {
  admin: "/restaurantDashboard",
  waiter: "/waiterDashboard",
  kot: "/kotDashboard",
};
const icons = {
  overview: LuLayoutDashboard,
  orders: LuClipboardList,
  menu: LuUtensils,
  tables: LuTable,
  requests: LuBell,
  pos: LuShoppingBag,
  staff: LuUsers,
  reservations: LuCalendarDays,
  payments: LuWallet,
  settings: LuSettings,
  messages: LuMessageSquare,
  kitchen: LuChefHat,
};
const menus = {
  admin: [
    ["overview", "Overview"],
    ["orders", "Orders"],
    ["pos", "Point of sale"],
    ["menu", "Menu"],
    ["tables", "Tables & areas"],
    ["requests", "Service requests"],
    ["staff", "Team"],
    ["reservations", "Reservations"],
    ["payments", "Payments"],
    ["messages", "Messages"],
    ["settings", "Settings"],
  ],
  waiter: [
    ["overview", "My shift"],
    ["orders", "My orders"],
    ["pos", "Point of sale"],
    ["tables", "Tables"],
    ["requests", "Service requests"],
    ["payments", "Payments"],
    ["messages", "Messages"],
  ],
  kot: [
    ["kitchen", "Kitchen board"],
    ["overview", "Shift overview"],
  ],
};
export function session(role) {
  try {
    const user = jwtDecode(
      Cookies.get(
        {
          admin: "t_user",
          waiter: "w_user",
          kot: "k_user",
          super_admin: "sa_user",
        }[role],
      ),
    );
    return user.role === role && user.exp * 1000 > Date.now() ? user : null;
  } catch {
    return null;
  }
}
export default function Workspace({ role }) {
  const user = session(role);
  return user ? (
    <WorkspaceContent role={role} user={user} />
  ) : (
    <Navigate to="/login" replace />
  );
}
function WorkspaceContent({ role, user }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [updating, setUpdating] = useState(false),
    [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation(),
    base = bases[role];
  const refresh = useCallback(async (signal) => {
    setUpdating(true);
    try {
      const d = await request("/workspace", "GET", undefined, { signal });
      if (!signal?.aborted) {
        setData(d);
        setError("");
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    } finally {
      if (!signal?.aborted) setUpdating(false);
    }
  }, []);
  useEffect(() => {
    const c = new AbortController();
    refresh(c.signal);
    const id = setInterval(() => {
      if (!document.hidden) refresh(c.signal);
    }, 15000);
    return () => {
      c.abort();
      clearInterval(id);
    };
  }, [refresh]);
  useEffect(() => setOpen(false), [location.pathname]);
  const change = async (path, method, body) => {
    const d = await request(path, method, body);
    await refresh();
    return d;
  };
  const value = {
    ...data,
    role,
    user,
    base,
    refresh,
    change,
    restaurantId: user.restaurantId,
  };
  const current = menus[role].find(([key]) =>
    location.pathname.startsWith(`${base}/${key}`),
  );
  return (
    <Context.Provider value={value}>
      <div className={`eh-app eh-workspace ${open ? "eh-nav-open" : ""}`}>
        {open && (
          <button
            className="eh-nav-backdrop"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
        )}
        <aside className="eh-sidebar">
          <Link className="eh-brand" to={base}>
            <span className="eh-brand-icon">
              <LuUtensils />
            </span>
            EatHub<span className="eh-brand-dot">●</span>
          </Link>
          <div className="eh-sidebar-label">
            {role === "admin"
              ? "RESTAURANT WORKSPACE"
              : role === "waiter"
                ? "FLOOR WORKSPACE"
                : "KITCHEN WORKSPACE"}
          </div>
          <nav aria-label="Main navigation">
            {menus[role].map(([path, label]) => {
              const Icon = icons[path];
              return (
                <NavLink
                  key={path}
                  to={`${base}/${path}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon />
                  <span>{label}</span>
                  {path === "requests" && data?.requests?.length > 0 && (
                    <b>{data.requests.length}</b>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="eh-sidebar-bottom">
            <div className="eh-avatar">
              {(user.name || role).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>
                {user.name ||
                  {
                    admin: "Restaurant admin",
                    waiter: "Waiter",
                    kot: "Kitchen staff",
                  }[role]}
              </strong>
              <small>{data?.restaurant?.branchname || "Restaurant team"}</small>
            </div>
            <button
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                Cookies.remove(
                  { admin: "t_user", waiter: "w_user", kot: "k_user" }[role],
                );
                window.location.assign("/login");
              }}
            >
              <LuLogOut />
            </button>
          </div>
        </aside>
        <div className="eh-workspace-main">
          <header className="eh-topbar">
            <button
              className="eh-icon-button eh-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(!open)}
            >
              <LuPanelLeft />
            </button>
            <div className="eh-breadcrumb">
              <span>{data?.restaurant?.restaurentname || "Restaurant"}</span>
              <span>/</span>
              <strong>{current?.[1] || "Workspace"}</strong>
            </div>
            <div className="eh-topbar-actions">
              <span className="eh-sync">
                <i />
                {updating ? "Updating…" : "Auto-refresh · 15s"}
              </span>
              <button
                className="eh-icon-button"
                aria-label="Refresh data"
                disabled={updating}
                onClick={() => refresh()}
              >
                <LuRefreshCw />
              </button>
              <button
                className="eh-icon-button"
                aria-label="Switch color theme"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <LuSun /> : <LuMoon />}
              </button>
              <Link className="eh-top-avatar" to={`${base}/overview`}>
                {(data?.restaurant?.restaurentname || "EH")
                  .slice(0, 2)
                  .toUpperCase()}
              </Link>
            </div>
          </header>
          <main className="eh-content">
            {error && (
              <Notice error onRetry={() => refresh()}>
                {error}
              </Notice>
            )}
            {!data ? (
              <div className="eh-loading" role="status">
                {error
                  ? "Your workspace could not load. Use Retry above."
                  : "Getting your restaurant ready…"}
              </div>
            ) : (
              <Routes>
                <Route
                  index
                  element={
                    <Navigate
                      to={role === "kot" ? "kitchen" : "overview"}
                      replace
                    />
                  }
                />
                <Route path="overview" element={<Overview />} />
                {role !== "kot" && (
                  <>
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="pos/:orderId" element={<POS />} />
                    <Route path="tables" element={<TablesPage />} />
                    <Route path="requests" element={<RequestsPage />} />
                    <Route
                      path="waiter-requests"
                      element={<Navigate to={`${base}/requests`} replace />}
                    />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                  </>
                )}
                {role === "admin" && (
                  <>
                    <Route path="setup" element={<SetupPage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="staff" element={<StaffPage />} />
                    <Route path="reservations" element={<ReservationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<SettingsPage />} />
                  </>
                )}
                {role === "kot" && (
                  <Route path="kitchen" element={<KitchenPage />} />
                )}
                <Route
                  path="*"
                  element={
                    <div className="eh-empty">
                      <h2>Page not found</h2>
                      <Link className="eh-button" to={base}>
                        Back to workspace
                      </Link>
                    </div>
                  }
                />
              </Routes>
            )}
          </main>
          <footer className="eh-workspace-footer">
            EatHub <span>Restaurant operations, together.</span>
            <small>Workspace 2.0</small>
          </footer>
        </div>
      </div>
    </Context.Provider>
  );
}
