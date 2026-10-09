import React, { useEffect, useState } from "react";
import apiFetch, { API_BASE_URL } from "../../../utils/api";
import "./order-actions.css";
import Checkout from "../../../workspace/Checkout";
import Refunds from "../../../workspace/Refunds";
export default function OrderActions({
  orderId,
  menuItems = [],
  onChanged,
  role,
}) {
  const [bill, setBill] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [panel, setPanel] = useState("");
  const [itemId, setItemId] = useState(""),
    [quantity, setQuantity] = useState(1),
    [discount, setDiscount] = useState(0),
    [discountType, setDiscountType] = useState("flat");
  const [tax, setTax] = useState(0),
    [taxMode, setTaxMode] = useState("exclusive"),
    [method, setMethod] = useState("Cash"),
    [received, setReceived] = useState(false),
    [payment, setPayment] = useState(null),
    [notice, setNotice] = useState("");
  async function request(path, verb = "GET", body) {
    const r = await apiFetch(`${API_BASE_URL}${path}`, {
      method: verb,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Request failed");
    return d;
  }
  async function refresh() {
    const d = await request(`/generateBill/${orderId}`);
    setBill(d.bill);
    return d.bill;
  }
  useEffect(() => {
    let active = true;
    request(`/generateBill/${orderId}`)
      .then((d) => {
        if (active) {
          setBill(d.bill);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    setBill(null);
    setError("");
    setPanel("");
    setPayment(null);
    setNotice("");
    return () => {
      active = false;
    };
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function mutate(path, verb, body, close = true) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const d = await request(path, verb, body);
      await refresh();
      onChanged?.();
      if (close) setPanel("");
      return d;
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const show = (p) => {
    setPanel(p);
    setError("");
    setNotice("");
    setReceived(false);
  };
  async function pay() {
    if (!received) return;
    const d = payment
      ? await mutate(
          `/updatePaymentStatus/${payment.id}`,
          "PUT",
          { payment_status: "Paid" },
          false,
        )
      : await mutate(
          "/createPayment",
          "POST",
          {
            order_id: bill.id,
            restaurant_id: bill.restaurant_id,
            payment_method: method,
            payment_status: "Paid",
          },
          false,
        );
    if (d?.payment) {
      setPayment(d.payment);
      setNotice(
        ["Paid", "SUCCESS"].includes(d.payment.payment_status)
          ? "Payment confirmed. Kitchen progress is tracked separately."
          : `A ${d.payment.payment_method} request is already pending. Verify its receipt, then confirm below.`,
      );
      setReceived(false);
    }
  }
  if (!bill) return <p role="status">{error || "Loading order…"}</p>;
  const items =
      typeof bill.items === "string" ? JSON.parse(bill.items) : bill.items,
    settled = ["Completed", "Cancelled", "Refunded"].includes(bill.status),
    paid = ["Paid", "SUCCESS"].includes(bill.payment_status),
    next = {
      Pending: "Confirmed",
      Confirmed: "Preparing",
      Preparing: "Ready",
      Ready: paid ? "Completed" : null,
    }[bill.status];
  return (
    <section className="order-actions">
      <h2>Order #{bill.order_number}</h2>
      <p>
        {bill.table_name || "Walk-in"} · {bill.status} ·{" "}
        {paid ? "Paid" : "Unpaid"}
      </p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, n) => (
            <tr key={`${i.id}-${n}`}>
              <td>
                {i.name ||
                  i.cart_item_name ||
                  i.item_name ||
                  "Item no longer on menu"}
              </td>
              <td>{i.quantity}</td>
              <td>₹{Number(i.price ?? i.cart_item_price).toFixed(2)}</td>
              <td>
                ₹
                {(Number(i.price ?? i.cart_item_price) * i.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Subtotal ₹{bill.subtotal.toFixed(2)} · Discount ₹
        {bill.discount.toFixed(2)} · Tax ₹{bill.tax.toFixed(2)} ({bill.tax_mode}
        )
      </p>
      <h3>Total ₹{bill.total.toFixed(2)}</h3>
      {error && <p role="alert">{error}</p>}
      <div className="order-action-buttons">
        {next && (
          <button
            disabled={busy}
            onClick={() => mutate(`/updateStatus/${orderId}/${next}`, "PUT")}
          >
            {next === "Completed"
              ? "Mark served & complete"
              : `Move to ${next}`}
          </button>
        )}
        <button disabled={settled || paid || busy} onClick={() => show("kot")}>
          New KOT
        </button>
        <button
          disabled={settled || paid || busy}
          onClick={() => show("discount")}
        >
          Add Discount
        </button>
        <button disabled={settled || paid || busy} onClick={() => show("tax")}>
          Tax Mode
        </button>
        <button onClick={() => show("bill")}>BILL</button>
        <button onClick={() => show("print")}>BILL &amp; PRINT</button>
        <button
          disabled={settled || paid || busy}
          onClick={() => show("payment")}
        >
          BILL &amp; PAYMENT
        </button>
        <button
          disabled={settled || paid || busy}
          onClick={() => show("cancel")}
        >
          Cancel Order
        </button>
      </div>
      {!settled && !paid && (
        <Checkout
          restaurantId={bill.restaurant_id}
          orderId={orderId}
          onPaid={async () => {
            await refresh();
            onChanged?.();
          }}
        />
      )}
      {paid && ["Completed", "Refunded"].includes(bill.status) && role && (
        <Refunds
          key={orderId}
          orderId={orderId}
          admin={role === "admin"}
          onChanged={async () => {
            await refresh();
            await onChanged?.();
          }}
        />
      )}
      {panel && (
        <div className="order-action-panel">
          <button onClick={() => setPanel("")}>Close</button>
          {panel === "kot" && (
            <>
              <h3>Add kitchen items</h3>
              <label>
                Item
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                >
                  <option value="">Choose item</option>
                  {menuItems
                    .filter((i) => i.availability === "Yes")
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.item_name} — ₹{i.price}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>
              <button
                disabled={busy || !itemId}
                onClick={() =>
                  mutate(`/addKOT/${orderId}`, "POST", {
                    items: [{ id: itemId, quantity }],
                  })
                }
              >
                Send to kitchen
              </button>
            </>
          )}
          {panel === "discount" && (
            <>
              <h3>Discount</h3>
              <select
                aria-label="Discount type"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="flat">Amount ₹</option>
                <option value="percent">Percentage</option>
              </select>
              <input
                aria-label="Discount value"
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <button
                disabled={busy}
                onClick={() =>
                  mutate(`/updateOrderDiscount/${orderId}`, "PATCH", {
                    discount_type: discountType,
                    discount_value: discount,
                  })
                }
              >
                Save discount
              </button>
            </>
          )}
          {panel === "tax" && (
            <>
              <h3>Tax</h3>
              <select
                aria-label="Tax mode"
                value={taxMode}
                onChange={(e) => setTaxMode(e.target.value)}
              >
                <option value="exclusive">Add tax to price</option>
                <option value="inclusive">Price includes tax</option>
              </select>
              <input
                aria-label="Tax percentage"
                type="number"
                min="0"
                max="100"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
              />
              <button
                disabled={busy}
                onClick={() =>
                  mutate(`/updateOrderTax/${orderId}`, "PATCH", {
                    tax_mode: taxMode,
                    tax_percent: tax,
                  })
                }
              >
                Save tax
              </button>
            </>
          )}
          {["bill", "print", "payment"].includes(panel) && (
            <div id="eathub-receipt">
              <h2>{bill.restaurant.restaurentname}</h2>
              <p>{bill.restaurant.branchaddress}</p>
              <p>
                Order #{bill.order_number} · {bill.table_name || "Walk-in"}
                <br />
                {new Date(bill.created_at).toLocaleString("en-IN")}
              </p>
              {items.map((i, n) => (
                <p key={n}>
                  {i.name ||
                    i.cart_item_name ||
                    i.item_name ||
                    "Item no longer on menu"}{" "}
                  × {i.quantity} — ₹
                  {(Number(i.price ?? i.cart_item_price) * i.quantity).toFixed(
                    2,
                  )}
                </p>
              ))}
              <p>
                Subtotal ₹{bill.subtotal.toFixed(2)}
                <br />
                Discount −₹{bill.discount.toFixed(2)}
                <br />
                Tax ₹{bill.tax.toFixed(2)} ({bill.tax_mode})
              </p>
              <strong>Total ₹{bill.total.toFixed(2)}</strong>
            </div>
          )}
          {panel === "print" && <PrintReceipt />}
          {panel === "payment" && (
            <>
              <label>
                Payment method
                <select
                  value={payment?.payment_method || method}
                  disabled={!!payment}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
              </label>
              <p>
                {notice ||
                  "Collect payment at the counter or verify it in the restaurant’s bank/payment app."}
              </p>
              <label>
                <input
                  type="checkbox"
                  checked={received}
                  onChange={(e) => setReceived(e.target.checked)}
                />{" "}
                I have verified receipt of this payment.
              </label>
              <button disabled={busy || !received || settled} onClick={pay}>
                Confirm payment
              </button>
            </>
          )}
          {panel === "cancel" && (
            <>
              <p>Cancel this order? Its history will be retained.</p>
              <button
                disabled={busy}
                onClick={() => mutate(`/deleteOrder/${orderId}`, "DELETE")}
              >
                Yes, cancel order
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
function PrintReceipt() {
  useEffect(() => {
    const id = setTimeout(() => window.print(), 150);
    return () => clearTimeout(id);
  }, []);
  return <button onClick={() => window.print()}>Print again</button>;
}
