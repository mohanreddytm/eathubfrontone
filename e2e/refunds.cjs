// Build first. Starts a disposable matching backend; no real refunds or database.
const { chromium } = require("playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const { spawn } = require("node:child_process");
const assert = require("node:assert/strict");
const front = path.resolve(__dirname, "..");
const backend =
  process.env.EATHUB_BACKEND_DIR ||
  path.resolve(front, "../../backend/eathubbackend");
const origin = "http://localhost:3000";
let api,
  web,
  browser,
  logs = "";
const errors = [];
async function main() {
  assert(
    fs.existsSync(path.join(front, "build/index.html")),
    "Run npm run build first",
  );
  api = spawn(process.execPath, ["test/refund-browser-server.js"], {
    cwd: backend,
    env: { ...process.env, NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  api.stdout.on("data", (d) => {
    logs += d;
  });
  api.stderr.on("data", (d) => {
    logs += d;
  });
  const deadline = Date.now() + 30000;
  while (true) {
    if (api.exitCode !== null) throw new Error(logs);
    try {
      if (
        (await fetch("http://127.0.0.1:8000/health")).ok &&
        logs.includes("fixture ready")
      )
        break;
    } catch {}
    if (Date.now() > deadline)
      throw new Error("Fixture startup timed out: " + logs);
    await new Promise((r) => setTimeout(r, 200));
  }
  const build = path.join(front, "build");
  web = http.createServer((req, res) => {
    let file = path.resolve(build, "." + new URL(req.url, origin).pathname);
    if (
      !file.startsWith(build + path.sep) ||
      !fs.existsSync(file) ||
      !fs.statSync(file).isFile()
    )
      file = path.join(build, "index.html");
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
      }[path.extname(file)] || "application/octet-stream",
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
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 500 && r.url().includes(":8000"))
      errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(origin + "/login");
  await page.getByRole("button", { name: "Admin", exact: true }).click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("admin@demo.invalid");
  await page.getByLabel("Password", { exact: true }).fill("EatHubDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/restaurantDashboard/);
  await page.goto(origin + "/restaurantDashboard/pos/refund-order");
  await page.getByRole("button", { name: "Refund", exact: true }).click();
  await page.getByLabel("Selected items", { exact: true }).check();
  await page.getByLabel("Return quantity: Garden meal").selectOption("1");
  await page.getByLabel("Reason for refund").fill("One dish returned");
  await page.getByRole("checkbox").check();
  const shots = path.join(front, "e2e-results");
  fs.mkdirSync(shots, { recursive: true });
  await page.screenshot({ path: path.join(shots, "refund-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
      document.body.dataset.theme = theme;
    }, theme);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Page overflow",
    );
    assert(
      await page
        .locator("dialog")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
      "Dialog overflow",
    );
    await page.screenshot({
      path: path.join(shots, `refund-mobile-${theme}.png`),
    });
  }
  await page.getByRole("button", { name: "Confirm refund ₹94.50" }).click();
  await page.getByText("Refund pending", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Check status" }).click();
  await page.getByText("Refund processed", { exact: true }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: "Refund", exact: true }).click();
  await page.getByLabel("Reason for refund").fill("Remaining items returned");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm refund ₹141.75" }).click();
  await page
    .getByText("This order has been fully refunded.", { exact: true })
    .waitFor();
  const jwt = require(path.join(backend, "node_modules/jsonwebtoken"));
  const token = jwt.sign(
    {
      role: "guest",
      userId: "refund-guest",
      restaurantId: "refund-demo",
      tableId: "refund-table",
    },
    "browser-refund-test-secret-at-least-thirty-two-bytes",
    {
      algorithm: "HS256",
      issuer: "eathub",
      audience: "eathub-api",
      expiresIn: "1h",
    },
  );
  const guestContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await guestContext.addInitScript(
    (token) =>
      sessionStorage.setItem("eathub-guest:refund-demo:refund-table", token),
    token,
  );
  const guest = await guestContext.newPage();
  guest.on("pageerror", (e) => errors.push(e.message));
  await guest.goto(
    origin + "/customerDashboard/refund-table/refund-demo/orders/refund-order",
  );
  await guest
    .getByText(
      "This order has been fully refunded. See the refund details below.",
    )
    .waitFor();
  await guest.getByText("Refund processed", { exact: true }).first().waitFor();
  assert.equal(
    await guest.getByRole("button", { name: "Refund", exact: true }).count(),
    0,
  );
  assert(
    await guest.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Customer page overflow",
  );
  await guest.screenshot({
    path: path.join(shots, "refund-customer-mobile.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real app login, partial refund, pending/status sync, remaining full refund, reload, customer tracking, mobile light/dark. Provider HTTP simulated.",
  );
}
main()
  .catch((e) => {
    console.error(e, logs);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (web) await new Promise((r) => web.close(r));
    if (api) api.kill("SIGTERM");
  });
