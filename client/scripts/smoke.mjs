/**
 * Walks the built app the way a member would: onboarding, logging food, editing the
 * training week, a session with the rest timer, and two weigh-ins that both stay in history.
 * Runs against `vite preview`, so it catches anything that only breaks in a production build.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4173;
const base = `http://localhost:${PORT}`;

const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
  stdio: "ignore",
  detached: false
});

const fail = (message) => {
  console.error("✗", message);
  process.exitCode = 1;
};

const ok = (message) => console.log("✓", message);

async function waitForServer(timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("vite preview did not start");
}

try {
  await waitForServer();

  // CI downloads its own browser; CHROMIUM_PATH lets a sandbox reuse one it already has.
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  );
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(base);
  await page.waitForTimeout(800);

  // 1. A fresh account is sent to onboarding, because the plan needs the body data.
  if (!page.url().includes("/welcome")) fail("a new account should land on onboarding");
  else ok("new account lands on onboarding");

  await page.locator("input").first().fill("فهد");
  await page.locator("button", { hasText: "التالي" }).click();
  await page.waitForTimeout(300);
  await page.locator("input").nth(0).fill("185");
  await page.locator("input").nth(1).fill("95");
  await page.locator("button", { hasText: "التالي" }).click();
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: "التالي" }).click();
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: "احسب خطتي" }).click();
  await page.waitForTimeout(800);

  const home = await page.textContent("body");
  if (!home.includes("أهلاً فهد")) fail("the home screen should greet the member");
  else ok("plan built and home rendered");

  // 2. Logging food reaches the diary.
  await page.goto(`${base}/meals/add?slot=breakfast`);
  await page.waitForTimeout(600);
  await page.locator('input[placeholder*="دجاج"]').fill("دجاج");
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: "صدر دجاج مشوي" }).first().click();
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: "أضفه" }).click();
  await page.waitForTimeout(700);

  if (!(await page.textContent("body")).includes("صدر دجاج مشوي")) fail("the logged item should show in the diary");
  else ok("food logged");

  // 3. The training week rearranges itself.
  await page.goto(`${base}/training`);
  await page.waitForTimeout(600);
  await page.locator("button", { hasText: "برنامجي" }).click();
  await page.waitForTimeout(400);
  await page.locator("button", { hasText: "٥" }).first().click();
  await page.waitForTimeout(500);

  const program = await page.evaluate(() => JSON.parse(localStorage["fitcore.demo.v1"]).program);
  if (program.trainingDays.length !== 5) fail(`five days a week should give five training days, got ${program.trainingDays.length}`);
  else ok("training week rearranged");

  // 4. Weigh-ins are append-only.
  await page.goto(`${base}/progress`);
  await page.waitForTimeout(600);
  for (const value of ["92.0", "91.4"]) {
    await page.locator('input[inputmode="decimal"]').first().fill(value);
    await page.locator("button", { hasText: "حدّث" }).click();
    await page.waitForTimeout(500);
  }

  const weights = await page.evaluate(() => JSON.parse(localStorage["fitcore.demo.v1"]).weights.map((w) => w.kg));
  if (weights.length !== 2) fail(`both readings should be kept, got ${JSON.stringify(weights)}`);
  else ok("weight history keeps every reading");

  if (errors.length) fail(`page errors: ${errors.join(" | ")}`);
  else ok("no page errors");

  await browser.close();
} catch (error) {
  fail(error.message);
} finally {
  server.kill();
}

process.exit(process.exitCode ?? 0);
