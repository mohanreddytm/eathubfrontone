import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrderActions from "./OrderActions";
import apiFetch from "../../../utils/api";
jest.mock("../../../utils/api", () => ({
  __esModule: true,
  default: jest.fn(),
  API_BASE_URL: "http://localhost:8000",
}));
const bill = {
  id: "o1",
  restaurant_id: "r1",
  order_number: "0911-1",
  status: "Pending",
  table_name: "T1",
  created_at: "2026-09-11T10:00:00Z",
  items: [{ id: "m1", cart_item_name: "Meal", price: 100, quantity: 1 }],
  subtotal: 100,
  discount: 0,
  tax: 0,
  tax_mode: "exclusive",
  total: 100,
  restaurant: { restaurentname: "Test", branchaddress: "Test Street" },
};
beforeEach(() => {
  apiFetch.mockReset();
  apiFetch.mockImplementation(async () => ({
    ok: true,
    json: async () => ({
      bill,
      payment: { id: "p1", payment_status: "Paid", payment_method: "Cash" },
    }),
  }));
});
test("billing opens printable receipt", async () => {
  render(<OrderActions orderId="o1" />);
  await screen.findByText("Order #0911-1");
  fireEvent.click(screen.getByText("BILL"));
  expect(await screen.findByText("Test Street")).toBeInTheDocument();
  expect(document.querySelector("#eathub-receipt")).toHaveTextContent(
    "Total ₹100.00",
  );
});
test("saving discount calls its API", async () => {
  render(<OrderActions orderId="o1" />);
  await screen.findByText("Order #0911-1");
  fireEvent.click(screen.getByText("Add Discount"));
  fireEvent.change(screen.getByLabelText("Discount value"), {
    target: { value: "10" },
  });
  fireEvent.click(screen.getByText("Save discount"));
  await waitFor(() =>
    expect(apiFetch).toHaveBeenCalledWith(
      "http://localhost:8000/updateOrderDiscount/o1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ discount_type: "flat", discount_value: "10" }),
      }),
    ),
  );
});
test("payment confirmation requires explicit verification of receipt", async () => {
  render(<OrderActions orderId="o1" />);
  await screen.findByText("Order #0911-1");
  fireEvent.click(screen.getByText("BILL & PAYMENT"));
  expect(screen.getByText("Confirm payment")).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByText("Confirm payment"));
  await screen.findByText("Payment confirmed and order completed.");
});
test("a failed mutation shows the server error rather than success", async () => {
  render(<OrderActions orderId="o1" />);
  await screen.findByText("Order #0911-1");
  apiFetch.mockImplementationOnce(async () => ({
    ok: false,
    json: async () => ({ error: "Order already paid" }),
  }));
  fireEvent.click(screen.getByText("Move to Confirmed"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Order already paid",
  );
});
