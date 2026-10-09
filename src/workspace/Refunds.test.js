import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import Refunds from "./Refunds";
import { request } from "../utils/api";
jest.mock("../utils/api", () => ({ request: jest.fn() }));
const initial = {
  order_id: "o1",
  can_refund: true,
  refund_status: "None",
  mode: "test",
  paid_amount_paise: 23625,
  refunded_amount_paise: 0,
  pending_amount_paise: 0,
  refunds: [],
  lines: [
    {
      line_index: 0,
      name: "Meal",
      quantity: 2,
      remaining_quantity: 2,
      unit_amounts_paise: [9450, 9450],
    },
    {
      line_index: 1,
      name: "Drink",
      quantity: 1,
      remaining_quantity: 1,
      unit_amounts_paise: [4725],
    },
  ],
};
const refund = {
  id: "rf1",
  amount_paise: 9450,
  status: "pending",
  items: [{ line_index: 0, quantity: 1, name: "Meal" }],
  reason: "One meal returned",
  created_at: "2026-10-08T08:00:00Z",
};
beforeEach(() => {
  sessionStorage.clear();
  request.mockReset().mockResolvedValue(initial);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
async function openForm() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Refund", exact: true }),
  );
  fireEvent.change(screen.getByLabelText("Reason for refund"), {
    target: { value: "One meal returned" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}
test("loading, load error/retry and empty history are visible", async () => {
  request
    .mockRejectedValueOnce(new Error("Server unavailable"))
    .mockResolvedValue(initial);
  render(<Refunds orderId="o1" admin />);
  expect(screen.getByText("Loading refunds…")).toBeInTheDocument();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Server unavailable",
  );
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(
    await screen.findByText("No refunds have been requested for this order."),
  ).toBeInTheDocument();
});
test("partial refund sends selected quantities and reason, not client-controlled money", async () => {
  request.mockImplementation(async (path, method) =>
    method === "POST"
      ? {
          ...initial,
          refunds: [refund],
          can_refund: false,
          pending_amount_paise: 9450,
        }
      : initial,
  );
  render(<Refunds orderId="o1" admin />);
  await openForm();
  fireEvent.click(screen.getByLabelText("Selected items"));
  fireEvent.change(screen.getByLabelText("Return quantity: Meal"), {
    target: { value: "1" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm refund ₹94.50" }),
  );
  expect(await screen.findByText("Refund pending")).toBeInTheDocument();
  const sent = request.mock.calls.find((c) => c[1] === "POST");
  expect(sent[2]).toEqual({
    kind: "items",
    reason: "One meal returned",
    items: [{ line_index: 0, quantity: 1 }],
  });
  expect(sent[3].headers["Idempotency-Key"]).toMatch(/^[\w-]{10,}$/);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
test("full refund needs confirmation and prevents duplicate clicks during submission", async () => {
  let finish;
  request.mockImplementation((path, method) =>
    method === "POST"
      ? new Promise((r) => {
          finish = r;
        })
      : Promise.resolve(initial),
  );
  render(<Refunds orderId="o1" admin />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Refund", exact: true }),
  );
  expect(
    screen.getByRole("button", { name: "Confirm refund ₹236.25" }),
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Reason for refund"), {
    target: { value: "Returned everything" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm refund ₹236.25" }),
  );
  expect(screen.getByRole("button", { name: "Submitting…" })).toBeDisabled();
  finish({
    ...initial,
    can_refund: false,
    refunded_amount_paise: 23625,
    refunds: [{ ...refund, status: "processed", amount_paise: 23625 }],
  });
  expect(await screen.findByText("Refund processed")).toBeInTheDocument();
  expect(request.mock.calls.filter((c) => c[1] === "POST")).toHaveLength(1);
});
test("uncertain network errors retry the exact original body and key", async () => {
  let submissions = 0;
  request.mockImplementation(async (path, method) => {
    if (method !== "POST") return initial;
    if (++submissions === 1) throw new Error("Connection lost");
    return {
      ...initial,
      can_refund: false,
      refunded_amount_paise: 23625,
      refunds: [{ ...refund, status: "processed" }],
    };
  });
  render(<Refunds orderId="o1" admin />);
  await openForm();
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm refund ₹236.25" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Connection lost");
  expect(screen.getByLabelText("Reason for refund")).toBeDisabled();
  expect(sessionStorage.getItem("eathub-refund-request:o1")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry same refund" }));
  await screen.findByText("Refund processed");
  const calls = request.mock.calls.filter((c) => c[1] === "POST");
  expect(calls[0]).toEqual(calls[1]);
  expect(sessionStorage.getItem("eathub-refund-request:o1")).toBeNull();
});
test("reload recovers a saved request through its existing ledger entry", async () => {
  sessionStorage.setItem(
    "eathub-refund-request:o1",
    JSON.stringify({
      key: "saved-request-123",
      body: { kind: "full", reason: "Returned everything" },
    }),
  );
  request.mockResolvedValue({
    ...initial,
    can_refund: false,
    refunds: [{ ...refund, request_key: "saved-request-123" }],
  });
  render(<Refunds orderId="o1" admin />);
  await screen.findByText("Refund pending");
  expect(
    screen.queryByRole("button", { name: "Retry previous refund" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Check status" }),
  ).toBeInTheDocument();
  expect(sessionStorage.getItem("eathub-refund-request:o1")).toBeNull();
  expect(request.mock.calls.filter((c) => c[1] === "POST")).toHaveLength(0);
});
test("pending status sync reports a provider failure and makes quantities available again", async () => {
  request.mockImplementation(async (path, method) =>
    method === "POST"
      ? { ...initial, refunds: [{ ...refund, status: "failed" }] }
      : { ...initial, can_refund: false, refunds: [refund] },
  );
  render(<Refunds orderId="o1" admin />);
  fireEvent.click(await screen.findByRole("button", { name: "Check status" }));
  await screen.findByText("Refund failed");
  expect(request).toHaveBeenCalledWith(
    "/api/refunds/o1/rf1/sync",
    "POST",
    {},
    {},
  );
  expect(
    screen.getByRole("button", { name: "Refund", exact: true }),
  ).toBeEnabled();
});
test("customer history has no refund controls or internal reasons", async () => {
  request.mockResolvedValue({
    ...initial,
    refunds: [{ ...refund, status: "processed" }],
    refunded_amount_paise: 9450,
  });
  render(<Refunds orderId="o1" />);
  await screen.findByText("Refund processed");
  expect(
    screen.queryByRole("button", { name: "Refund", exact: true }),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Reason:/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Test mode/)).not.toBeInTheDocument();
});
test("already returned quantities cannot be selected; validation errors allow correction", async () => {
  request.mockImplementation(async (path, method) => {
    if (method === "POST")
      throw Object.assign(new Error("Refresh the order before refunding"), {
        status: 409,
      });
    return {
      ...initial,
      lines: [
        { ...initial.lines[0], remaining_quantity: 0, unit_amounts_paise: [] },
        initial.lines[1],
      ],
    };
  });
  render(<Refunds orderId="o1" admin />);
  await openForm();
  fireEvent.click(screen.getByLabelText("Selected items"));
  expect(screen.getByLabelText("Return quantity: Meal")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Return quantity: Drink"), {
    target: { value: "1" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Confirm refund ₹47.25" }),
  );
  await within(screen.getByRole("dialog")).findByRole("alert");
  expect(screen.getByLabelText("Reason for refund")).toBeEnabled();
  expect(sessionStorage.getItem("eathub-refund-request:o1")).toBeNull();
});
