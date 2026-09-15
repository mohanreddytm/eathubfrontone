import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth, { Landing } from "./workspace/Auth";
import Workspace from "./workspace/Workspace";
import Guest, { PublicTables } from "./workspace/Guest";
import SuperAdmin from "./workspace/SuperAdmin";
import Register from "./workspace/Register";
import "./App.css";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/superAdminLogin" element={<Auth superAdmin />} />
      <Route path="/restaurantReg" element={<Register />} />
      <Route
        path="/getMoreInforRest"
        element={<Navigate to="/restaurantDashboard/setup" replace />}
      />
      <Route
        path="/restaurantDashboard/*"
        element={<Workspace role="admin" />}
      />
      <Route path="/waiterDashboard/*" element={<Workspace role="waiter" />} />
      <Route path="/kotDashboard/*" element={<Workspace role="kot" />} />
      <Route path="/superAdminDashboard/*" element={<SuperAdmin />} />
      <Route
        path="/customerDashboard/:tableId/:restaurantId/*"
        element={<Guest />}
      />
      <Route path="/tables/:restaurantId" element={<PublicTables />} />
      <Route
        path="/menu"
        element={<Navigate to="/restaurantDashboard/menu" replace />}
      />
      <Route
        path="*"
        element={
          <div className="eh-app eh-empty">
            <h1>Page not found</h1>
            <a className="eh-button" href="/">
              Back to EatHub
            </a>
          </div>
        }
      />
    </Routes>
  );
}
