import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const preferences = JSON.parse(await read("preferences.json"));
test("preferences.json is empty so Sine delegates to the settings page", () => {
  assert.deepEqual(preferences, []);
});
