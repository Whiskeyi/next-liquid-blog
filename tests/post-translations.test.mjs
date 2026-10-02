import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import ts from "typescript";
import { validateTranslationPair, writeTranslationSnapshot } from "../scripts/post-translations.mjs";

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-translations-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, "index.md"), '---\ntitle: 中文\ntags: [React]\n---\n# 中文\n\n## 小节\n正文。\n');
  fs.writeFileSync(path.join(directory, "index.en.md"), '---\ntitle: English\ntranslation-status: published\n---\n# English\n\n## Section\nBody.\n');
  writeTranslationSnapshot(directory);
  return directory;
}

test("changes to either language require a fresh paired review", (t) => {
  const directory = fixture(t);
  assert.deepEqual(validateTranslationPair(directory), []);
  for (const name of ["index.md", "index.en.md"]) {
    fs.appendFileSync(path.join(directory, name), "\nAdditional text.\n");
    assert.ok(validateTranslationPair(directory).some((error) => error.includes(`${name} changed`)));
    writeTranslationSnapshot(directory);
    assert.deepEqual(validateTranslationPair(directory), []);
  }
});

test("published heading drift and conflicting shared metadata are rejected", (t) => {
  const directory = fixture(t);
  const file = path.join(directory, "index.en.md");
  fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("## Section", "### Section").replace("title: English", "title: English\ntags: [Vue]"));
  const errors = validateTranslationPair(directory, { checkSnapshot: false });
  assert.ok(errors.some((error) => error.includes("Heading levels/order differ")));
  assert.ok(errors.some((error) => error.includes("Shared field tags differs")));
});

test("removing an English version cannot bypass paired maintenance", (t) => {
  const directory = fixture(t);
  fs.unlinkSync(path.join(directory, "index.en.md"));
  assert.ok(validateTranslationPair(directory).some((error) => error.includes("English version missing")));
});

test("draft translations can have incomplete sections but still require review tracking", (t) => {
  const directory = fixture(t);
  fs.writeFileSync(path.join(directory, "index.en.md"), "---\ntitle: English draft\ntranslation-status: draft\n---\nPlaceholder.\n");
  assert.ok(validateTranslationPair(directory).some((error) => error.includes("index.en.md changed")));
  writeTranslationSnapshot(directory);
  assert.deepEqual(validateTranslationPair(directory), []);
});

test("new:post creates a paired draft, safe YAML titles, shared metadata, and a snapshot", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-new-post-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const script = path.resolve("scripts/create-post.mjs");
  execFileSync(process.execPath, [script, "--", "--title", "中文: 标题", "--title-en", 'Title: "quoted"', "--slug", "paired-post", "--tags", "React,JS: examples"], { cwd: directory });
  const article = path.join(directory, "content", "posts", "paired-post");
  assert.ok(fs.existsSync(path.join(article, "index.md")));
  assert.ok(fs.existsSync(path.join(article, "index.en.md")));
  assert.deepEqual(validateTranslationPair(article), []);
  assert.match(fs.readFileSync(path.join(article, "index.en.md"), "utf8"), /translation-status: draft/);
  assert.throws(() => execFileSync(process.execPath, [script, "--title", "Overwrite", "--slug", "paired-post"], { cwd: directory, stdio: "pipe" }));
});

test("article loading inherits metadata, refreshes either language, and hides unfinished translations", async (t) => {
  const root = process.cwd();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-post-loader-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const article = path.join(directory, "content", "posts", "paired-post");
  fs.mkdirSync(article, { recursive: true });
  const original = path.join(article, "index.md");
  const english = path.join(article, "index.en.md");
  fs.writeFileSync(original, '---\ntitle: 中文\ndate: 2026-01-01\ntags: [React]\n---\n# 中文\n\n## 小节\n原文。\n');
  const published = '---\ntitle: English\ntranslation-status: published\n---\n# English\n\n## Section\nTranslated body.\n';
  fs.writeFileSync(english, published);

  // Load the real TypeScript modules with aliases resolved, in an isolated content root.
  const modules = new Map();
  function moduleUrl(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    let output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
    output = output.replace(/from "@\/([^"]+)"/g, (_, dependency) => `from "${moduleUrl(`${dependency}.ts`)}"`);
    output = output.replace('from "gray-matter"', `from "${import.meta.resolve("gray-matter")}"`);
    const url = `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
    modules.set(relative, url);
    return url;
  }
  let posts;
  process.chdir(directory);
  try {
    posts = await import(moduleUrl("lib/posts.ts"));
    assert.equal(posts.getAllPosts().length, 1);
    assert.equal(posts.getPostBySlug("paired-post").language, "zh-CN");
    assert.equal(posts.getPostBySlug("paired-post", "en").language, "en");
    assert.deepEqual(posts.getPostBySlug("paired-post", "en").tags, ["React"]);
    assert.deepEqual(posts.getPostBySlug("paired-post", "en").headings.map(({ id }) => id), posts.getPostBySlug("paired-post").headings.map(({ id }) => id));

    fs.appendFileSync(english, "Additional translated text.\n");
    assert.match(posts.getPostBySlug("paired-post", "en").content, /Additional translated text/);
    fs.writeFileSync(original, fs.readFileSync(original, "utf8").replace("title: 中文", "title: 新中文标题"));
    assert.equal(posts.getAllPosts()[0].title, "新中文标题");
    assert.equal(posts.getAllPosts()[0].translations.en.title, "English");

    fs.writeFileSync(english, published.replace("published", "draft"));
    assert.equal(posts.getPostBySlug("paired-post", "en").language, "zh-CN");
    assert.equal(posts.getAllPosts()[0].translations, undefined);
    fs.unlinkSync(english);
    assert.equal(posts.getPostBySlug("paired-post", "en").language, "zh-CN");
    fs.writeFileSync(english, published);
    assert.equal(posts.getPostBySlug("paired-post", "en").language, "en");
  } finally {
    process.chdir(root);
  }
});
