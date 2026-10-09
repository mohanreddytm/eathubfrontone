import React, { useCallback, useEffect, useRef, useState } from "react";
import { request } from "../utils/api";
import { Modal, Notice, Status, date, money } from "./common";
import "./refunds.css";

const waiting = (status) =>
  ["requested", "unknown", "pending"].includes(status);
const labels = {
  requested: "Awaiting confirmation",
  unknown: "Awaiting confirmation",
  pending: "Refund pending",
  processed: "Refund processed",
  failed: "Refund failed",
};
const storageKey = (id) => `eathub-refund-request:${id}`;
function readIntent(id) {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(id))) || null;
  } catch {
    return null;
  }
}

// Mount with key={orderId}. The API independently enforces role and ownership.
export default function Refunds({ orderId, admin = false, onChanged }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  const [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false),
    [intent, setIntent] = useState(() => (admin ? readIntent(orderId) : null));
  const intentRef = useRef(intent),
    acting = useRef(false),
    revision = useRef(0);
  const base = `/api/refunds/${encodeURIComponent(orderId)}`;
  const saveIntent = useCallback(
    (value) => {
      intentRef.current = value;
      setIntent(value);
      try {
        if (value)
          sessionStorage.setItem(storageKey(orderId), JSON.stringify(value));
        else sessionStorage.removeItem(storageKey(orderId));
      } catch {
        /* The in-memory key still protects retries when storage is disabled. */
      }
    },
    [orderId],
  );
  const load = useCallback(
    async (signal) => {
      const started = revision.current;
      try {
        const result = await request(base, "GET", undefined, { signal });
        if (signal?.aborted || started !== revision.current || acting.current)
          return;
        setData(result);
        setError("");
        // A lost response can be recovered from the ledger after a page reload.
        if (
          intentRef.current &&
          result.refunds.some((r) => r.request_key === intentRef.current.key)
        )
          saveIntent(null);
      } catch (e) {
        if (e.name !== "AbortError" && !signal?.aborted) setError(e.message);
      }
    },
    [base, saveIntent],
  );
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const timer = setInterval(() => load(controller.signal), 15000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [load]);
  async function mutate(path, body, saved) {
    if (acting.current) return;
    acting.current = true;
    revision.current++;
    setBusy(true);
    setActionError("");
    try {
      const result = await request(
        path,
        "POST",
        body,
        saved ? { headers: { "Idempotency-Key": saved.key } } : {},
      );
      setData(result);
      setError("");
      saveIntent(null);
      setOpen(false);
      // The refund is confirmed independently of a workspace refresh failure.
      Promise.resolve()
        .then(() => onChanged?.())
        .catch(() => {});
    } catch (e) {
      setActionError(e.message);
      // Validation/auth errors did not accept a new refund. Uncertain network/5xx
      // outcomes retain the original request for an identical, safe retry.
      if (e.status >= 400 && e.status < 500) saveIntent(null);
    } finally {
      acting.current = false;
      setBusy(false);
    }
  }
  function submit(body) {
    const saved = intentRef.current || { key: crypto.randomUUID(), body };
    saveIntent(saved);
    return mutate(base, saved.body, saved);
  }
  return (
    <section className="eh-refunds" aria-label="Order refunds">
      <div className="eh-refund-heading">
        <div>
          <h3>Refunds</h3>
          <p className="eh-muted">Returns to the original payment method.</p>
        </div>
        {admin && data && (
          <button
            className="eh-button eh-secondary"
            disabled={busy || !data.can_refund || !!intent}
            onClick={() => {
              setActionError("");
              setOpen(true);
            }}
          >
            Refund
          </button>
        )}
      </div>
      {!data && !error && <p role="status">Loading refunds…</p>}
      {error && (
        <Notice error onRetry={() => load()}>
          {error}
        </Notice>
      )}
      {actionError && !open && <Notice error>{actionError}</Notice>}
      {admin && intent && !open && (
        <Notice>
          A previous request needs confirmation. Retry it with the same details.
          <button
            className="eh-button"
            disabled={busy}
            onClick={() => submit(intent.body)}
          >
            {busy ? "Checking…" : "Retry previous refund"}
          </button>
        </Notice>
      )}
      {data && (
        <>
          <div className="eh-refund-totals">
            <span>
              Refunded{" "}
              <strong>{money(data.refunded_amount_paise / 100)}</strong>
            </span>
            {data.pending_amount_paise > 0 && (
              <span>
                Awaiting confirmation{" "}
                <strong>{money(data.pending_amount_paise / 100)}</strong>
              </span>
            )}
          </div>
          {admin && data.unavailable_reason && (
            <p className="eh-muted">{data.unavailable_reason}</p>
          )}
          {admin && data.mode === "test" && (
            <p className="eh-refund-test">
              Test mode · No real money is refunded.
            </p>
          )}
          {!data.refunds.length && (
            <p className="eh-muted">
              No refunds have been requested for this order.
            </p>
          )}
          <ul className="eh-refund-history">
            {data.refunds.map((r) => (
              <li key={r.id}>
                <div className="eh-refund-heading">
                  <strong>{money(r.amount_paise / 100)}</strong>
                  <Status>{labels[r.status] || r.status}</Status>
                </div>
                <p>
                  {r.items.map((i) => `${i.quantity} × ${i.name}`).join(" · ")}
                </p>
                <small>{date(r.created_at)}</small>
                {admin && <p className="eh-muted">Reason: {r.reason}</p>}
                {waiting(r.status) && (
                  <p className="eh-muted">
                    Confirmation is pending. This amount is reserved to prevent
                    a duplicate refund.
                  </p>
                )}
                {r.status === "processed" && (
                  <p className="eh-muted">
                    Razorpay has processed the refund. Your bank may take
                    additional time to show the credit.
                  </p>
                )}
                {r.status === "failed" && (
                  <p className="eh-muted">
                    The refund was not completed.{" "}
                    {admin
                      ? "Review the payment before requesting a new refund."
                      : "Please contact the restaurant for help."}
                  </p>
                )}
                {admin && r.last_error && (
                  <p className="eh-muted">{r.last_error}</p>
                )}
                {admin && waiting(r.status) && (
                  <button
                    className="eh-button eh-secondary"
                    disabled={busy}
                    onClick={() =>
                      mutate(`${base}/${encodeURIComponent(r.id)}/sync`, {})
                    }
                  >
                    {busy ? "Checking…" : "Check status"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {admin && open && data && (
        <RefundDialog
          data={data}
          busy={busy}
          intent={intent}
          error={actionError}
          onSubmit={submit}
          onClose={() => !busy && setOpen(false)}
        />
      )}
    </section>
  );
}

function RefundDialog({ data, busy, intent, error, onSubmit, onClose }) {
  const [kind, setKind] = useState("full"),
    [quantities, setQuantities] = useState({}),
    [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const selected = data.lines
    .filter((l) => l.remaining_quantity > 0)
    .map((l) => ({
      line_index: l.line_index,
      quantity:
        kind === "full"
          ? l.remaining_quantity
          : Number(quantities[l.line_index] || 0),
    }))
    .filter((i) => i.quantity > 0);
  const amount = selected.reduce(
    (sum, i) =>
      sum +
      data.lines
        .find((l) => l.line_index === i.line_index)
        .unit_amounts_paise.slice(0, i.quantity)
        .reduce((a, b) => a + b, 0),
    0,
  );
  return (
    <Modal title="Refund this order" onClose={onClose}>
      <form
        className="eh-refund-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            kind,
            reason: reason.trim(),
            ...(kind === "items" ? { items: selected } : {}),
          });
        }}
      >
        <p>
          Choose what was returned. The amount includes its share of the
          original discount and tax.
        </p>
        <fieldset disabled={busy || !!intent}>
          <legend>Refund type</legend>
          <label className="eh-refund-radio">
            <input
              type="radio"
              name="refund-kind"
              checked={kind === "full"}
              onChange={() => setKind("full")}
            />
            Full remaining balance
          </label>
          <label className="eh-refund-radio">
            <input
              type="radio"
              name="refund-kind"
              checked={kind === "items"}
              onChange={() => setKind("items")}
            />
            Selected items
          </label>
          {kind === "items" && (
            <div className="eh-refund-items">
              {data.lines.map((l) => (
                <label key={l.line_index}>
                  <span>
                    {l.name}
                    <small>
                      {l.remaining_quantity} of {l.quantity} available
                    </small>
                  </span>
                  <select
                    aria-label={`Return quantity: ${l.name}`}
                    value={quantities[l.line_index] || 0}
                    disabled={!l.remaining_quantity}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [l.line_index]: Number(e.target.value),
                      })
                    }
                  >
                    {Array.from(
                      { length: l.remaining_quantity + 1 },
                      (_, n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              ))}
            </div>
          )}
          <label>
            Reason for refund
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={3}
              maxLength={500}
              placeholder="For example, one dish was returned"
            />
          </label>
          <div className="eh-refund-review">
            <span>Amount to refund</span>
            <strong>{money(amount / 100)}</strong>
          </div>
          <label className="eh-refund-radio">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I have checked the returned items and refund amount.
          </label>
        </fieldset>
        {error && <Notice error>{error}</Notice>}
        {intent && !busy && (
          <p>
            A response was not confirmed. Retry sends the original request again
            safely.
          </p>
        )}
        <div className="eh-dialog-actions">
          <button
            className="eh-button eh-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="eh-button"
            disabled={
              busy ||
              (!intent &&
                (!confirmed || amount < 100 || reason.trim().length < 3))
            }
          >
            {busy
              ? "Submitting…"
              : intent
                ? "Retry same refund"
                : `Confirm refund ${money(amount / 100)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
