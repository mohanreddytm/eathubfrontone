import React, { useEffect, useState, useRef } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  LuUtensils,
  LuShoppingBag,
  LuClipboardList,
  LuUser,
  LuBell,
  LuHeart,
  LuArrowLeft,
  LuPlus,
  LuArrowRight,
} from "react-icons/lu";
import { request } from "../utils/api";
import Refunds from "./Refunds";
import {
  Search,
  Status,
  Empty,
  Notice,
  FoodImage,
  PageHeading,
  money,
  total,
  list,
  itemName,
  date,
  available,
  FormDialog,
} from "./common";
import { CartLines } from "./POS";
import Checkout from "./Checkout";
import "./workspace.css";
import "./guest.css";
export default function Guest() {
  const { tableId, restaurantId } = useParams();
  return (
    <GuestSession
      key={`${restaurantId}:${tableId}`}
      {...{ tableId, restaurantId }}
    />
  );
}
function GuestSession({ tableId, restaurantId }) {
  const base = `/customerDashboard/${tableId}/${restaurantId}`,
    navigate = useNavigate(),
    key = `eathub-guest-cart:${restaurantId}:${tableId}`;
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [orders, setOrders] = useState([]),
    [calls, setCalls] = useState([]),
    [call, setCall] = useState(false),
    [cart, setCart] = useState(() => {
      try {
        return JSON.parse(sessionStorage.getItem(key)) || [];
      } catch {
        return [];
      }
    }),
    [profile, setProfile] = useState(() => {
      try {
        return JSON.parse(sessionStorage.getItem("eathub-guest-profile")) || {};
      } catch {
        return {};
      }
    });
  const [favourites, setFavourites] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(`eathub-favourites:${restaurantId}`)) ||
        []
      );
    } catch {
      return [];
    }
  });
  const load = async (signal) => {
    try {
      const [r, m, t] = await Promise.all([
        request(`/restaurant/${restaurantId}`, "GET", undefined, { signal }),
        request(`/getMenuItems/${restaurantId}`, "GET", undefined, { signal }),
        request(`/getTableName/${tableId}`, "GET", undefined, { signal }),
      ]);
      setData({ restaurant: r[0], menu: m, table: t[0] });
      setError("");
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    }
  };
  async function refresh(signal) {
    try {
      const [o, c] = await Promise.all([
        request(`/getOrdersByTable/${tableId}`, "GET", undefined, { signal }),
        request("/guest/requests", "GET", undefined, { signal }),
      ]);
      setOrders(o.orders);
      setCalls(c.requests);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message);
    }
  }
  useEffect(() => {
    const c = new AbortController();
    load(c.signal);
    refresh(c.signal);
    const timer = setInterval(() => {
      if (!document.hidden) refresh(c.signal);
    }, 15000);
    return () => {
      c.abort();
      clearInterval(timer);
    };
  }, [tableId, restaurantId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(cart));
  }, [key, cart]);
  useEffect(() => {
    sessionStorage.setItem("eathub-guest-profile", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem(
      `eathub-favourites:${restaurantId}`,
      JSON.stringify(favourites),
    );
  }, [favourites, restaurantId]);
  const qty = cart.reduce((s, i) => s + i.quantity, 0),
    changeQty = (id, delta) =>
      setCart((old) =>
        old
          .map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(100, i.quantity + delta) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      );
  const add = (i) =>
    cart.some((c) => c.id === i.id)
      ? changeQty(i.id, 1)
      : setCart([
          ...cart,
          { id: i.id, name: i.item_name, price: Number(i.price), quantity: 1 },
        ]);
  const values = {
    data,
    orders,
    cart,
    setCart,
    changeQty,
    profile,
    setProfile,
    base,
    tableId,
    restaurantId,
    refresh,
    navigate,
  };
  return (
    <div className="eh-app eh-guest">
      <header className="eh-guest-header">
        <Link to={`${base}/home`} className="eh-guest-brand">
          <span className="eh-brand-icon">
            <LuUtensils />
          </span>
          <div>
            <strong>{data?.restaurant?.restaurentname || "EatHub"}</strong>
            <small>{data?.table?.name || "Your table"} · Dine in</small>
          </div>
        </Link>
        <button
          className="eh-button eh-secondary eh-small"
          onClick={() => setCall(true)}
        >
          <LuBell />
          {calls.length ? "Request sent" : "Call waiter"}
        </button>
      </header>
      <main className="eh-guest-content">
        {error && (
          <Notice
            error
            onRetry={() => {
              load();
              refresh();
            }}
          >
            {error}
          </Notice>
        )}
        {!data ? (
          <div className="eh-loading" role="status">
            {error ? "Your table menu could not load." : "Preparing your menu…"}
          </div>
        ) : (
          <Routes>
            <Route index element={<Navigate to="home" replace />} />
            {["home", "filter", "loved", "favourites"].map((path) => (
              <Route
                key={path}
                path={path}
                element={
                  <GuestMenu
                    data={data}
                    add={add}
                    cart={cart}
                    base={base}
                    favourites={favourites}
                    setFavourites={setFavourites}
                    onlyFavourites={["loved", "favourites"].includes(path)}
                  />
                }
              />
            ))}
            <Route path="cart" element={<GuestCart {...values} />} />
            <Route path="orders" element={<GuestOrders {...values} />} />
            <Route
              path="orders/:orderId"
              element={<GuestOrder {...values} />}
            />
            <Route
              path="orderDetails"
              element={<Navigate to={`${base}/orders`} replace />}
            />
            <Route path="profile" element={<GuestProfile {...values} />} />
            <Route
              path="*"
              element={<Navigate to={`${base}/home`} replace />}
            />
          </Routes>
        )}
      </main>
      <nav className="eh-guest-nav" aria-label="Guest navigation">
        {[
          ["home", "Menu", LuUtensils],
          ["favourites", "Favourites", LuHeart],
          ["orders", "Orders", LuClipboardList],
          ["cart", "Cart", LuShoppingBag],
          ["profile", "Profile", LuUser],
        ].map(([p, label, Icon]) => (
          <NavLink key={p} to={`${base}/${p}`}>
            <span>
              <Icon />
              {p === "cart" && qty > 0 && <b>{qty}</b>}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      {call && (
        <FormDialog
          title="How can we help?"
          fields={[
            {
              name: "request_type",
              label: "Request",
              type: "select",
              options: [
                { value: "assistance", label: "I need some help" },
                { value: "order", label: "Help with my order" },
                { value: "bill", label: "Bring the bill" },
                { value: "other", label: "Something else" },
              ],
            },
            {
              name: "notes",
              label: "A note for your waiter",
              type: "textarea",
              required: false,
            },
          ]}
          initial={{ request_type: "assistance" }}
          submit="Send request"
          onClose={() => setCall(false)}
          onSave={async (b) => {
            if (calls.some((c) => c.request_type === b.request_type))
              throw new Error(
                "A waiter is already on the way for this request.",
              );
            await request("/createWaiterRequest", "POST", {
              ...b,
              id: crypto.randomUUID(),
              restaurant_id: restaurantId,
              table_id: tableId,
              table_name: data?.table?.name,
              customer_name: profile.name || "Guest",
            });
            await refresh();
          }}
        />
      )}
    </div>
  );
}
function GuestMenu({
  data,
  add,
  cart,
  base,
  favourites,
  setFavourites,
  onlyFavourites,
}) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("");
  const categories = [...new Set(data.menu.map((i) => i.category_name))];
  const rows = data.menu.filter(
    (i) =>
      (!category || i.category_name === category) &&
      (!onlyFavourites || favourites.includes(i.id)) &&
      i.item_name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <section className="eh-guest-hero">
        <div>
          <div className="eh-eyebrow">FRESHLY MADE. HAPPILY SHARED.</div>
          <h1>
            {onlyFavourites
              ? "A few favourites."
              : "Something delicious awaits."}
          </h1>
          <p>
            Explore the menu. Find your favourite. We’ll take care of the rest.
          </p>
        </div>
        <div className="eh-hero-mark">
          <LuUtensils />
        </div>
      </section>
      <div className="eh-guest-menu-tools">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="What are you craving?"
        />
        <div className="eh-tabs">
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory("")}
          >
            All dishes
          </button>
          {categories.map((c) => (
            <button
              className={category === c ? "active" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="eh-guest-menu-grid">
        {rows.map((i) => (
          <article className="eh-menu-card" key={i.id}>
            <div className="eh-food-image">
              <FoodImage item={i} />
              <button
                className={`eh-favourite ${favourites.includes(i.id) ? "active" : ""}`}
                aria-label={`${favourites.includes(i.id) ? "Remove" : "Save"} ${i.item_name} favourite`}
                onClick={() =>
                  setFavourites(
                    favourites.includes(i.id)
                      ? favourites.filter((id) => id !== i.id)
                      : [...favourites, i.id],
                  )
                }
              >
                <LuHeart />
              </button>
              <span className="eh-diet">{i.item_category}</span>
            </div>
            <div className="eh-menu-info">
              <small>
                {i.category_name} · {i.preparation_time} min
              </small>
              <h3>{i.item_name}</h3>
              <p>{i.item_dec}</p>
              <div className="eh-menu-price">
                <strong>{money(i.price)}</strong>
                <button
                  className="eh-button eh-secondary eh-small"
                  disabled={!available(i)}
                  onClick={() => add(i)}
                >
                  {available(i) ? (
                    <>
                      <LuPlus />
                      Add
                      {cart.find((c) => c.id === i.id)
                        ? ` (${cart.find((c) => c.id === i.id).quantity})`
                        : ""}
                    </>
                  ) : (
                    "Unavailable"
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <Empty
          title={onlyFavourites ? "Save your favourites" : "No dishes found"}
        >
          {onlyFavourites
            ? "Tap the heart on any dish to find it here."
            : "Try another search or category."}
        </Empty>
      )}
      {cart.length > 0 && (
        <Link className="eh-guest-cart-bar" to={`${base}/cart`}>
          <span>
            {cart.reduce((s, i) => s + i.quantity, 0)} items ·{" "}
            {money(cart.reduce((s, i) => s + i.price * i.quantity, 0))}
          </span>
          View cart <LuArrowRight />
        </Link>
      )}
    </>
  );
}
function GuestCart({
  data,
  cart,
  setCart,
  changeQty,
  profile,
  base,
  restaurantId,
  tableId,
  refresh,
  navigate,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  const guard = useRef(false);
  const requestKey = `eathub-guest-attempt:${restaurantId}:${tableId}`;
  const id = useRef(sessionStorage.getItem(requestKey) || crypto.randomUUID());
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  async function submit() {
    if (guard.current) return;
    guard.current = true;
    setBusy(true);
    sessionStorage.setItem(requestKey, id.current);
    try {
      const d = await request("/addNewOrder", "POST", {
        id: id.current,
        restaurant_id: restaurantId,
        table_id: tableId,
        customer_name: profile.name || "Guest",
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
        note,
      });
      setCart([]);
      sessionStorage.removeItem(requestKey);
      await refresh();
      navigate(`${base}/orders/${d.order.id}`, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      guard.current = false;
    }
  }
  return (
    <div className="eh-guest-narrow">
      <PageHeading
        title="Your cart"
        action={<Link to={`${base}/home`}>Add more dishes</Link>}
      />
      <section className="eh-card eh-cart">
        {cart.length ? (
          <>
            <CartLines items={cart} changeQty={changeQty} disabled={busy} />
            <label>
              Anything the kitchen should know?
              <textarea
                placeholder="Allergies or special requests…"
                maxLength={1000}
                value={note}
                disabled={busy}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <div className="eh-bill-summary">
              <div className="eh-grand-total">
                <span>Item subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="eh-muted">
                Applicable restaurant tax is calculated on your saved bill. Pay
                after placing your order.
              </p>
            </div>
            {error && <Notice error>{error} Your cart has been kept.</Notice>}
            <button
              className="eh-button eh-submit-order"
              disabled={busy}
              onClick={submit}
            >
              {busy ? "Placing order…" : "Place order"}
              <LuArrowRight />
            </button>
          </>
        ) : (
          <Empty title="A little empty here">
            Add something delicious from the menu.
            <Link className="eh-button" to={`${base}/home`}>
              Explore the menu
            </Link>
          </Empty>
        )}
      </section>
    </div>
  );
}
function GuestOrders({ orders, base }) {
  return (
    <>
      <PageHeading title="Your orders">
        Follow each dish from the kitchen to your table.
      </PageHeading>
      <div className="eh-guest-orders">
        {orders.map((o) => (
          <Link
            className="eh-card eh-guest-order-card"
            key={o.id}
            to={`${base}/orders/${o.id}`}
          >
            <div className="eh-card-heading">
              <h2>#{o.order_number}</h2>
              <Status>{o.status}</Status>
              {o.refund_status &&
                !["None", "Refunded"].includes(o.refund_status) && (
                  <Status>
                    {o.refund_status === "Pending"
                      ? "Refund pending"
                      : o.refund_status}
                  </Status>
                )}
            </div>
            <p>{list(o.items).map(itemName).join(" · ")}</p>
            <div>
              <small>{date(o.created_at)}</small>
              <strong>
                {money(total(o))}
                <LuArrowRight />
              </strong>
            </div>
          </Link>
        ))}
      </div>
      {!orders.length && (
        <Empty title="Your first order awaits">
          Orders placed in this table session will appear here.
          <Link className="eh-button" to={`${base}/home`}>
            Explore the menu
          </Link>
        </Empty>
      )}
    </>
  );
}
function GuestOrder({ base, refresh }) {
  const { orderId } = useParams();
  const [bill, setBill] = useState(null),
    [error, setError] = useState(""),
    [method, setMethod] = useState("Cash"),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      try {
        const d = await request(`/generateBill/${orderId}`, "GET", undefined, {
          signal: c.signal,
        });
        setBill(d.bill);
        setError("");
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      c.abort();
      clearInterval(t);
    };
  }, [orderId]);
  if (!bill)
    return (
      <div className="eh-guest-narrow">
        {error ? (
          <Notice error>{error}</Notice>
        ) : (
          <p role="status">Loading your order…</p>
        )}
        <Link to={`${base}/orders`}>Back to orders</Link>
      </div>
    );
  async function pay() {
    setBusy(true);
    try {
      const d = await request("/createPayment", "POST", {
        order_id: orderId,
        payment_method: method,
      });
      setNotice(
        ["Paid", "SUCCESS"].includes(d.payment.payment_status)
          ? "Payment received. Thank you!"
          : `Your ${d.payment.payment_method} payment request has been sent. A team member will confirm receipt.`,
      );
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="eh-guest-narrow">
      <Link className="eh-text-button" to={`${base}/orders`}>
        <LuArrowLeft />
        Your orders
      </Link>
      <PageHeading
        title={`Order #${bill.order_number}`}
        action={<Status>{bill.status}</Status>}
      >
        {bill.table_name} · {date(bill.created_at)}
      </PageHeading>
      <section className="eh-card eh-cart">
        <div className="eh-order-progress">
          {["Pending", "Preparing", "Ready", "Completed"].map((s, n) => (
            <div
              key={s}
              className={
                n <=
                ({
                  Pending: 0,
                  Confirmed: 0,
                  Preparing: 1,
                  Ready: 2,
                  Completed: 3,
                  Refunded: 3,
                }[bill.status] ?? -1)
                  ? "active"
                  : ""
              }
            >
              <span>{n + 1}</span>
              <small>{s === "Pending" ? "Received" : s}</small>
            </div>
          ))}
        </div>
        <ul className="eh-guest-bill-items">
          {list(bill.items).map((i, n) => (
            <li key={n}>
              <span>
                {i.quantity}× {itemName(i)}
              </span>
              <b>{money(Number(i.price ?? i.cart_item_price) * i.quantity)}</b>
            </li>
          ))}
        </ul>
        {bill.note && (
          <p className="eh-ticket-note">Kitchen note: {bill.note}</p>
        )}
        <div className="eh-bill-summary">
          <div>
            <span>Subtotal</span>
            <b>{money(bill.subtotal)}</b>
          </div>
          <div>
            <span>Discount</span>
            <b>−{money(bill.discount)}</b>
          </div>
          <div>
            <span>Tax ({bill.tax_mode})</span>
            <b>{money(bill.tax)}</b>
          </div>
          <div className="eh-grand-total">
            <strong>Total</strong>
            <strong>{money(bill.total)}</strong>
          </div>
        </div>
        {error && <Notice error>{error}</Notice>}
        {notice && <Notice>{notice}</Notice>}
        {bill.status === "Refunded" ? (
          <Notice>
            This order has been fully refunded. See the refund details below.
          </Notice>
        ) : bill.status === "Completed" ? (
          <Notice>Payment received. Thank you for dining with us.</Notice>
        ) : bill.status === "Cancelled" ? (
          <Notice>
            This order was cancelled. Please ask your waiter if you need help.
          </Notice>
        ) : ["Paid", "SUCCESS"].includes(bill.payment_status) ? (
          <Notice>
            Payment received. Your order is still with the kitchen and service
            team.
          </Notice>
        ) : (
          <>
            <label>
              Payment method
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>Cash</option>
                <option>UPI</option>
              </select>
            </label>
            <p className="eh-muted">
              Pay at your table or the counter. Your waiter will verify the
              payment.
            </p>
            <button
              className="eh-button eh-submit-order"
              disabled={busy}
              onClick={pay}
            >
              {busy ? "Sending…" : "Ask to pay"}
              <LuArrowRight />
            </button>
          </>
        )}
        {!["Completed", "Cancelled", "Refunded"].includes(bill.status) && (
          <Checkout
            restaurantId={bill.restaurant_id}
            orderId={orderId}
            onPaid={async () => {
              const d = await request(`/generateBill/${orderId}`);
              setBill(d.bill);
              await refresh();
            }}
          />
        )}
        {["Completed", "Refunded"].includes(bill.status) &&
          ["Paid", "SUCCESS"].includes(bill.payment_status) && (
            <Refunds key={orderId} orderId={orderId} />
          )}
      </section>
    </div>
  );
}
function GuestProfile({ profile, setProfile, data }) {
  const [notice, setNotice] = useState(false);
  return (
    <div className="eh-guest-narrow">
      <PageHeading title="Your table profile">
        Add a name so your waiter knows who to ask for.
      </PageHeading>
      <form
        className="eh-card eh-settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          setNotice(true);
        }}
      >
        <h2>{data.table.name}</h2>
        <label>
          Your name
          <input
            maxLength={100}
            value={profile.name || ""}
            onChange={(e) => {
              setProfile({ ...profile, name: e.target.value });
              setNotice(false);
            }}
          />
        </label>
        <p className="eh-muted">
          Your table session and orders are kept in this browser tab.
        </p>
        <button className="eh-button">Save profile</button>
        {notice && <Notice>Profile saved for this visit.</Notice>}
      </form>
    </div>
  );
}
export function PublicTables() {
  const { restaurantId } = useParams();
  const [tables, setTables] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      try {
        const d = await request(
          `/public/tables/${restaurantId}`,
          "GET",
          undefined,
          { signal: c.signal },
        );
        setTables(d.tables);
        setError("");
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        if (!c.signal.aborted) setLoading(false);
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => {
      c.abort();
      clearInterval(t);
    };
  }, [restaurantId]);
  return (
    <div className="eh-app eh-public-tables">
      <div className="eh-guest-content">
        <PageHeading title="Find your table" eyebrow="WELCOME TO EATHUB">
          Choose the table where your host has seated you, then explore the
          menu.
        </PageHeading>
        {error && <Notice error>{error}</Notice>}
        {loading ? (
          <p role="status">Checking tables…</p>
        ) : (
          <div className="eh-tables-grid">
            {tables.map((t) => (
              <article className="eh-table-card" key={t.id}>
                <div className="eh-card-heading">
                  <h2>{t.name}</h2>
                  <Status>{t.current_status}</Status>
                </div>
                <div className="eh-table-illustration">
                  <span>{t.name}</span>
                </div>
                <p>{t.seat_capacity} seats</p>
                {["available", "occupied"].includes(t.current_status) ? (
                  <Link
                    className="eh-button"
                    to={`/customerDashboard/${t.id}/${restaurantId}/home`}
                  >
                    Open menu
                    <LuArrowRight />
                  </Link>
                ) : (
                  <p>Please ask your host for help.</p>
                )}
              </article>
            ))}
          </div>
        )}
        {!loading && !tables.length && !error && (
          <Empty title="No tables available">
            Please ask the restaurant team for assistance.
          </Empty>
        )}
        <p className="eh-muted">Table availability refreshes every minute.</p>
      </div>
    </div>
  );
}
