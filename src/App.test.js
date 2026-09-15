import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import apiFetch, { request } from "./utils/api";
jest.mock("./utils/api", () => ({
  __esModule: true,
  default: jest.fn(),
  request: jest.fn(),
  API_BASE_URL: "http://localhost:8000",
}));
const bill = {
  id: "url-order-123",
  restaurant_id: "r1",
  order_number: "0913-8",
  status: "Pending",
  items: [{ id: "m1", name: "Garden meal", price: 100, quantity: 1 }],
  subtotal: 100,
  discount: 0,
  tax: 0,
  total: 100,
  tax_mode: "exclusive",
  restaurant: { restaurentname: "Test restaurant" },
};
const data = {
  restaurant: { id: "r1", restaurentname: "Test restaurant" },
  orders: [{ ...bill, total_price: 100, created_at: new Date().toISOString() }],
  menu: [],
  categories: [],
  areas: [],
  tables: [],
  staff: [],
  requests: [],
  calls: [],
  reservations: [],
  payments: [],
};
function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}
function start(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <App />
        <Location />
      </ThemeProvider>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  Cookies.remove("t_user");
  sessionStorage.clear();
  request.mockReset();
  apiFetch.mockReset();
  request.mockImplementation(async (path) =>
    path === "/workspace"
      ? data
      : path.startsWith("/public/tables")
        ? { tables: [] }
        : { enabled: false },
  );
  apiFetch.mockImplementation(async () => ({
    ok: true,
    json: async () => ({ bill }),
  }));
});
afterEach(() => Cookies.remove("t_user"));
function login() {
  Cookies.set(
    "t_user",
    `e30.${btoa(JSON.stringify({ role: "admin", userId: "r1", restaurantId: "r1", exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`,
  );
}
test("an unauthenticated deep link redirects to sign in", async () => {
  start("/restaurantDashboard/pos/url-order-123");
  expect(
    await screen.findByRole("button", { name: "Sign in" }),
  ).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent("/login");
  expect(request).not.toHaveBeenCalledWith(
    "/workspace",
    expect.anything(),
    expect.anything(),
    expect.anything(),
  );
});
test("an order opens POS using its ID in the URL", async () => {
  login();
  start("/restaurantDashboard/orders");
  fireEvent.click(await screen.findByRole("link", { name: "#0913-8" }));
  expect(await screen.findByText("Order #0913-8")).toBeInTheDocument();
  expect(screen.getByTestId("location")).toHaveTextContent(
    "/restaurantDashboard/pos/url-order-123",
  );
  expect(apiFetch).toHaveBeenCalledWith(
    "http://localhost:8000/generateBill/url-order-123",
    expect.anything(),
  );
  expect(screen.getByText("Garden meal")).toBeInTheDocument();
});
test("a direct POS URL loads the order without navigation state", async () => {
  login();
  start("/restaurantDashboard/pos/url-order-123");
  expect(await screen.findByText("Order #0913-8")).toBeInTheDocument();
  expect(apiFetch).toHaveBeenCalledWith(
    "http://localhost:8000/generateBill/url-order-123",
    expect.anything(),
  );
});
