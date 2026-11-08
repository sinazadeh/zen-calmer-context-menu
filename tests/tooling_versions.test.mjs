import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The repository has no package.json: the tool versions are written out in
// CI and in the docs, and must agree.
const FILES = [
  ".github/workflows/eslint.yml",
  ".github/workflows/prettier.yml",
  "AGENTS.md",
  "CONTRIBUTING.md",
  ".claude/agents/zcm-checks-runner.md",
  ".claude/skills/zcm-ci-workflows/SKILL.md",
];
const PINNED = /(?<![\w/-])(@eslint\/js|eslint|globals|prettier)@(\d[\w.]*)/g;

test("every file pins the same version of each development tool", async () => {
  const versions = new Map();
  for (const file of FILES) {
    const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    for (const [, tool, version] of text.matchAll(PINNED)) {
      if (!versions.has(tool)) versions.set(tool, new Map());
      versions.get(tool).set(file, version);
    }
  }
  assert.deepEqual([...versions.keys()].sort(), [
    "@eslint/js",
    "eslint",
    "globals",
    "prettier",
  ]);
  for (const [tool, byFile] of versions) {
    assert.equal(new Set(byFile.values()).size, 1, `${tool}: ${[...byFile]}`);
  }
});
