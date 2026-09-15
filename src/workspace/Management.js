import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  LuPencil,
  LuTrash2,
  LuQrCode,
  LuUsers,
  LuArrowUpRight,
} from "react-icons/lu";
import { useWorkspace } from "./Workspace";
import { request } from "../utils/api";
import {
  PageHeading,
  AddButton,
  FormDialog,
  Confirm,
  Search,
  Status,
  FoodImage,
  Empty,
  Notice,
  money,
  Modal,
  terminal,
} from "./common";
const field = (name, label, type = "text", extra = {}) => ({
  name,
  label,
  type,
  ...extra,
});
export function MenuPage() {
  const w = useWorkspace(),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [edit, setEdit] = useState(null),
    [cat, setCat] = useState(null),
    [remove, setRemove] = useState(null);
  const rows = w.menu.filter(
    (i) =>
      (!category || i.menu_category_id === category) &&
      i.item_name.toLowerCase().includes(search.toLowerCase()),
  );
  const fields = [
    field("item_name", "Item name"),
    field("price", "Price", "number", { min: 0.01, step: 0.01 }),
    field("menu_category_id", "Category", "select", {
      options: w.categories.map((c) => ({
        value: c.id,
        label: c.menu_category_name,
      })),
    }),
    field("item_category", "Dietary type", "select", {
      options: ["Veg", "Non-Veg", "Vegan"],
    }),
    field("availability", "Availability", "select", { options: ["Yes", "No"] }),
    field("preparation_time", "Preparation time (minutes)", "number", {
      min: 1,
    }),
    field("image_url", "Image URL", "url", { required: false }),
    field("item_dec", "Description", "textarea", { wide: true }),
  ];
  async function save(b) {
    const c = w.categories.find((c) => c.id === b.menu_category_id),
      payload = {
        item_id: edit.id || crypto.randomUUID(),
        restaurant_id: w.restaurantId,
        item_name: b.item_name,
        item_price: String(b.price),
        item_dec: b.item_dec,
        category_name: c.menu_category_name,
        item_menu_category_id: c.id,
        item_category: b.item_category,
        item_url: b.image_url || "",
        item_availabiliy: b.availability,
        item_preparation_time: String(b.preparation_time),
      };
    await w.change(
      edit.id
        ? "/restaurant_details/updateMenuItem"
        : "/restaurant_details/addMenuItems",
      edit.id ? "PUT" : "POST",
      edit.id ? payload : [payload],
    );
  }
  return (
    <>
      <PageHeading
        title="Your menu"
        action={
          <div className="eh-row-actions">
            <button
              className="eh-button eh-secondary"
              onClick={() => setCat({})}
            >
              Add category
            </button>
            <AddButton
              onClick={() =>
                setEdit({
                  availability: "Yes",
                  item_category: "Veg",
                  preparation_time: "15",
                  menu_category_id: category || w.categories[0]?.id,
                })
              }
            >
              Add item
            </AddButton>
          </div>
        }
      >
        Make every item easy to find, order, and prepare.
      </PageHeading>
      <div className="eh-toolbar">
        <div className="eh-tabs">
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory("")}
          >
            All items <b>{w.menu.length}</b>
          </button>
          {w.categories.map((c) => (
            <button
              className={category === c.id ? "active" : ""}
              key={c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.menu_category_name}
            </button>
          ))}
        </div>
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search menu items"
        />
      </div>
      {category && (
        <div className="eh-category-actions">
          <span>
            {w.categories.find((c) => c.id === category)?.menu_category_name}
          </span>
          <button
            className="eh-text-button"
            onClick={() => setCat(w.categories.find((c) => c.id === category))}
          >
            Rename
          </button>
          <button
            className="eh-text-button eh-danger-text"
            onClick={() => setRemove({ category, id: category })}
          >
            Delete category
          </button>
        </div>
      )}
      <div className="eh-menu-grid">
        {rows.map((i) => (
          <article className="eh-menu-card" key={i.id}>
            <div className="eh-food-image">
              <FoodImage item={i} />
              <span className="eh-diet">{i.item_category}</span>
            </div>
            <div className="eh-menu-info">
              <small>{i.category_name}</small>
              <h3>{i.item_name}</h3>
              <p>{i.item_dec}</p>
              <div className="eh-menu-price">
                <strong>{money(i.price)}</strong>
                <Status>
                  {i.availability === "Yes" ? "Available" : "Unavailable"}
                </Status>
              </div>
              <div className="eh-row-actions">
                <button
                  className="eh-button eh-secondary eh-small"
                  onClick={() => setEdit(i)}
                >
                  <LuPencil />
                  Edit item
                </button>
                <button
                  className="eh-icon-button eh-danger-text"
                  aria-label={`Delete ${i.item_name}`}
                  onClick={() => setRemove(i)}
                >
                  <LuTrash2 />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <Empty title="Your next favourite goes here">
          Add a category, then add the dishes your guests will love.
        </Empty>
      )}
      {edit && (
        <FormDialog
          title={edit.id ? "Edit menu item" : "Add menu item"}
          fields={fields}
          initial={edit}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {cat && (
        <FormDialog
          title={cat.id ? "Rename category" : "Add category"}
          fields={[field("menu_category_name", "Category name")]}
          initial={cat}
          onClose={() => setCat(null)}
          onSave={(b) =>
            w.change(
              cat.id
                ? "/restaurant_details/updateMenuCategoryName"
                : "/restaurant_details/addMenuCategory",
              cat.id ? "PUT" : "POST",
              cat.id
                ? {
                    id: cat.id,
                    menu_category_name: b.menu_category_name,
                    restaurant_id: w.restaurantId,
                  }
                : [
                    {
                      menu_category_id: crypto.randomUUID(),
                      menu_category_name: b.menu_category_name,
                      restaurant_id: w.restaurantId,
                    },
                  ],
            )
          }
        />
      )}{" "}
      {remove && (
        <Confirm
          title={
            remove.category
              ? "Delete category and its menu items?"
              : "Delete menu item?"
          }
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            await w.change(
              remove.category
                ? `/deleteMenuCategoryCompletly/${remove.id}`
                : `/deleteMenuItem/${remove.id}/${w.restaurantId}`,
              "DELETE",
            );
            if (remove.category) setCategory("");
          }}
        >
          Existing order history will retain its recorded prices and item names.
        </Confirm>
      )}
    </>
  );
}
export function TablesPage() {
  const w = useWorkspace(),
    [area, setArea] = useState(""),
    [edit, setEdit] = useState(null),
    [areaEdit, setAreaEdit] = useState(null),
    [qr, setQr] = useState(null),
    [remove, setRemove] = useState(null),
    [availability, setAvailability] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    request(`/public/tables/${w.restaurantId}`, "GET", undefined, {
      signal: c.signal,
    })
      .then((d) => setAvailability(d.tables))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [w.restaurantId, w.tables, w.reservations, w.orders]);
  const tables = w.tables.filter((t) => !area || t.area_id === area);
  return (
    <>
      <PageHeading
        title="Tables & areas"
        action={
          w.role === "admin" && (
            <div className="eh-row-actions">
              <button
                className="eh-button eh-secondary"
                onClick={() => setAreaEdit({})}
              >
                Add area
              </button>
              <AddButton
                onClick={() =>
                  setEdit({
                    is_active: "true",
                    seat_capacity: 4,
                    area_id: area || w.areas[0]?.id,
                  })
                }
              >
                Add table
              </AddButton>
            </div>
          )
        }
      >
        Plan your floor and keep every seat connected.
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      <div className="eh-toolbar">
        <div className="eh-tabs">
          <button className={!area ? "active" : ""} onClick={() => setArea("")}>
            All areas
          </button>
          {w.areas.map((a) => (
            <button
              className={area === a.id ? "active" : ""}
              key={a.id}
              onClick={() => setArea(a.id)}
            >
              {a.area_name}
            </button>
          ))}
        </div>
        <Link
          className="eh-button eh-secondary"
          target="_blank"
          to={`/tables/${w.restaurantId}`}
        >
          Guest entrance <LuArrowUpRight />
        </Link>
      </div>
      {area && w.role === "admin" && (
        <div className="eh-category-actions">
          <button
            className="eh-text-button"
            onClick={() => setAreaEdit(w.areas.find((a) => a.id === area))}
          >
            Rename area
          </button>
          <button
            className="eh-text-button eh-danger-text"
            onClick={() => setRemove({ area: true, id: area })}
          >
            Remove area
          </button>
        </div>
      )}
      <div className="eh-tables-grid">
        {tables.map((t) => {
          const status =
            availability.find((a) => a.id === t.id)?.current_status ||
            t.current_status ||
            "available";
          const active = w.orders.find(
            (o) => o.table_id === t.id && !terminal(o),
          );
          return (
            <article className={`eh-table-card eh-table-${status}`} key={t.id}>
              <div className="eh-card-heading">
                <small>
                  {w.areas.find((a) => a.id === t.area_id)?.area_name}
                </small>
                <Status>{status}</Status>
              </div>
              <div className="eh-table-illustration">
                <span>{t.name}</span>
              </div>
              <p>
                <LuUsers />
                {t.seat_capacity} seats
              </p>
              <div className="eh-row-actions">
                {active ? (
                  <Link
                    className="eh-button eh-small"
                    to={`${w.base}/pos/${active.id}`}
                  >
                    View order
                  </Link>
                ) : (
                  <Link
                    className="eh-button eh-small"
                    to={`${w.base}/pos?table=${t.id}`}
                  >
                    New order
                  </Link>
                )}
                <button
                  className="eh-icon-button"
                  aria-label={`Show QR for ${t.name}`}
                  onClick={() => setQr(t)}
                >
                  <LuQrCode />
                </button>
                {w.role === "admin" && (
                  <>
                    <button
                      className="eh-icon-button"
                      aria-label={`Edit ${t.name}`}
                      onClick={() => setEdit(t)}
                    >
                      <LuPencil />
                    </button>
                    <button
                      className="eh-icon-button eh-danger-text"
                      aria-label={`Delete ${t.name}`}
                      onClick={() => setRemove(t)}
                    >
                      <LuTrash2 />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!tables.length && (
        <Empty title="Set the table">
          Create an area and add your first table to start QR ordering.
        </Empty>
      )}
      {qr && (
        <Modal title={`${qr.name} · Scan to order`} onClose={() => setQr(null)}>
          <div id="eathub-qr" className="eh-qr">
            <QRCode
              value={`${window.location.origin}/customerDashboard/${qr.id}/${w.restaurantId}/home`}
              size={220}
            />
            <h3>{w.restaurant.restaurentname}</h3>
            <p>{qr.name}</p>
            <Link
              to={`/customerDashboard/${qr.id}/${w.restaurantId}/home`}
              target="_blank"
            >
              Open guest menu
            </Link>
          </div>
          <button className="eh-button" onClick={() => window.print()}>
            Print table QR
          </button>
        </Modal>
      )}
      {edit && (
        <FormDialog
          title={edit.id ? "Edit table" : "Add table"}
          initial={edit}
          fields={[
            field("name", "Table name"),
            field("seat_capacity", "Seats", "number", { min: 1, max: 100 }),
            field("area_id", "Area", "select", {
              options: w.areas.map((a) => ({
                value: a.id,
                label: a.area_name,
              })),
            }),
            field("is_active", "Accept orders", "select", {
              options: [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ],
            }),
          ]}
          onClose={() => setEdit(null)}
          onSave={(b) => {
            const p = {
              table_id: edit.id || crypto.randomUUID(),
              table_name: b.name,
              table_capacity: Number(b.seat_capacity),
              table_status: String(b.is_active),
              area_id: b.area_id,
              restaurant_id: w.restaurantId,
            };
            return w.change(
              edit.id
                ? "/restaurant_details/updateTable"
                : "/restaurant_details/addTable",
              edit.id ? "PUT" : "POST",
              edit.id ? p : [p],
            );
          }}
        />
      )}
      {areaEdit && (
        <FormDialog
          title={areaEdit.id ? "Rename area" : "Add area"}
          initial={areaEdit}
          fields={[field("area_name", "Area name")]}
          onClose={() => setAreaEdit(null)}
          onSave={(b) => {
            const p = {
              area_id: areaEdit.id || crypto.randomUUID(),
              area_name: b.area_name,
              restaurant_id: w.restaurantId,
            };
            return w.change(
              areaEdit.id
                ? "/restaurant_details/updateArea"
                : "/restaurant_details/addAreas",
              areaEdit.id ? "PUT" : "POST",
              areaEdit.id ? p : [p],
            );
          }}
        />
      )}
      {remove && (
        <Confirm
          title={remove.area ? "Remove area and its tables?" : "Remove table?"}
          onClose={() => setRemove(null)}
          onConfirm={async () => {
            await w.change(
              remove.area
                ? `/deleteArea/${remove.id}/${w.restaurantId}`
                : `/deleteTable/${remove.id}/${w.restaurantId}`,
              "DELETE",
            );
            if (remove.area) setArea("");
          }}
        >
          Active orders and reservations must be resolved before removing a
          table.
        </Confirm>
      )}
    </>
  );
}
export function StaffPage() {
  const w = useWorkspace(),
    [edit, setEdit] = useState(null),
    [remove, setRemove] = useState(null),
    [search, setSearch] = useState("");
  const fields = [
    field("name", "Full name"),
    field("email", "Email", "email"),
    field("phone_number", "Phone", "tel"),
    field("role", "Role", "select", { options: ["Waiter", "Chef"] }),
    field("status", "Status", "select", {
      options: ["active", "available", "serving", "busy", "inactive"],
    }),
    field(
      "password",
      edit?.id ? "New password (optional)" : "Login password",
      "password",
      { required: !edit?.id, minLength: 8 },
    ),
    field("shift_timing", "Shift hours", "text", { required: false }),
    field("salary", "Monthly salary", "number", { min: 0, required: false }),
    field("address", "Address", "textarea", { required: false, wide: true }),
  ];
  async function save(b) {
    await w.change(
      edit.id
        ? "/restaurant_details/updateStaff"
        : "/restaurant_details/addStaff",
      edit.id ? "PUT" : "POST",
      {
        staff_id: edit.id || crypto.randomUUID(),
        restaurant_id: w.restaurantId,
        staff_name: b.name,
        staff_email: b.email,
        staff_phone: b.phone_number,
        staff_role: b.role,
        staff_status: b.status,
        staff_shift_timing: b.shift_timing || "",
        staff_salary: String(b.salary || ""),
        staff_address: b.address || "",
        staff_image: edit.staff_image || "",
        staff_experience: edit.experience || 0,
        staff_ratings: edit.ratings || 0,
        waiter_total_orders_served: edit.total_orders_served || 0,
        waiter_assigned_tables: edit.assigned_tables || null,
        password: b.password || "",
      },
    );
  }
  return (
    <>
      <PageHeading
        title="Your team"
        action={
          <AddButton
            onClick={() => setEdit({ role: "Waiter", status: "active" })}
          >
            Add team member
          </AddButton>
        }
      >
        The people behind every great service.
      </PageHeading>
      <div className="eh-toolbar">
        <p>{w.staff.length} team members</p>
        <Search value={search} onChange={setSearch} placeholder="Search team" />
      </div>
      <div className="eh-team-grid">
        {w.staff
          .filter((s) =>
            `${s.name} ${s.email} ${s.role}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((s) => (
            <article className="eh-card eh-team-card" key={s.id}>
              <div className="eh-card-heading">
                <div className="eh-person-avatar">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <Status>{s.status || "active"}</Status>
              </div>
              <h2>{s.name}</h2>
              <p>{s.role}</p>
              <small>
                {s.email}
                <br />
                {s.phone_number}
                <br />
                {s.shift_timing || "Shift not specified"}
              </small>
              <div className="eh-row-actions">
                <button
                  className="eh-button eh-secondary eh-small"
                  onClick={() => setEdit(s)}
                >
                  <LuPencil />
                  Edit member
                </button>
                <button
                  className="eh-icon-button eh-danger-text"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => setRemove(s)}
                >
                  <LuTrash2 />
                </button>
              </div>
            </article>
          ))}
      </div>
      {!w.staff.length && (
        <Empty title="Build your team">
          Add waiter and kitchen accounts so they can sign in to their own
          dashboards.
        </Empty>
      )}
      {edit && (
        <FormDialog
          title={edit.id ? "Edit team member" : "Add team member"}
          initial={edit}
          fields={fields}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Remove team member?"
          onClose={() => setRemove(null)}
          onConfirm={() =>
            w.change(
              `/restaurant_details/deleteStaff/${remove.id}/${w.restaurantId}`,
              "DELETE",
            )
          }
        >
          Consider setting the member inactive to retain their assignment
          history.
        </Confirm>
      )}
    </>
  );
}
export function ReservationsPage() {
  const w = useWorkspace(),
    [edit, setEdit] = useState(null),
    [error, setError] = useState(""),
    [day, setDay] = useState(""),
    [remove, setRemove] = useState(null),
    [busy, setBusy] = useState("");
  async function state(r, status) {
    setBusy(r.id);
    try {
      await w.change(`/updateReservation/${r.id}`, "PUT", {
        ...r,
        date: String(r.date).slice(0, 10),
        status,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeading
        title="Reservations"
        action={
          <AddButton
            onClick={() =>
              setEdit({
                date: new Date().toLocaleDateString("en-CA"),
                time: "19:00",
                guests: 2,
                status: "confirmed",
              })
            }
          >
            New reservation
          </AddButton>
        }
      >
        A place for every guest, with time to prepare.
      </PageHeading>
      <div className="eh-toolbar">
        <label>
          Filter by date{" "}
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <button className="eh-text-button" onClick={() => setDay("")}>
          Show all dates
        </button>
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="eh-card eh-table-scroll">
        <table className="eh-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Date & time</th>
              <th>Table</th>
              <th>Party</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {w.reservations
              .filter((r) => !day || String(r.date).startsWith(day))
              .map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.customer_name}</strong>
                    <small>{r.phone}</small>
                  </td>
                  <td>
                    {String(r.date).slice(0, 10)}
                    <small>{r.time.slice(0, 5)}</small>
                  </td>
                  <td>
                    {w.tables.find((t) => t.id === r.table_id)?.name ||
                      "Removed table"}
                  </td>
                  <td>{r.guests} guests</td>
                  <td>
                    <Status>{r.status}</Status>
                  </td>
                  <td>
                    {!["cancelled", "completed"].includes(r.status) && (
                      <div className="eh-row-actions">
                        <button
                          className="eh-button eh-small"
                          disabled={!!busy}
                          onClick={() =>
                            state(
                              r,
                              r.status === "seated" ? "completed" : "seated",
                            )
                          }
                        >
                          {r.status === "seated" ? "Complete" : "Seat guests"}
                        </button>
                        <button
                          className="eh-icon-button"
                          aria-label="Edit reservation"
                          onClick={() => setEdit(r)}
                        >
                          <LuPencil />
                        </button>
                        <button
                          className="eh-icon-button eh-danger-text"
                          aria-label="Cancel reservation"
                          onClick={() => setRemove(r)}
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!w.reservations.length && (
          <Empty title="Ready for reservations">
            Add your first booking and reserve a table for your guests.
          </Empty>
        )}
      </div>
      {edit && (
        <ReservationDialog reservation={edit} onClose={() => setEdit(null)} />
      )}{" "}
      {remove && (
        <Confirm
          title="Cancel reservation?"
          onClose={() => setRemove(null)}
          onConfirm={() =>
            w.change(`/deleteReservation/${remove.id}`, "DELETE")
          }
        >
          This releases the table for the reservation window.
        </Confirm>
      )}
    </>
  );
}
function ReservationDialog({ reservation: r, onClose }) {
  const w = useWorkspace();
  const [b, setB] = useState({
      ...r,
      date: String(r.date).slice(0, 10),
      time: r.time.slice(0, 5),
    }),
    [tables, setTables] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    request(
      `/public/tables/${w.restaurantId}?date=${b.date}&time=${b.time}${r.id ? `&exclude_reservation_id=${r.id}` : ""}`,
      "GET",
      undefined,
      { signal: c.signal },
    )
      .then((d) => {
        setTables(d.tables);
        setError("");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [b.date, b.time, r.id, w.restaurantId]);
  const set = (k, v) => setB({ ...b, [k]: v });
  return (
    <Modal
      title={r.id ? "Edit reservation" : "New reservation"}
      onClose={() => !busy && onClose()}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await w.change(
              r.id ? `/updateReservation/${r.id}` : "/addReservation",
              r.id ? "PUT" : "POST",
              {
                ...b,
                id: r.id || crypto.randomUUID(),
                restaurant_id: w.restaurantId,
                guests: Number(b.guests),
              },
            );
            onClose();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="eh-form-grid">
          {[
            ["customer_name", "Guest name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "tel"],
            ["date", "Date", "date"],
            ["time", "Time", "time"],
            ["guests", "Guests", "number"],
          ].map(([k, label, type]) => (
            <label key={k}>
              {label}
              <input
                type={type}
                min={type === "number" ? 1 : undefined}
                required
                value={b[k] || ""}
                onChange={(e) => set(k, e.target.value)}
              />
            </label>
          ))}
          <label className="eh-field-wide">
            Available table
            <select
              required
              value={b.table_id || ""}
              disabled={loading}
              onChange={(e) => set("table_id", e.target.value)}
            >
              <option value="">
                {loading ? "Checking availability…" : "Choose a table"}
              </option>
              {tables.map((t) => (
                <option
                  value={t.id}
                  key={t.id}
                  disabled={
                    (t.current_status !== "available" && t.id !== r.table_id) ||
                    Number(t.seat_capacity) < Number(b.guests)
                  }
                >
                  {t.name} · {t.seat_capacity} seats · {t.current_status}
                </option>
              ))}
            </select>
          </label>
          <label className="eh-field-wide">
            Notes
            <textarea
              value={b.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </label>
        </div>
        {error && <Notice error>{error}</Notice>}
        <p className="eh-muted">
          Tables are held from 30 minutes before until 2 hours after the
          reservation time. Seat guests before taking their order.
        </p>
        <div className="eh-dialog-actions">
          <button className="eh-button" disabled={busy || loading}>
            {busy ? "Saving…" : "Save reservation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function SettingsPage() {
  const w = useWorkspace();
  const [profile, setProfile] = useState(w.restaurant),
    [settings, setSettings] = useState({
      taxRate: 0,
      currency: "INR",
      paymentMethods: { cash: true, upi: true, card: true },
      ...w.restaurant.payment_settings,
    }),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function save(e, kind) {
    e.preventDefault();
    setBusy(kind);
    setError("");
    setNotice("");
    try {
      await w.change(
        kind === "profile"
          ? "/workspace/profile"
          : `/updatePaymentSettings/${w.restaurantId}`,
        "PUT",
        kind === "profile"
          ? profile
          : { ...settings, taxRate: Number(settings.taxRate) },
      );
      setNotice("Settings saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeading title="Restaurant settings">
        The details that make this workspace yours.
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <div className="eh-settings-grid">
        <form
          className="eh-card eh-settings-form"
          onSubmit={(e) => save(e, "profile")}
        >
          <h2>Restaurant profile</h2>
          <p>These details appear on your bills and guest menu.</p>
          {[
            ["restaurentname", "Restaurant name"],
            ["name", "Owner name"],
            ["branchname", "Branch"],
            ["branchaddress", "Address"],
            ["phonenumber", "Phone"],
          ].map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                required
                value={profile[k] || ""}
                onChange={(e) =>
                  setProfile({ ...profile, [k]: e.target.value })
                }
              />
            </label>
          ))}
          <button className="eh-button" disabled={!!busy}>
            {busy === "profile" ? "Saving…" : "Save profile"}
          </button>
        </form>
        <form
          className="eh-card eh-settings-form"
          onSubmit={(e) => save(e, "payments")}
        >
          <h2>Billing & payments</h2>
          <p>
            Default tax applies to new orders. Existing bills keep their
            recorded values.
          </p>
          <label>
            Default tax (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              value={settings.taxRate}
              onChange={(e) =>
                setSettings({ ...settings, taxRate: e.target.value })
              }
            />
          </label>
          <h3>Accepted at the counter</h3>
          {["cash", "upi", "card"].map((m) => (
            <label className="eh-check" key={m}>
              <input
                type="checkbox"
                checked={settings.paymentMethods?.[m] !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentMethods: {
                      ...settings.paymentMethods,
                      [m]: e.target.checked,
                    },
                  })
                }
              />
              {m.toUpperCase()}
            </label>
          ))}
          <p className="eh-muted">
            Staff must verify receipt for cash, bank UPI, and card terminal
            payments.
          </p>
          <button className="eh-button" disabled={!!busy}>
            {busy === "payments" ? "Saving…" : "Save billing settings"}
          </button>
        </form>
      </div>
    </>
  );
}

export function SetupPage() {
  const w = useWorkspace();
  return (
    <>
      <PageHeading
        title="Let’s set up your restaurant."
        eyebrow="GET READY FOR YOUR FIRST SERVICE"
      >
        Complete these steps in any order. Your progress is saved as you go.
      </PageHeading>
      <div className="eh-team-grid">
        {[
          [
            "tables",
            "Set the floor",
            "Add areas, tables, and guest QR codes.",
            w.tables.length > 0,
          ],
          [
            "menu",
            "Build your menu",
            "Add categories and the dishes you serve.",
            w.menu.length > 0,
          ],
          [
            "staff",
            "Invite your team",
            "Create waiter and kitchen logins.",
            w.staff.length > 0,
          ],
          [
            "settings",
            "Check the details",
            "Set your bill details and payment options.",
            false,
          ],
        ].map(([path, title, text, done]) => (
          <article className="eh-card eh-settings-form" key={path}>
            <Status>{done ? "Completed" : "Next step"}</Status>
            <h2>{title}</h2>
            <p>{text}</p>
            <Link className="eh-button" to={`${w.base}/${path}`}>
              {done ? "Review" : "Set up"}
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
