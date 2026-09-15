import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import {
  LuUtensils,
  LuLogOut,
  LuArrowLeft,
  LuArrowUpRight,
} from "react-icons/lu";
import { session } from "./Workspace";
import { request } from "../utils/api";
import { PageHeading, Search, Status, Notice, Empty, Confirm } from "./common";
import "./workspace.css";
export default function SuperAdmin() {
  return session("super_admin") ? (
    <SuperContent />
  ) : (
    <Navigate to="/superAdminLogin" replace />
  );
}
function SuperContent() {
  const [restaurants, setRestaurants] = useState([]),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [confirm, setConfirm] = useState(null);
  async function refresh() {
    try {
      const d = await request("/superAdmin/getAllRestaurants");
      setRestaurants(d.restaurants);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  return (
    <div className="eh-app">
      <header className="eh-topbar">
        <Link className="eh-guest-brand" to="/superAdminDashboard">
          <span className="eh-brand-icon">
            <LuUtensils />
          </span>
          <strong>EatHub · Platform</strong>
        </Link>
        <button
          className="eh-text-button"
          onClick={() => {
            Cookies.remove("sa_user");
            window.location.assign("/superAdminLogin");
          }}
        >
          <LuLogOut />
          Sign out
        </button>
      </header>
      <main className="eh-guest-content">
        {error && (
          <Notice error onRetry={refresh}>
            {error}
          </Notice>
        )}
        <Routes>
          <Route index element={<Navigate to="restaurants" replace />} />
          <Route
            path="restaurants"
            element={
              <>
                <PageHeading
                  title="Restaurant accounts"
                  eyebrow="PLATFORM OPERATIONS"
                  action={
                    <Search
                      value={search}
                      onChange={setSearch}
                      placeholder="Search restaurant or owner"
                    />
                  }
                >
                  Manage access and review each restaurant’s activity.
                </PageHeading>
                <div className="eh-stats">
                  {[
                    ["Restaurants", restaurants.length],
                    [
                      "Active",
                      restaurants.filter((r) => r.is_active && !r.is_suspended)
                        .length,
                    ],
                    [
                      "Suspended",
                      restaurants.filter((r) => r.is_suspended).length,
                    ],
                  ].map(([label, n]) => (
                    <article className="eh-stat" key={label}>
                      <div>{label}</div>
                      <strong>{n}</strong>
                    </article>
                  ))}
                </div>
                <div className="eh-card eh-table-scroll">
                  <table className="eh-table">
                    <thead>
                      <tr>
                        <th>Restaurant</th>
                        <th>Owner</th>
                        <th>Branch</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants
                        .filter((r) =>
                          `${r.restaurentname} ${r.name} ${r.email}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((r) => (
                          <tr key={r.id}>
                            <td>
                              <Link
                                to={`/superAdminDashboard/restaurants/${r.id}`}
                              >
                                {r.restaurentname}
                              </Link>
                            </td>
                            <td>
                              {r.name}
                              <small>{r.email}</small>
                            </td>
                            <td>{r.branchname}</td>
                            <td>
                              <Status>
                                {r.is_suspended
                                  ? "Suspended"
                                  : r.is_active
                                    ? "Active"
                                    : "Inactive"}
                              </Status>
                            </td>
                            <td>
                              <div className="eh-row-actions">
                                <Link
                                  className="eh-icon-button"
                                  aria-label={`View ${r.restaurentname}`}
                                  to={`/superAdminDashboard/restaurants/${r.id}`}
                                >
                                  <LuArrowUpRight />
                                </Link>
                                <button
                                  className="eh-text-button"
                                  onClick={() =>
                                    setConfirm({
                                      r,
                                      field: "is_active",
                                      value: !r.is_active,
                                    })
                                  }
                                >
                                  {r.is_active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  className="eh-text-button eh-danger-text"
                                  onClick={() =>
                                    setConfirm({
                                      r,
                                      field: "is_suspended",
                                      value: !r.is_suspended,
                                    })
                                  }
                                >
                                  {r.is_suspended ? "Unsuspend" : "Suspend"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!restaurants.length && !error && (
                    <Empty title="No restaurant accounts yet">
                      New registrations will appear here.
                    </Empty>
                  )}
                </div>
              </>
            }
          />
          <Route
            path="restaurants/:id"
            element={<RestaurantDetails restaurants={restaurants} />}
          />
          <Route
            path="*"
            element={<Navigate to="/superAdminDashboard/restaurants" replace />}
          />
        </Routes>
        {confirm && (
          <Confirm
            title="Change restaurant access?"
            onClose={() => setConfirm(null)}
            onConfirm={async () => {
              await request(
                `/superAdmin/updateRestaurantStatus/${confirm.r.id}`,
                "PUT",
                { [confirm.field]: confirm.value },
              );
              await refresh();
            }}
          >
            This updates access for {confirm.r.restaurentname} and its team.
            Their business records remain available.
          </Confirm>
        )}
      </main>
    </div>
  );
}
function RestaurantDetails({ restaurants }) {
  const { id } = useParams(),
    [stats, setStats] = useState(null),
    [error, setError] = useState("");
  const r = restaurants.find((r) => r.id === id);
  useEffect(() => {
    const c = new AbortController();
    request(`/superAdmin/getRestaurantStats/${id}`, "GET", undefined, {
      signal: c.signal,
    })
      .then(setStats)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [id]);
  return (
    <>
      <Link className="eh-text-button" to="/superAdminDashboard/restaurants">
        <LuArrowLeft />
        Restaurants
      </Link>
      <PageHeading title={r?.restaurentname || "Restaurant details"} />
      {error && <Notice error>{error}</Notice>}
      {stats && (
        <div className="eh-stats">
          {[
            ["Orders", stats.total_orders],
            ["Staff", stats.total_staff],
            ["Tables", stats.total_tables],
          ].map(([label, n]) => (
            <article className="eh-stat" key={label}>
              <div>{label}</div>
              <strong>{n}</strong>
            </article>
          ))}
        </div>
      )}
      {r && (
        <section className="eh-card eh-settings-form">
          <h2>{r.branchname}</h2>
          <p>{r.branchaddress}</p>
          <p>
            {r.name} · {r.email} · {r.phonenumber}
          </p>
          <Status>
            {r.is_suspended ? "Suspended" : r.is_active ? "Active" : "Inactive"}
          </Status>
        </section>
      )}
    </>
  );
}
