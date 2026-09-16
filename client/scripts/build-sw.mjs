/**
 * Writes this build's hashed asset list into the service worker.
 *
 * Vite hashes file names, so the worker cannot know them ahead of time; without the list the
 * first visit caches the shell HTML and none of the JavaScript, and an offline reload shows
 * an empty page. Run after `vite build`.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const swPath = path.join(dist, "sw.js");

const assets = (await readdir(path.join(dist, "assets"), { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => `/assets/${entry.name}`);

const precache = [...assets, "/icon-512.png", "/manifest.webmanifest"];

const source = await readFile(swPath, "utf8");
const banner = `self.__PRECACHE = ${JSON.stringify(precache)};\n`;

await writeFile(swPath, banner + source.replace(/^self\.__PRECACHE = .*\n/, ""), "utf8");

console.log(`service worker precaches ${precache.length} files`);
