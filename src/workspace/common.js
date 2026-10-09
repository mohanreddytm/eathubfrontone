import React, { useEffect, useRef, useState } from "react";
import {
  LuPlus,
  LuX,
  LuSearch,
  LuUtensils,
  LuArrowRight,
  LuRefreshCw,
} from "react-icons/lu";
export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
export const total = (o) =>
  (Number(o.total_price) || 0) -
  (Number(o.discount_amount) || 0) +
  (o.tax_mode === "inclusive" ? 0 : Number(o.tax_amount) || 0);
export const list = (value) => {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value) || [];
  } catch {
    return [];
  }
};
export const date = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
export const itemName = (i) =>
  i.name || i.item_name || i.cart_item_name || "Item no longer on menu";
export const available = (i) => /^(yes|true|available)$/i.test(i.availability);
export const terminal = (o) =>
  ["Completed", "Cancelled", "Refunded"].includes(o.status);
export function Status({ children }) {
  return (
    <span
      className={`eh-status eh-status-${String(children).toLowerCase().replace(/\s/g, "-")}`}
    >
      {children}
    </span>
  );
}
export function Empty({ title = "Nothing here yet", children, action }) {
  return (
    <div className="eh-empty">
      <LuUtensils />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Notice({ error, children, onRetry }) {
  return (
    <div
      className={`eh-notice ${error ? "eh-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
      {onRetry && (
        <button className="eh-text-button" onClick={onRetry}>
          <LuRefreshCw /> Retry
        </button>
      )}
    </div>
  );
}
export function Search({ value, onChange, placeholder = "Search…" }) {
  return (
    <label className="eh-search">
      <LuSearch />
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function PageHeading({
  eyebrow = "YOUR RESTAURANT",
  title,
  children,
  action,
}) {
  return (
    <div className="eh-page-heading">
      <div>
        <div className="eh-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="eh-modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="eh-modal-heading">
        <h2>{title}</h2>
        <button
          className="eh-icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <LuX />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function FormDialog({
  title,
  fields,
  initial = {},
  onSave,
  onClose,
  submit = "Save changes",
}) {
  const [values, setValues] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={title} onClose={() => !busy && onClose()}>
      <form onSubmit={save}>
        <div className="eh-form-grid">
          {fields.map((f) => (
            <label key={f.name} className={f.wide ? "eh-field-wide" : ""}>
              {f.label}
              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={values[f.name] ?? ""}
                  required={f.required !== false}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                >
                  <option value="">Choose…</option>
                  {f.options.map((o) => (
                    <option key={o.value ?? o} value={o.value ?? o}>
                      {o.label ?? o}
                    </option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  value={values[f.name] ?? ""}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                  required={f.required !== false}
                />
              ) : (
                <input
                  name={f.name}
                  type={f.type || "text"}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  minLength={f.minLength}
                  maxLength={f.maxLength || 255}
                  value={values[f.name] ?? ""}
                  required={f.required !== false}
                  autoComplete={f.type === "password" ? "new-password" : "off"}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
        </div>
        {error && <Notice error>{error}</Notice>}
        <div className="eh-dialog-actions">
          <button
            type="button"
            className="eh-button eh-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="eh-button" disabled={busy}>
            {busy ? "Saving…" : submit}
            <LuArrowRight />
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function AddButton({ children, onClick }) {
  return (
    <button className="eh-button" onClick={onClick}>
      <LuPlus />
      {children}
    </button>
  );
}
export function Confirm({ title, children, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title={title} onClose={() => !busy && onClose()}>
      <p>{children}</p>
      {error && <Notice error>{error}</Notice>}
      <div className="eh-dialog-actions">
        <button
          className="eh-button eh-secondary"
          onClick={onClose}
          disabled={busy}
        >
          Keep it
        </button>
        <button
          className="eh-button eh-danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}
export function FoodImage({ item }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.image_url]);
  return item.image_url && !failed ? (
    <img
      src={item.image_url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <LuUtensils aria-hidden="true" />
  );
}
