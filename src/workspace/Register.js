import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { LuUtensils, LuArrowRight } from "react-icons/lu";
import { request } from "../utils/api";
import { Notice, PageHeading } from "./common";
import "./workspace.css";
export default function Register() {
  const navigate = useNavigate(),
    [form, setForm] = useState({ country: "India", countrycode: "+91" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (form.password !== form.confirm) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { confirm, ...fields } = form;
      const d = await request("/restaurant", "POST", {
        ...fields,
        id: crypto.randomUUID(),
      });
      Cookies.set("t_user", d.token, {
        expires: 0.5,
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      navigate("/restaurantDashboard/setup", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="eh-app">
      <header className="eh-topbar">
        <Link className="eh-guest-brand" to="/">
          <span className="eh-brand-icon">
            <LuUtensils />
          </span>
          <strong>EatHub</strong>
        </Link>
        <Link to="/login">Already registered? Sign in</Link>
      </header>
      <main className="eh-guest-content" style={{ maxWidth: 760 }}>
        <PageHeading
          title="Make room for great service."
          eyebrow="CREATE YOUR RESTAURANT"
        >
          Set up your account, then add your menu, tables, and team.
        </PageHeading>
        <form className="eh-card eh-settings-form" onSubmit={submit}>
          <div className="eh-form-grid">
            {[
              ["name", "Owner name", "text"],
              ["restaurentname", "Restaurant name", "text"],
              ["email", "Email address", "email"],
              ["phonenumber", "Phone number", "tel"],
              ["branchname", "Branch name", "text"],
              ["branchaddress", "Restaurant address", "text"],
              ["country", "Country", "text"],
              ["countrycode", "Phone country code", "text"],
              ["password", "Password", "password"],
              ["confirm", "Confirm password", "password"],
            ].map(([key, label, type]) => (
              <label key={key}>
                {label}
                <input
                  type={type}
                  required
                  maxLength={type === "password" ? 72 : 255}
                  minLength={type === "password" ? 8 : undefined}
                  autoComplete={type === "password" ? "new-password" : "off"}
                  value={form[key] || ""}
                  disabled={busy}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          {error && <Notice error>{error}</Notice>}
          <button className="eh-button" disabled={busy}>
            {busy ? "Creating account…" : "Create restaurant account"}
            <LuArrowRight />
          </button>
        </form>
      </main>
    </div>
  );
}
