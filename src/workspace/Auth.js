import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  LuUtensils,
  LuArrowRight,
  LuShieldCheck,
  LuChefHat,
  LuClipboardList,
} from "react-icons/lu";
import { request } from "../utils/api";
import { Notice } from "./common";
import "./workspace.css";
import "./auth.css";
export default function Auth({ superAdmin = false }) {
  const [role, setRole] = useState(superAdmin ? "super_admin" : "admin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const config = {
        admin: ["/restaurantLogin", "t_user", "/restaurantDashboard"],
        waiter: ["/restaurant/waiterLogin", "w_user", "/waiterDashboard"],
        kot: ["/restaurant/kotLogin", "k_user", "/kotDashboard"],
        super_admin: ["/superAdminLogin", "sa_user", "/superAdminDashboard"],
      }[role];
      const d = await request(config[0], "POST", {
        email: email.trim(),
        password,
      });
      Cookies.set(config[1], d.token, {
        expires: 0.5,
        sameSite: "Lax",
        secure: window.location.protocol === "https:",
      });
      navigate(config[2], { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="eh-app eh-auth">
      <section className="eh-auth-story">
        <Link className="eh-brand" to="/">
          <span className="eh-brand-icon">
            <LuUtensils />
          </span>
          EatHub
        </Link>
        <div>
          <div className="eh-eyebrow">MADE FOR THE WAY YOU SERVE</div>
          <h1>
            Great food.
            <br />
            Thoughtful service.
            <br />
            <span>One workspace.</span>
          </h1>
          <p>
            From the first order to the last table, bring your restaurant team
            together.
          </p>
          <div className="eh-auth-points">
            <span>
              <LuClipboardList />
              Orders, made simple
            </span>
            <span>
              <LuChefHat />A connected kitchen
            </span>
            <span>
              <LuShieldCheck />A workspace for every role
            </span>
          </div>
        </div>
        <small>Good service starts with a little clarity.</small>
      </section>
      <section className="eh-auth-form-area">
        <form className="eh-auth-form" onSubmit={submit}>
          <div className="eh-eyebrow">
            {superAdmin ? "PLATFORM OPERATIONS" : "WELCOME BACK"}
          </div>
          <h2>{superAdmin ? "Super admin sign in" : "Ready for service?"}</h2>
          <p>Sign in to your EatHub workspace.</p>
          {!superAdmin && (
            <div className="eh-tabs">
              {[
                ["admin", "Admin"],
                ["waiter", "Waiter"],
                ["kot", "Kitchen"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  className={role === value ? "active" : ""}
                  key={value}
                  disabled={busy}
                  onClick={() => {
                    setRole(value);
                    setError("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>
          {error && <Notice error>{error}</Notice>}
          <button className="eh-button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <LuArrowRight />
          </button>
          {!superAdmin && (
            <p className="eh-auth-register">
              Starting a restaurant?{" "}
              <Link to="/restaurantReg">Create an account</Link>
            </p>
          )}
          <Link className="eh-text-button" to="/">
            Back to EatHub
          </Link>
        </form>
      </section>
    </div>
  );
}
export function Landing() {
  return (
    <div className="eh-app eh-landing">
      <header>
        <Link className="eh-guest-brand" to="/">
          <span className="eh-brand-icon">
            <LuUtensils />
          </span>
          <strong>EatHub</strong>
        </Link>
        <nav>
          <Link to="/login">Team sign in</Link>
          <Link className="eh-button" to="/restaurantReg">
            Get started
            <LuArrowRight />
          </Link>
        </nav>
      </header>
      <main>
        <div className="eh-eyebrow">YOUR RESTAURANT. WORKING TOGETHER.</div>
        <h1>
          A smoother service,
          <br />
          <span>from table to kitchen.</span>
        </h1>
        <p>
          Take orders, connect your floor team, manage the kitchen, and keep
          every bill in one place.
        </p>
        <Link className="eh-button" to="/login">
          Open your workspace
          <LuArrowRight />
        </Link>
        <div className="eh-landing-features">
          {[
            [
              "01",
              "Take the order",
              "A clear point of sale and QR ordering for guests.",
            ],
            [
              "02",
              "Keep it moving",
              "Assigned waiter orders and a live kitchen board.",
            ],
            [
              "03",
              "Close with confidence",
              "Itemised bills, payment verification, and service history.",
            ],
          ].map(([n, title, description]) => (
            <article key={n}>
              <span>{n}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </main>
      <footer>
        EatHub · Restaurant operations, together.
        <Link to="/superAdminLogin">Platform administration</Link>
      </footer>
    </div>
  );
}
