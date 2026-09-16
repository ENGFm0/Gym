/**
 * Writes the in-app legal text out as markdown for the store listings and the
 * hosted pages, so there is one source and not two that drift apart.
 *
 *   node scripts/legal-docs.mjs
 */
import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../../docs/legal");

const bundle = await build({
  entryPoints: [resolve(here, "../src/lib/legal.ts")],
  bundle: true,
  format: "esm",
  write: false,
  platform: "neutral"
});

const module = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

await mkdir(out, { recursive: true });

for (const document of Object.values(module.DOCUMENTS)) {
  for (const lang of ["ar", "en"]) {
    const title = lang === "ar" ? document.titleAr : document.titleEn;
    const updated = lang === "ar" ? `آخر تحديث: ${document.updated}` : `Last updated: ${document.updated}`;
    const body = document.sections
      .map((section) => {
        const heading = lang === "ar" ? section.titleAr : section.titleEn;
        const lines = lang === "ar" ? section.bodyAr : section.bodyEn;
        return `## ${heading}\n\n${lines.join("\n\n")}`;
      })
      .join("\n\n");

    const file = resolve(out, `${document.id}-${lang}.md`);
    await writeFile(file, `# ${title}\n\n_${updated}_\n\n${body}\n`);
    console.log(`wrote docs/legal/${document.id}-${lang}.md`);
  }
}
