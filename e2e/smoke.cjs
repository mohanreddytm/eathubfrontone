// Run after npm run build. Uses disposable local PostgreSQL data; never connects to Neon.
const { chromium } = require("playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const front = path.resolve(__dirname, "..");
const backend =
  process.env.EATHUB_BACKEND_DIR ||
  [
    path.resolve(front, "../backend"),
    path.resolve(front, "../../backend/eathubbackend"),
  ].find((p) => fs.existsSync(path.join(p, "scripts/demo.js")));
const origin = "http://localhost:3000";
const previews = path.join(front, "docs/previews");
let api, web, browser;
const errors = [],
  serverErrors = [];
let logs = "";
async function until(fn, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      if (await fn()) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw Error("Timed out waiting for local demo API: " + logs);
}
async function login(context, role, email) {
  const page = await context.newPage();
  watch(page);
  await page.goto(origin + (role === "Super" ? "/superAdminLogin" : "/login"));
  if (role !== "Super")
    await page.getByRole("button", { name: role, exact: true }).click();
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("EatHubDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/Dashboard\//);
  await page.locator("h1").first().waitFor();
  return page;
}
function watch(page) {
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500 && r.url().startsWith("http://localhost:8000"))
      serverErrors.push(`${r.status()} ${r.url()}`);
  });
}
async function screenshot(page, name) {
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map((i) => {
        i.loading = "eager";
        return i.decode().catch(() => {});
      }),
    ),
  );
  await page.screenshot({
    path: path.join(previews, name + ".png"),
    fullPage: true,
    animations: "disabled",
  });
}
async function main() {
  assert(backend, "Set EATHUB_BACKEND_DIR to the matching backend checkout.");
  assert(
    fs.existsSync(path.join(front, "build/index.html")),
    "Run npm run build first.",
  );
  fs.mkdirSync(previews, { recursive: true });
  api = spawn(process.execPath, ["scripts/demo.js"], {
    cwd: backend,
    env: { ...process.env, NODE_ENV: "development", DEMO_PORT: "8000" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  api.stdout.on("data", (s) => (logs += s));
  api.stderr.on("data", (s) => (logs += s));
  await until(async () => {
    const r = await fetch("http://127.0.0.1:8000/health");
    return r.ok;
  });
  const build = path.join(front, "build");
  web = http.createServer((req, res) => {
    let rel;
    try {
      rel = decodeURIComponent(new URL(req.url, origin).pathname);
    } catch {
      res.writeHead(400);
      return res.end();
    }
    let file = path.resolve(build, "." + rel);
    if (!file.startsWith(build + path.sep))
      file = path.join(build, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile())
      file = path.join(build, "index.html");
    const mime = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".json": "application/json",
      ".jpg": "image/jpeg",
    };
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve, reject) => {
    web.once("error", reject);
    web.listen(3000, "127.0.0.1", resolve);
  });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.EATHUB_BROWSER_PATH
      ? { executablePath: process.env.EATHUB_BROWSER_PATH }
      : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
  });
  const admin = await login(adminContext, "Admin", "admin@demo.invalid");
  await admin.getByRole("link", { name: "Point of sale", exact: true }).click();
  await admin.waitForURL("**/restaurantDashboard/pos");
  await admin.getByRole("button", { name: /Classic chicken burger/ }).click();
  await admin.getByLabel("Table", { exact: true }).selectOption("table1");
  await admin.getByLabel("Guest name Optional").fill("Browser test guest");
  await admin.getByLabel("Kitchen note Optional").fill("No onions");
  // A failed save keeps the cart and can be retried safely.
  await admin.route(
    "**/addNewOrder",
    (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({ error: "Test: please retry this order" }),
      }),
    { times: 1 },
  );
  await admin
    .getByRole("button", { name: "Create order & send KOT", exact: true })
    .click();
  await admin
    .getByRole("alert")
    .filter({ hasText: "Test: please retry" })
    .waitFor();
  assert(
    await admin
      .locator(".eh-cart")
      .getByText("Classic chicken burger", { exact: true })
      .count(),
  );
  await screenshot(admin, "pos-desktop");
  await admin
    .getByRole("button", { name: "Create order & send KOT", exact: true })
    .click();
  await admin.waitForURL(/\/restaurantDashboard\/pos\/.+/);
  const orderUrl = admin.url(),
    orderId = orderUrl.split("/").pop();
  await admin.locator(".order-actions h2").waitFor();
  await admin.reload();
  await admin.locator(".order-actions h2").waitFor();
  assert.equal(admin.url(), orderUrl);
  assert(
    await admin
      .locator(".order-actions")
      .getByText("Classic chicken burger", { exact: true })
      .count(),
  );
  await admin
    .getByRole("link", { name: "Orders", exact: true })
    .first()
    .click();
  await admin.waitForURL("**/restaurantDashboard/orders");
  await admin
    .locator(`a[href="/restaurantDashboard/pos/${orderId}"]`)
    .first()
    .click();
  await admin.waitForURL(orderUrl);
  await admin.goBack();
  await admin.waitForURL("**/restaurantDashboard/orders");
  await admin.goForward();
  await admin.waitForURL(orderUrl);
  await admin.getByRole("button", { name: /Fresh orange juice/ }).click();
  await admin.getByRole("button", { name: "Send additional KOT" }).click();
  await admin
    .locator(".order-actions")
    .getByText("Fresh orange juice", { exact: true })
    .waitFor();
  console.log(
    "PASS admin login, save recovery, URL-based order details, reload, Back/Forward, additional KOT",
  );
  const kitchenContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const kitchen = await login(
    kitchenContext,
    "Kitchen",
    "kitchen@demo.invalid",
  );
  await kitchen
    .getByRole("button", { name: "Start preparing", exact: true })
    .click();
  await kitchen
    .getByRole("button", { name: "Mark ready", exact: true })
    .click();
  await kitchen
    .locator(".eh-kitchen-column")
    .filter({ hasText: "Ready to serve" })
    .getByText("Classic chicken burger", { exact: true })
    .waitFor();
  await screenshot(kitchen, "kitchen-desktop");
  const waiterContext = await browser.newContext({
    viewport: { width: 1365, height: 900 },
  });
  const waiter = await login(waiterContext, "Waiter", "waiter@demo.invalid");
  await waiter.getByLabel("My availability").selectOption("busy");
  await until(
    async () => !(await waiter.getByLabel("My availability").isDisabled()),
  );
  await waiter.getByLabel("My availability").selectOption("available");
  await until(
    async () => !(await waiter.getByLabel("My availability").isDisabled()),
  );
  await waiter.goto(origin + `/waiterDashboard/pos/${orderId}`);
  await waiter.locator(".order-actions h2").waitFor();
  await waiter
    .getByRole("button", { name: "BILL & PAYMENT", exact: true })
    .click();
  assert(
    await waiter
      .getByRole("button", { name: "Confirm payment", exact: true })
      .isDisabled(),
  );
  await waiter.getByRole("checkbox").check();
  await waiter
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await waiter
    .getByText("Payment confirmed. Kitchen progress is tracked separately.")
    .waitFor();
  await waiter
    .locator(".order-actions > p")
    .filter({ hasText: "Completed" })
    .waitFor();
  console.log(
    "PASS kitchen preparation and ready queue, waiter availability, receipt confirmation and order completion",
  );
  const guestContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const guest = await guestContext.newPage();
  watch(guest);
  await guest.goto(origin + "/customerDashboard/table2/demo/home");
  await guest
    .getByRole("heading", { name: "Something delicious awaits." })
    .waitFor();
  await screenshot(guest, "customer-mobile");
  await guest
    .locator(".eh-menu-card")
    .filter({ hasText: "Margherita pizza" })
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await guest.getByRole("link", { name: /View cart/ }).click();
  await guest.reload();
  await guest
    .getByRole("button", { name: "Place order", exact: true })
    .waitFor();
  await guest.getByRole("button", { name: "Place order", exact: true }).click();
  await guest.waitForURL(/\/orders\/.+/);
  await guest.locator(".eh-page-heading h1").waitFor();
  await guest.getByRole("button", { name: "Ask to pay", exact: true }).click();
  await guest
    .getByRole("status")
    .filter({ hasText: "request has been sent" })
    .waitFor();
  await screenshot(guest, "customer-order-mobile");
  await guest.getByRole("button", { name: "Call waiter", exact: true }).click();
  await guest
    .getByRole("dialog")
    .getByRole("button", { name: "Send request", exact: true })
    .click();
  await guest
    .getByRole("button", { name: "Request sent", exact: true })
    .waitFor();
  await waiter.goto(origin + "/waiterDashboard/requests");
  await waiter
    .getByRole("button", { name: "Complete request", exact: true })
    .first()
    .click();
  await waiter
    .getByRole("button", { name: "Complete request", exact: true })
    .waitFor({ state: "detached" });
  // Every admin section is a real reloadable URL.
  for (const section of [
    "overview",
    "orders",
    "menu",
    "tables",
    "requests",
    "staff",
    "reservations",
    "payments",
    "messages",
    "settings",
    "setup",
  ]) {
    await admin.goto(origin + "/restaurantDashboard/" + section);
    await admin.locator(".eh-content h1").waitFor();
    assert.equal(
      await admin.getByRole("alert").count(),
      0,
      `Error in ${section}`,
    );
  }
  await admin.goto(origin + "/restaurantDashboard/overview");
  await admin.locator(".eh-stats").waitFor();
  await screenshot(admin, "admin-desktop");
  await admin.goto(origin + "/restaurantDashboard/pos");
  await admin
    .getByRole("heading", { name: "Point of sale", exact: true })
    .waitFor();
  await admin.getByRole("button", { name: /Creamy mushroom pasta/ }).click();
  await screenshot(admin, "pos-desktop");
  await admin.setViewportSize({ width: 390, height: 844 });
  await screenshot(admin, "pos-mobile");
  assert(
    await admin.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "Mobile POS overflows horizontally",
  );
  await admin
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await admin.getByRole("link", { name: "Team", exact: true }).click();
  await admin.waitForURL("**/staff");
  await admin.locator(".eh-nav-open").waitFor({ state: "detached" });
  assert.equal(
    await admin.locator(".eh-nav-open").count(),
    0,
    "Mobile menu should close after navigation",
  );
  console.log(
    "PASS guest cart reload, order tracking and payment request; all admin URLs; mobile navigation and width",
  );
  const superContext = await browser.newContext({
    viewport: { width: 1365, height: 900 },
  });
  const superPage = await login(superContext, "Super", "super@demo.invalid");
  await screenshot(superPage, "super-admin-desktop");
  const registerContext = await browser.newContext({
    viewport: { width: 1365, height: 900 },
  });
  const registration = await registerContext.newPage();
  watch(registration);
  await registration.goto(origin + "/restaurantReg");
  for (const [label, value] of [
    ["Owner name", "New owner"],
    ["Restaurant name", "New demo restaurant"],
    ["Email address", "new-owner@demo.invalid"],
    ["Phone number", "0000000000"],
    ["Branch name", "Main"],
    ["Restaurant address", "Demo street"],
    ["Password", "EatHubDemo123!"],
    ["Confirm password", "EatHubDemo123!"],
  ])
    await registration.getByLabel(label, { exact: true }).fill(value);
  await registration
    .getByRole("button", { name: "Create restaurant account", exact: true })
    .click();
  await registration.waitForURL("**/restaurantDashboard/setup");
  await registration.locator(".eh-content h1").waitFor();
  assert.equal(await registration.getByRole("alert").count(), 0);
  console.log("PASS restaurant registration and setup redirect");
  assert.deepEqual(errors, [], "Browser exceptions");
  assert.deepEqual(serverErrors, [], "Unexpected server errors");
  console.log(
    "PASS super admin dashboard; no browser exceptions or server 500s",
  );
}
main()
  .catch(async (e) => {
    if (browser) {
      fs.mkdirSync(path.join(front, "e2e-results"), { recursive: true });
      for (const [index, context] of browser.contexts().entries()) {
        const page = context.pages()[0];
        if (page) {
          await page
            .screenshot({
              path: path.join(front, "e2e-results", `failure-${index}.png`),
              fullPage: true,
            })
            .catch(() => {});
          console.error(
            "Browser page:",
            page.url(),
            (await page.locator("body").innerText()).slice(-1800),
          );
        }
      }
    }
    console.error(e.stack);
    console.error(logs);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (web) await new Promise((r) => web.close(r));
    if (api) api.kill("SIGTERM");
  });
