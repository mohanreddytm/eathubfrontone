import React, { useEffect, useState } from "react";
import { request } from "../utils/api";
import { Notice } from "./common";
let loading;
function checkoutScript() {
  if (window.Razorpay) return Promise.resolve();
  if (!loading)
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      const timeout = setTimeout(() => script.onerror(), 20000);
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        loading = null;
        reject(new Error("Could not load payment checkout. Please try again."));
      };
      document.head.appendChild(script);
    });
  return loading;
}
export default function Checkout({ restaurantId, orderId, onPaid }) {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    const c = new AbortController();
    request(`/checkout/config/${restaurantId}`, "GET", undefined, {
      signal: c.signal,
    })
      .then((d) => setEnabled(d.enabled))
      .catch(() => {});
    return () => c.abort();
  }, [restaurantId]);
  async function open() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await checkoutScript();
      const d = await request(`/checkout/${orderId}`, "POST", {});
      const checkout = new window.Razorpay({
        key: d.key,
        amount: d.amount,
        currency: d.currency,
        order_id: d.provider_order_id,
        name: "EatHub · Test checkout",
        description: "TEST payment — no real money",
        theme: { color: "#28654f" },
        handler: async (result) => {
          try {
            await request(`/checkout/${orderId}/verify`, "POST", result);
            setNotice("Test payment verified. No real money was collected.");
            await onPaid?.();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setNotice(
              "Checkout closed. You can reopen it to finish this test payment.",
            );
          },
        },
      });
      checkout.on("payment.failed", () => {
        setError("Test payment failed. Please retry checkout.");
        setBusy(false);
      });
      checkout.open();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  if (!enabled) return null;
  return (
    <div className="eh-checkout">
      {error && <Notice error>{error}</Notice>}
      {notice && <Notice>{notice}</Notice>}
      <p className="eh-muted">Razorpay test mode · No real money is charged.</p>
      <button className="eh-button eh-secondary" disabled={busy} onClick={open}>
        {busy ? "Verifying test payment…" : "Pay online · TEST"}
      </button>
    </div>
  );
}
