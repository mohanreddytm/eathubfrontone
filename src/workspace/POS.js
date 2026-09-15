import React, { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LuPlus,
  LuMinus,
  LuTrash2,
  LuShoppingBag,
  LuArrowRight,
  LuArrowLeft,
  LuUtensils,
} from "react-icons/lu";
import { useWorkspace } from "./Workspace";
import { request } from "../utils/api";
import OrderActions from "../components/RestaurentDashboard/POS/OrderActions";
import {
  Search,
  PageHeading,
  Notice,
  Empty,
  FoodImage,
  money,
  available,
  terminal,
  FormDialog,
} from "./common";
export default function POS() {
  const w = useWorkspace(),
    { orderId } = useParams(),
    [params] = useSearchParams(),
    navigate = useNavigate();
  const draftKey = `eathub-cart:${w.restaurantId}:${w.user.userId}:${orderId || "new"}`;
  return (
    <POSContent
      key={draftKey}
      {...{ w, orderId, params, navigate, draftKey }}
    />
  );
}
function POSContent({ w, orderId, params, navigate, draftKey }) {
  const [draft, setDraft] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(draftKey)) || {};
    } catch {
      return {};
    }
  });
  const cart = draft.items || [],
    [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [revision, setRevision] = useState(0),
    [assignment, setAssignment] = useState(false),
    [availability, setAvailability] = useState([]);
  const submitLock = useRef(false),
    attempt = useRef(draft.requestId || crypto.randomUUID());
  const selectedOrder = w.orders.find((o) => o.id === orderId);
  useEffect(() => {
    sessionStorage.setItem(
      draftKey,
      JSON.stringify({ ...draft, requestId: attempt.current }),
    );
  }, [draft, draftKey]);
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
  }, [w.restaurantId, w.tables]);
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const changeQty = (id, delta) =>
    set(
      "items",
      cart
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.min(100, i.quantity + delta) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  function add(i) {
    if (
      busy ||
      (selectedOrder &&
        (terminal(selectedOrder) ||
          ["Paid", "SUCCESS"].includes(selectedOrder.payment_status)))
    )
      return;
    if (cart.some((c) => c.id === i.id)) changeQty(i.id, 1);
    else
      set("items", [
        ...cart,
        { id: i.id, name: i.item_name, price: Number(i.price), quantity: 1 },
      ]);
  }
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0),
    discount = Number(draft.discount || 0),
    taxRate = Number(
      draft.taxRate ?? w.restaurant.payment_settings?.taxRate ?? 0,
    ),
    taxMode = draft.taxMode || "exclusive",
    tax =
      ((subtotal - discount) * taxRate) /
      (taxMode === "inclusive" ? 100 + taxRate : 100),
    grand = subtotal - discount + (taxMode === "inclusive" ? 0 : tax);
  async function submit() {
    if (submitLock.current || !cart.length) return;
    submitLock.current = true;
    setBusy(true);
    setError("");
    try {
      const d = await request(
        orderId ? `/addKOT/${orderId}` : "/addNewOrder",
        "POST",
        orderId
          ? { items: cart.map((i) => ({ id: i.id, quantity: i.quantity })) }
          : {
              id: attempt.current,
              restaurant_id: w.restaurantId,
              table_id: draft.table ?? params.get("table") ?? null,
              waiter_id:
                w.role === "waiter" ? w.user.userId : draft.waiter || null,
              customer_name: draft.guest || "Walk-in",
              items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
              note: draft.note || "",
              discount_amount: w.role === "admin" ? discount : 0,
              tax_mode: taxMode,
              tax_percent: taxRate,
            },
      );
      sessionStorage.removeItem(draftKey);
      setDraft({});
      attempt.current = crypto.randomUUID();
      await w.refresh();
      if (orderId) setRevision((n) => n + 1);
      else navigate(`${w.base}/pos/${d.order.id}`, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      submitLock.current = false;
    }
  }
  const menu = w.menu.filter(
    (i) =>
      available(i) &&
      (!category || i.menu_category_id === category) &&
      `${i.item_name} ${i.category_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Point of sale"
        eyebrow="TAKE AN ORDER"
        action={
          orderId ? (
            <Link className="eh-button eh-secondary" to={`${w.base}/pos`}>
              <LuPlus />
              New order
            </Link>
          ) : (
            <Link className="eh-text-button" to={`${w.base}/orders`}>
              All orders <LuArrowRight />
            </Link>
          )
        }
      >
        {orderId
          ? "Review this order, add items, and settle the bill."
          : "Good food. Smooth service. Start with a dish."}
      </PageHeading>
      <div className="eh-pos">
        <section className="eh-pos-menu">
          <div className="eh-pos-search">
            <Search
              value={search}
              onChange={setSearch}
              placeholder="Search the menu…"
            />
            <span>{w.menu.filter(available).length} items available</span>
          </div>
          <div className="eh-tabs eh-pos-categories">
            <button
              className={!category ? "active" : ""}
              onClick={() => setCategory("")}
            >
              <LuUtensils />
              All items
            </button>
            {w.categories.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                onClick={() => setCategory(c.id)}
              >
                {c.menu_category_name}
              </button>
            ))}
          </div>
          <div className="eh-pos-grid">
            {menu.map((i) => (
              <button
                className="eh-pos-item"
                disabled={
                  busy ||
                  (selectedOrder &&
                    (terminal(selectedOrder) ||
                      ["Paid", "SUCCESS"].includes(
                        selectedOrder.payment_status,
                      )))
                }
                key={i.id}
                onClick={() => add(i)}
              >
                <div className="eh-food-image">
                  <FoodImage item={i} />
                  <span
                    className={`eh-food-dot ${/non/i.test(i.item_category) ? "eh-nonveg" : ""}`}
                  />
                </div>
                <div className="eh-pos-item-info">
                  <small>{i.category_name}</small>
                  <h3>{i.item_name}</h3>
                  <div>
                    <strong>{money(i.price)}</strong>
                    <span className="eh-add-circle">
                      <LuPlus />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!menu.length && (
            <Empty title="No dishes found">
              Try a different search or add available items to your menu.
            </Empty>
          )}
          {orderId && cart.length > 0 && (
            <div className="eh-card eh-extra-kot">
              <h2>Additional kitchen ticket</h2>
              <CartLines items={cart} changeQty={changeQty} disabled={busy} />
              {error && <Notice error>{error}</Notice>}
              <button className="eh-button" disabled={busy} onClick={submit}>
                {busy ? "Sending…" : "Send additional KOT"}
                <LuArrowRight />
              </button>
            </div>
          )}
        </section>
        <aside className="eh-pos-bill" id="pos-ticket">
          {orderId ? (
            <>
              <div className="eh-existing-order-toolbar">
                <Link to={`${w.base}/orders`}>
                  <LuArrowLeft />
                  Orders
                </Link>
                {w.role === "admin" &&
                  selectedOrder &&
                  !terminal(selectedOrder) && (
                    <button
                      className="eh-text-button"
                      onClick={() => setAssignment(true)}
                    >
                      Assign waiter
                    </button>
                  )}
              </div>
              <OrderActions
                key={`${orderId}-${revision}`}
                orderId={orderId}
                menuItems={w.menu}
                onChanged={w.refresh}
              />
              {error && <Notice error>{error}</Notice>}
            </>
          ) : (
            <section className="eh-cart">
              <div className="eh-cart-heading">
                <div>
                  <h2>New order</h2>
                  <p>
                    {cart.reduce((s, i) => s + i.quantity, 0)} items in this
                    ticket
                  </p>
                </div>
                <LuShoppingBag />
              </div>
              <div className="eh-order-assignment">
                <label>
                  Table
                  <select
                    aria-label="Table"
                    value={draft.table ?? params.get("table") ?? ""}
                    disabled={busy}
                    onChange={(e) => set("table", e.target.value)}
                  >
                    <option value="">Walk-in / takeaway</option>
                    {w.tables.map((t) => {
                      const s = availability.find(
                        (a) => a.id === t.id,
                      )?.current_status;
                      return (
                        <option
                          key={t.id}
                          value={t.id}
                          disabled={["reserved", "unavailable"].includes(s)}
                        >
                          {t.name} · {t.seat_capacity} seats
                          {s && s !== "available" ? ` · ${s}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
                {w.role === "admin" && (
                  <label>
                    Waiter
                    <select
                      aria-label="Waiter"
                      value={draft.waiter || ""}
                      disabled={busy}
                      onChange={(e) => set("waiter", e.target.value)}
                    >
                      <option value="">Auto assign</option>
                      {w.staff
                        .filter(
                          (s) =>
                            /waiter/i.test(s.role) &&
                            !/inactive|disabled|suspended/i.test(s.status),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </div>
              {!cart.length ? (
                <Empty title="Your order starts here">
                  Tap a dish to add it to this ticket.
                </Empty>
              ) : (
                <CartLines items={cart} changeQty={changeQty} disabled={busy} />
              )}
              <div className="eh-cart-notes">
                <label>
                  Guest name <span>Optional</span>
                  <input
                    placeholder="Walk-in guest"
                    maxLength={100}
                    disabled={busy}
                    value={draft.guest || ""}
                    onChange={(e) => set("guest", e.target.value)}
                  />
                </label>
                <label>
                  Kitchen note <span>Optional</span>
                  <textarea
                    placeholder="Allergies, preferences, special requests…"
                    maxLength={1000}
                    disabled={busy}
                    value={draft.note || ""}
                    onChange={(e) => set("note", e.target.value)}
                  />
                </label>
              </div>
              <div className="eh-bill-summary">
                <div>
                  <span>Subtotal</span>
                  <b>{money(subtotal)}</b>
                </div>
                {w.role === "admin" && (
                  <label className="eh-bill-input">
                    Discount (₹)
                    <input
                      aria-label="Order discount"
                      type="number"
                      min="0"
                      max={subtotal}
                      value={draft.discount || 0}
                      disabled={busy}
                      onChange={(e) => set("discount", e.target.value)}
                    />
                  </label>
                )}
                <div>
                  <span>
                    Tax ({taxRate}%, {taxMode})
                  </span>
                  <b>{money(tax)}</b>
                </div>
                {w.role === "admin" && (
                  <details>
                    <summary>Tax options</summary>
                    <div className="eh-form-grid">
                      <label>
                        Tax rate (%)
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={taxRate}
                          disabled={busy}
                          onChange={(e) => set("taxRate", e.target.value)}
                        />
                      </label>
                      <label>
                        Tax mode
                        <select
                          value={taxMode}
                          disabled={busy}
                          onChange={(e) => set("taxMode", e.target.value)}
                        >
                          <option value="exclusive">Exclusive</option>
                          <option value="inclusive">Inclusive</option>
                        </select>
                      </label>
                    </div>
                  </details>
                )}
                <div className="eh-grand-total">
                  <strong>Total</strong>
                  <strong>{money(grand)}</strong>
                </div>
              </div>
              {error && (
                <Notice error>
                  {error} Your cart is saved; you can retry.
                </Notice>
              )}
              <button
                className="eh-button eh-submit-order"
                onClick={submit}
                disabled={
                  busy ||
                  !cart.length ||
                  discount < 0 ||
                  discount > subtotal ||
                  taxRate < 0 ||
                  taxRate > 100
                }
              >
                {busy ? "Sending order…" : "Create order & send KOT"}
                <LuArrowRight />
              </button>
              <p className="eh-cart-footnote">
                Bill and payment options open after the order is saved.
              </p>
            </section>
          )}
        </aside>
      </div>
      {!orderId && cart.length > 0 && (
        <button
          className="eh-mobile-ticket"
          onClick={() =>
            document
              .getElementById("pos-ticket")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          <LuShoppingBag />
          <span>
            View ticket · {cart.reduce((s, i) => s + i.quantity, 0)} items
          </span>
          <strong>{money(grand)}</strong>
          <LuArrowRight />
        </button>
      )}
      {assignment && (
        <FormDialog
          title="Assign waiter to order"
          fields={[
            {
              name: "waiter_id",
              label: "Waiter",
              type: "select",
              options: w.staff
                .filter((s) => /waiter/i.test(s.role))
                .map((s) => ({ value: s.id, label: s.name })),
            },
          ]}
          initial={{ waiter_id: selectedOrder.waiter_id }}
          onClose={() => setAssignment(false)}
          onSave={(b) =>
            w.change(`/workspace/orders/${orderId}/assignment`, "PATCH", b)
          }
        />
      )}
    </>
  );
}
export function CartLines({ items, changeQty, disabled }) {
  return (
    <ul className="eh-cart-lines">
      {items.map((i) => (
        <li key={i.id}>
          <div>
            <strong>{i.name}</strong>
            <small>{money(i.price)} each</small>
            <div className="eh-quantity">
              <button
                aria-label={`Decrease ${i.name}`}
                disabled={disabled}
                onClick={() => changeQty(i.id, -1)}
              >
                <LuMinus />
              </button>
              <span>{i.quantity}</span>
              <button
                aria-label={`Increase ${i.name}`}
                disabled={disabled || i.quantity >= 100}
                onClick={() => changeQty(i.id, 1)}
              >
                <LuPlus />
              </button>
            </div>
          </div>
          <div>
            <b>{money(i.price * i.quantity)}</b>
            <button
              className="eh-icon-button"
              disabled={disabled}
              aria-label={`Remove ${i.name}`}
              onClick={() => changeQty(i.id, -i.quantity)}
            >
              <LuTrash2 />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
