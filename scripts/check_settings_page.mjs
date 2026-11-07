// Opens the settings page outside Zen, on its sample data, in Playwright's
// browsers: screenshots it in a light and a dark theme at a wide and a narrow
// width, and fails on console errors, a horizontal scrollbar, an empty list or
// a switch that doesn't hide its row. Not part of CI; Playwright is installed
// ad hoc (the repository has no package.json on purpose):
//
//   npm install --no-save --package-lock=false playwright
//   npx playwright install chromium
//   node scripts/check_settings_page.mjs [--browser=chromium|firefox|webkit] [--out=<dir>]
//
// Screenshots go to .cache/screenshots/ unless --out says otherwise. This
// checks the page's own markup and styles; whatever needs Zen's privileges
// (the real catalog, preferences, backups) is covered by check_menus.mjs and
// the manual checks in zcm-browser-validation.

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PAGE_URL = `${pathToFileURL(join(ROOT, "context-menu", "settings.html"))}#tabContextMenu`;

const THEMES = ["light", "dark"];
const VIEWPORTS = [
  { name: "wide", width: 1280, height: 900 },
  { name: "narrow", width: 480, height: 900 },
];

const args = new Map(
  process.argv
    .slice(2)
    .map((arg) => /^--([^=]+)(?:=(.*))?$/.exec(arg))
    .filter(Boolean)
    .map((match) => [match[1], match[2] ?? "true"]),
);
const browserName = args.get("browser") ?? "chromium";
const outDir = resolve(args.get("out") ?? join(ROOT, ".cache", "screenshots"));

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.error(
    "Playwright isn't installed. Run:\n" +
      "  npm install --no-save --package-lock=false playwright\n" +
      `  npx playwright install ${browserName}`,
  );
  process.exit(2);
}
const browserType = playwright[browserName];
if (!browserType) {
  console.error(`Unknown browser "${browserName}".`);
  process.exit(2);
}

await mkdir(outDir, { recursive: true });
const browser = await browserType.launch();
const failures = [];

try {
  for (const colorScheme of THEMES) {
    for (const viewport of VIEWPORTS) {
      const label = `${colorScheme}/${viewport.name}`;
      const context = await browser.newContext({
        colorScheme,
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      const problems = [];
      page.on("pageerror", (error) => problems.push(`page error: ${error}`));
      page.on("console", (message) => {
        // Zen's own icons (chrome://) can't load outside Zen.
        if (
          message.type() === "error" &&
          !/chrome:\/\/|Not allowed to load local resource/.test(message.text())
        ) {
          problems.push(`console error: ${message.text()}`);
        }
      });

      await page.goto(PAGE_URL);
      await page
        .locator(".row input.switch")
        .first()
        .waitFor({ timeout: 10_000 });

      const heading = (await page.locator("#menu-name").textContent())?.trim();
      if (!heading) {
        problems.push("the menu heading is empty");
      }
      if ((await page.locator("#menu-tabs [role=tab]").count()) === 0) {
        problems.push("no menu tabs");
      }
      if (!(await page.locator("#sample-note").isVisible())) {
        problems.push("the sample-data note isn't shown outside Zen");
      }
      const overflow = await page.evaluate(
        "document.documentElement.scrollWidth - window.innerWidth",
      );
      if (overflow > 0) {
        problems.push(`the page scrolls sideways by ${overflow}px`);
      }

      // Switching an item off marks its row off; switching it back on undoes it.
      // The list is rebuilt on every change, so pin the switch by its key.
      const key = await page
        .locator(".row input.switch:not([disabled]):checked")
        .first()
        .getAttribute("data-key");
      const toggle = page
        .locator(".row input.switch")
        .and(page.locator(`[data-key=${JSON.stringify(key)}]`));
      const row = toggle.locator(
        "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' row ')][1]",
      );
      await toggle.uncheck();
      if (!/\boff\b/.test((await row.getAttribute("class")) ?? "")) {
        problems.push("switching an item off didn't mark its row off");
      }
      await toggle.check();
      if (/\boff\b/.test((await row.getAttribute("class")) ?? "")) {
        problems.push("switching an item back on left its row off");
      }

      const file = join(outDir, `settings-${colorScheme}-${viewport.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${problems.length ? "FAIL" : "ok  "} ${label}  ${file}`);
      for (const problem of problems) {
        console.error(`  ${problem}`);
        failures.push(`${label}: ${problem}`);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

if (failures.length > 0) {
  process.exitCode = 1;
}
