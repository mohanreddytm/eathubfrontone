import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiFetch, { API_BASE_URL } from "../../utils/api";
export default function PublicTables() {
  const { restaurantId } = useParams();
  const [tables, setTables] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await apiFetch(
            `${API_BASE_URL}/public/tables/${restaurantId}`,
          ),
          d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (alive) {
          setTables(d.tables);
          setError("");
        }
      } catch (e) {
        if (alive) setError(e.message);
      }
    }
    load();
    const id = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [restaurantId]);
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "auto" }}>
      <h1>Choose your table</h1>
      <p>
        Available tables refresh every minute. Ask staff before taking a seat.
      </p>
      {error && <p role="alert">{error}</p>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        {tables.map((t) => (
          <section
            key={t.id}
            style={{
              border: `2px solid ${{ available: "#27936c", occupied: "#d45656", reserved: "#c69b25" }[t.current_status] || "#888"}`,
              padding: 16,
              borderRadius: 12,
            }}
          >
            <h2>{t.name}</h2>
            <p>
              {t.seat_capacity} seats · {t.current_status}
            </p>
            {t.current_status === "available" && (
              <Link to={`/customerDashboard/${t.id}/${restaurantId}/home`}>
                View menu
              </Link>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
