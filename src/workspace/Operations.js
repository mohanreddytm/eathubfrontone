import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LuArrowUpRight,
  LuArrowRight,
  LuClock,
  LuPlus,
  LuSend,
  LuCircleCheck,
  LuChefHat,
} from "react-icons/lu";
import { useWorkspace } from "./Workspace";
import { request } from "../utils/api";
import {
  money,
  total,
  date,
  list,
  itemName,
  terminal,
  PageHeading,
  Status,
  Empty,
  Notice,
  Search,
  Confirm,
  FormDialog,
} from "./common";

export function Overview() {
  const w = useWorkspace(),
    active = w.orders.filter((o) => !terminal(o));
  const [availabilityBusy, setAvailabilityBusy] = useState(false),
    [availabilityError, setAvailabilityError] = useState("");
  async function changeAvailability(status) {
    setAvailabilityBusy(true);
    setAvailabilityError("");
    try {
      await w.change(`/updateWaiterStatus/${w.user.userId}`, "PUT", { status });
    } catch (e) {
      setAvailabilityError(e.message);
    } finally {
      setAvailabilityBusy(false);
    }
  }
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const todayOrders = w.orders.filter(
    (o) =>
      new Date(o.created_at).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }) === today,
  );
  const revenue = w.payments
    .filter(
      (p) =>
        ["Paid", "SUCCESS"].includes(p.payment_status) &&
        new Date(p.created_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }) === today,
    )
    .reduce((s, p) => s + Number(p.amount), 0);
  const stats =
    w.role === "kot"
      ? [
          [
            "In the queue",
            active.filter((o) => ["Pending", "Confirmed"].includes(o.status))
              .length,
            "Ready to start",
          ],
          [
            "Preparing",
            active.filter((o) => o.status === "Preparing").length,
            "On the stove",
          ],
          [
            "Ready",
            active.filter((o) => o.status === "Ready").length,
            "Waiting for service",
          ],
        ]
      : [
          ["Collected today", money(revenue), "Confirmed payments"],
          ["Orders today", todayOrders.length, "Across your shift"],
          ["Active orders", active.length, "In progress right now"],
          ["Service requests", w.requests.length, "Waiting for your team"],
        ];
  return (
    <>
      <PageHeading
        title={
          w.role === "admin"
            ? "A good day starts here."
            : w.role === "waiter"
              ? "Your floor, at a glance."
              : "Let’s get cooking."
        }
        eyebrow="LIVE OPERATIONS"
        action={
          <Link
            className="eh-button"
            to={`${w.base}/${w.role === "kot" ? "kitchen" : "pos"}`}
          >
            <LuPlus />
            {w.role === "kot" ? "Open kitchen" : "New order"}
          </Link>
        }
      >
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}{" "}
        · {w.restaurant.branchname}
      </PageHeading>
      {w.role === "waiter" && (
        <div className="eh-toolbar">
          <label>
            My availability{" "}
            <select
              aria-label="My availability"
              disabled={availabilityBusy}
              value={
                w.staff.find((s) => s.id === w.user.userId)?.status === "active"
                  ? "available"
                  : w.staff.find((s) => s.id === w.user.userId)?.status ||
                    "available"
              }
              onChange={(e) => changeAvailability(e.target.value)}
            >
              <option value="available">Available for requests</option>
              <option value="serving">Serving tables</option>
              <option value="busy">Busy / on break</option>
            </select>
          </label>
          <p className="eh-muted">
            Busy pauses new assignments. Your existing orders stay with you.
          </p>
        </div>
      )}
      {availabilityError && <Notice error>{availabilityError}</Notice>}
      <div className="eh-stats">
        {stats.map(([label, value, detail]) => (
          <article className="eh-stat" key={label}>
            <div>
              {label}
              <LuArrowUpRight />
            </div>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      <div className="eh-overview-grid">
        <section className="eh-card">
          <div className="eh-card-heading">
            <div>
              <h2>Orders in motion</h2>
              <p>The latest activity from your restaurant.</p>
            </div>
            <Link to={`${w.base}/${w.role === "kot" ? "kitchen" : "orders"}`}>
              View all <LuArrowRight />
            </Link>
          </div>
          <OrderTable orders={active.slice(0, 7)} />
        </section>
        <section className="eh-card eh-shift-card">
          <div className="eh-eyebrow">SHIFT SNAPSHOT</div>
          <h2>
            A little clarity.
            <br />A smoother service.
          </h2>
          <div className="eh-shift-line">
            <span>Ready to serve</span>
            <b>{active.filter((o) => o.status === "Ready").length}</b>
          </div>
          <div className="eh-shift-line">
            <span>Tables in use</span>
            <b>
              {new Set(active.map((o) => o.table_id).filter(Boolean)).size} /{" "}
              {w.tables.length}
            </b>
          </div>
          <div className="eh-shift-line">
            <span>Available menu items</span>
            <b>
              {w.menu.filter((i) => /yes|true/i.test(i.availability)).length}
            </b>
          </div>
          <p className="eh-muted">
            Updates automatically while this page is open.
          </p>
        </section>
      </div>
    </>
  );
}
export function OrderTable({ orders }) {
  const w = useWorkspace();
  if (!orders.length)
    return (
      <Empty title="No orders to show">New orders will appear here.</Empty>
    );
  return (
    <div className="eh-table-scroll">
      <table className="eh-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Table / guest</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link
                  className="eh-order-link"
                  to={`${w.base}/${w.role === "kot" ? "kitchen" : `pos/${o.id}`}`}
                >
                  #{o.order_number || o.id.slice(0, 8)}
                </Link>
                <small>
                  {list(o.items).reduce((s, i) => s + Number(i.quantity), 0)}{" "}
                  items
                </small>
              </td>
              <td>
                {o.table_name || "Walk-in"}
                <small>{o.customer_name || "Guest"}</small>
              </td>
              <td>
                <Status>{o.status}</Status>
                {o.refund_status &&
                  !["None", "Refunded"].includes(o.refund_status) && (
                    <small>
                      {o.refund_status === "Pending"
                        ? "Refund pending"
                        : o.refund_status}
                    </small>
                  )}
              </td>
              <td className="eh-amount">{money(total(o))}</td>
              <td>{date(o.created_at)}</td>
              <td>
                <Link
                  className="eh-icon-button"
                  aria-label={`Open order ${o.order_number}`}
                  to={`${w.base}/${w.role === "kot" ? "kitchen" : `pos/${o.id}`}`}
                >
                  <LuArrowUpRight />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function OrdersPage() {
  const w = useWorkspace();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "",
    status = params.get("status") || "All";
  const update = (k, v) => {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    setParams(p, { replace: true });
  };
  const orders = w.orders.filter(
    (o) =>
      (status === "All" ||
        (status === "Active" ? !terminal(o) : o.status === status)) &&
      `${o.order_number} ${o.table_name || "Walk-in"} ${o.customer_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title={w.role === "waiter" ? "My orders" : "Orders"}
        action={
          <Link className="eh-button" to={`${w.base}/pos`}>
            <LuPlus />
            New order
          </Link>
        }
      >
        Every ticket, from the first item to the final bill.
      </PageHeading>
      <div className="eh-toolbar">
        <div className="eh-tabs">
          {[
            "All",
            "Active",
            "Pending",
            "Preparing",
            "Ready",
            "Completed",
            "Refunded",
            "Cancelled",
          ].map((s) => (
            <button
              key={s}
              className={s === status ? "active" : ""}
              onClick={() => update("status", s)}
            >
              {s}
            </button>
          ))}
        </div>
        <Search
          value={search}
          onChange={(v) => update("q", v)}
          placeholder="Search order, table or guest"
        />
      </div>
      <section className="eh-card">
        <OrderTable orders={orders} />
      </section>
    </>
  );
}
export function KitchenPage() {
  const w = useWorkspace();
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [search, setSearch] = useState("");
  const orders = w.orders.filter(
    (o) =>
      !terminal(o) &&
      `${o.order_number} ${o.table_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function move(o, status) {
    if (busy) return;
    setBusy(o.id);
    setError("");
    try {
      await w.change(`/updateOrderStatus/${o.id}`, "PATCH", {
        order_status: status,
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
        title="Kitchen board"
        eyebrow="FRESH TICKETS, CLEAR PRIORITIES"
        action={
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Find a ticket"
          />
        }
      >
        Oldest tickets first. Extra KOT items appear as a fresh batch.
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      <div className="eh-kitchen-board">
        {[
          ["Queued", ["Pending", "Confirmed"], "Preparing", "Start preparing"],
          ["Preparing", ["Preparing"], "Ready", "Mark ready"],
          ["Ready to serve", ["Ready"], null, null],
        ].map(([name, statuses, next, label]) => {
          const rows = orders
            .filter((o) => statuses.includes(o.status))
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          return (
            <section className="eh-kitchen-column" key={name}>
              <div className="eh-column-heading">
                <h2>{name}</h2>
                <span>{rows.length}</span>
              </div>
              {!rows.length && (
                <div className="eh-kitchen-empty">
                  <LuChefHat />
                  <p>No tickets here</p>
                </div>
              )}
              {rows.map((o) => (
                <article className="eh-ticket" key={o.id}>
                  <header>
                    <div>
                      <h3>#{o.order_number}</h3>
                      <span>{o.table_name || "Walk-in"}</span>
                    </div>
                    <span className="eh-ticket-time">
                      <LuClock />
                      {Math.max(
                        0,
                        Math.floor(
                          (Date.now() - new Date(o.created_at)) / 60000,
                        ),
                      )}
                      m
                    </span>
                  </header>
                  <ul>
                    {list(o.kot_items || o.items).map((i, n) => (
                      <li key={n}>
                        <b>{i.quantity}×</b>
                        <span>{itemName(i)}</span>
                      </li>
                    ))}
                  </ul>
                  {o.note && (
                    <div className="eh-ticket-note">Note: {o.note}</div>
                  )}
                  {next ? (
                    <button
                      className="eh-button"
                      disabled={!!busy}
                      onClick={() => move(o, next)}
                    >
                      {busy === o.id ? "Updating…" : label}
                      <LuArrowRight />
                    </button>
                  ) : (
                    <p className="eh-ready-label">
                      <LuCircleCheck />
                      Ready for the floor team
                    </p>
                  )}
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
export function RequestsPage() {
  const w = useWorkspace();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [assign, setAssign] = useState(null),
    [call, setCall] = useState(false);
  async function act(path, body) {
    setBusy(path);
    try {
      await w.change(path, "PUT", body);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageHeading
        title="Service requests"
        action={
          w.role === "admin" && (
            <button className="eh-button" onClick={() => setCall(true)}>
              Call a waiter
            </button>
          )
        }
      >
        Keep the floor team and your guests connected.
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      <div className="eh-request-grid">
        {w.requests.map((r) => (
          <article className="eh-card eh-request" key={r.id}>
            <div className="eh-card-heading">
              <h2>{r.table_name || "Table request"}</h2>
              <Status>{r.status}</Status>
            </div>
            <h3>{r.request_type}</h3>
            <p>{r.notes || "A guest would like some help."}</p>
            <small>
              {date(r.created_at)} ·{" "}
              {w.staff.find((s) => s.id === r.assigned_waiter_id)?.name ||
                "Unassigned"}
            </small>
            <div className="eh-row-actions">
              {w.role === "admin" && (
                <button
                  className="eh-button eh-secondary"
                  onClick={() => setAssign(r)}
                >
                  Assign waiter
                </button>
              )}
              <button
                className="eh-button"
                disabled={!!busy}
                onClick={() => act(`/completeWaiterRequest/${r.id}`, {})}
              >
                Complete request
              </button>
            </div>
          </article>
        ))}
      </div>
      {!w.requests.length && (
        <Empty title="All caught up">
          There are no pending guest requests.
        </Empty>
      )}
      {w.calls.length > 0 && (
        <section className="eh-card">
          <div className="eh-card-heading">
            <h2>Counter calls</h2>
          </div>
          {w.calls.map((c) => (
            <div className="eh-call" key={c.id}>
              <div>
                <strong>{c.waiter_name || "Team member"}</strong>
                <p>{c.message}</p>
              </div>
              {w.role === "waiter" && (
                <button
                  className="eh-button"
                  disabled={!!busy}
                  onClick={() =>
                    act(`/updateAdminCallStatus/${c.id}`, {
                      status: "answered",
                    })
                  }
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </section>
      )}
      {assign && (
        <FormDialog
          title="Assign request"
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
          onClose={() => setAssign(null)}
          onSave={(b) =>
            w.change(`/assignWaiterToRequest/${assign.id}`, "PUT", b)
          }
        />
      )}{" "}
      {call && (
        <FormDialog
          title="Call a waiter"
          fields={[
            {
              name: "waiter_id",
              label: "Waiter",
              type: "select",
              options: w.staff
                .filter((s) => /waiter/i.test(s.role))
                .map((s) => ({ value: s.id, label: s.name })),
            },
            { name: "message", label: "Message", type: "textarea" },
          ]}
          initial={{ message: "Please come to the counter." }}
          onClose={() => setCall(false)}
          onSave={(b) =>
            w.change("/createAdminCall", "POST", {
              ...b,
              id: crypto.randomUUID(),
              restaurant_id: w.restaurantId,
              waiter_name: w.staff.find((s) => s.id === b.waiter_id)?.name,
              admin_id: w.user.userId,
            })
          }
        />
      )}
    </>
  );
}
export function PaymentsPage() {
  const w = useWorkspace();
  const [status, setStatus] = useState("All"),
    [confirm, setConfirm] = useState(null),
    [search, setSearch] = useState("");
  const paid = (p) => ["Paid", "SUCCESS"].includes(p.payment_status);
  const rows = w.payments.filter(
    (p) =>
      (status === "All" ||
        (status === "Paid"
          ? paid(p)
          : status === "Pending"
            ? ["Pending", "INITIATED", "PENDING_CONFIRMATION"].includes(
                p.payment_status,
              )
            : ["Failed", "FAILED"].includes(p.payment_status))) &&
      `${p.order_number} ${p.table_name} ${p.transaction_id || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading title="Payments">
        A clear record of what was collected and what still needs verification.
      </PageHeading>
      <div className="eh-stats">
        <article className="eh-stat">
          <div>Total collected</div>
          <strong>
            {money(
              w.payments.filter(paid).reduce((s, p) => s + Number(p.amount), 0),
            )}
          </strong>
          <small>All recorded confirmed receipts</small>
        </article>
        <article className="eh-stat">
          <div>Refunded</div>
          <strong>
            {money(
              w.payments.reduce(
                (s, p) => s + Number(p.refunded_amount || 0),
                0,
              ),
            )}
          </strong>
          <small>Processed refunds only</small>
        </article>
        <article className="eh-stat">
          <div>Net collected</div>
          <strong>
            {money(
              w.payments
                .filter(paid)
                .reduce(
                  (s, p) =>
                    s + Number(p.amount) - Number(p.refunded_amount || 0),
                  0,
                ),
            )}
          </strong>
          <small>Confirmed receipts less processed refunds</small>
        </article>
        <article className="eh-stat">
          <div>Awaiting confirmation</div>
          <strong>
            {
              w.payments.filter((p) =>
                ["Pending", "INITIATED", "PENDING_CONFIRMATION"].includes(
                  p.payment_status,
                ),
              ).length
            }
          </strong>
          <small>Verify receipt before confirming</small>
        </article>
      </div>
      <div className="eh-toolbar">
        <div className="eh-tabs">
          {["All", "Pending", "Paid", "Failed"].map((s) => (
            <button
              className={s === status ? "active" : ""}
              key={s}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Search payment or order"
        />
      </div>
      <section className="eh-card">
        <div className="eh-table-scroll">
          <table className="eh-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`${w.base}/pos/${p.order_id}`}>
                      #{p.order_number}
                    </Link>
                    <small>{p.table_name || "Walk-in"}</small>
                  </td>
                  <td>{p.payment_method}</td>
                  <td className="eh-amount">
                    {money(p.amount)}
                    {Number(p.refunded_amount) > 0 && (
                      <small>Refunded {money(p.refunded_amount)}</small>
                    )}
                  </td>
                  <td>
                    <Status>{p.payment_status}</Status>
                  </td>
                  <td>{date(p.created_at)}</td>
                  <td>
                    {["Pending", "INITIATED", "PENDING_CONFIRMATION"].includes(
                      p.payment_status,
                    ) &&
                      !p.provider_order_id && (
                        <div className="eh-row-actions">
                          <button
                            className="eh-button eh-small"
                            onClick={() => setConfirm({ p, status: "Paid" })}
                          >
                            Confirm receipt
                          </button>
                          <button
                            className="eh-text-button"
                            onClick={() => setConfirm({ p, status: "Failed" })}
                          >
                            Mark failed
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <Empty title="No payments found">
            Payments appear when a bill is collected or a guest requests
            payment.
          </Empty>
        )}
      </section>
      {confirm && (
        <Confirm
          title={
            confirm.status === "Paid"
              ? "Confirm payment received?"
              : "Mark this payment as failed?"
          }
          onClose={() => setConfirm(null)}
          onConfirm={() =>
            w.change(`/updatePaymentStatus/${confirm.p.id}`, "PUT", {
              payment_status: confirm.status,
            })
          }
        >
          {confirm.status === "Paid"
            ? `Confirm only after you have received ${money(confirm.p.amount)} through ${confirm.p.payment_method}. This completes the order.`
            : "This cancels the pending payment request and allows the bill to be edited again."}
        </Confirm>
      )}
    </>
  );
}
export function MessagesPage() {
  const w = useWorkspace();
  const [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    async function load() {
      try {
        const d = await request(
          `/restaurant_messages/${w.restaurantId}`,
          "GET",
          undefined,
          { signal: c.signal },
        );
        setMessages(d.messages.reverse());
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      }
    }
    load();
    const t = setInterval(load, 10000);
    return () => {
      c.abort();
      clearInterval(t);
    };
  }, [w.restaurantId]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await request("/restaurant_messages", "POST", {
        id: crypto.randomUUID(),
        restaurant_id: w.restaurantId,
        message: text.trim(),
      });
      const d = await request(`/restaurant_messages/${w.restaurantId}`);
      setMessages(d.messages.reverse());
      setText("");
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading title="Team messages">
        A shared conversation for restaurant admins and the floor team.
      </PageHeading>
      <section className="eh-card eh-chat">
        {error && <Notice error>{error}</Notice>}
        <div className="eh-chat-messages">
          {!messages.length && (
            <Empty title="Start the conversation">
              Share a shift update with your team.
            </Empty>
          )}
          {messages.map((m) => (
            <article
              className={`eh-chat-message ${m.sender_id === w.user.userId ? "eh-chat-own" : ""}`}
              key={m.id}
            >
              <small>
                {m.sender_name || m.sender_role} · {date(m.created_at)}
              </small>
              <p>{m.message}</p>
            </article>
          ))}
        </div>
        <form className="eh-chat-compose" onSubmit={send}>
          <input
            aria-label="Message to team"
            placeholder="Write a message to your team…"
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="eh-button" disabled={busy || !text.trim()}>
            <LuSend />
            Send
          </button>
        </form>
      </section>
    </>
  );
}
