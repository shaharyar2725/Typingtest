import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";
import { execSync } from "node:child_process";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

const ESM_BANNER = `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`;

// Some packages may not be bundleable — externalize them.
// Native modules, packages that use dynamic path traversal, etc.
const EXTERNAL = [
  "*.node",
  "sharp",
  "better-sqlite3",
  "sqlite3",
  "canvas",
  "bcrypt",
  "argon2",
  "fsevents",
  "re2",
  "farmhash",
  "xxhash-addon",
  "bufferutil",
  "utf-8-validate",
  "ssh2",
  "cpu-features",
  "dtrace-provider",
  "isolated-vm",
  "lightningcss",
  "pg-native",
  "oracledb",
  "mongodb-client-encryption",
  "nodemailer",
  "handlebars",
  "knex",
  "typeorm",
  "protobufjs",
  "onnxruntime-node",
  "@tensorflow/*",
  "@prisma/client",
  "@mikro-orm/*",
  "@grpc/*",
  "@swc/*",
  "@aws-sdk/*",
  "@azure/*",
  "@opentelemetry/*",
  "@google-cloud/*",
  "@google/*",
  "googleapis",
  "firebase-admin",
  "@parcel/watcher",
  "@sentry/profiling-node",
  "@tree-sitter/*",
  "aws-sdk",
  "classic-level",
  "dd-trace",
  "ffi-napi",
  "grpc",
  "hiredis",
  "kerberos",
  "leveldown",
  "miniflare",
  "mysql2",
  "newrelic",
  "odbc",
  "piscina",
  "realm",
  "ref-napi",
  "rocksdb",
  "sass-embedded",
  "sequelize",
  "serialport",
  "snappy",
  "tinypool",
  "usb",
  "workerd",
  "wrangler",
  "zeromq",
  "zeromq-prebuilt",
  "playwright",
  "puppeteer",
  "puppeteer-core",
  "electron",
];

async function buildAll() {
  const workspaceRoot = path.resolve(artifactDir, "../..");

  // Generate lib declaration files (.d.ts) so TypeScript can resolve
  // workspace package types on fresh clones (e.g. Vercel CI).
  // --force bypasses .tsbuildinfo cache so dist files are always emitted.
  console.log("Building lib declarations (tsc --build --force)…");
  execSync("node_modules/.bin/tsc --build --force", { cwd: workspaceRoot, stdio: "inherit" });

  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  // Standalone server bundle (used by Replit / Docker / self-hosted).
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: EXTERNAL,
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging — use plugin instead of externalizing.
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
    // Make sure CJS-only packages (e.g. express) work inside our ESM output.
    banner: { js: ESM_BANNER },
  });

  // Vercel serverless bundle — pre-compiled so Vercel's TypeScript step never
  // runs on workspace source files and hits the rootDir/emit-skipped error.
  // Output goes to api/index.js; vercel.json references this JS file directly.
  console.log("Building Vercel serverless bundle…");
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/serverless.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(artifactDir, "api/index.js"),
    logLevel: "info",
    external: EXTERNAL,
    sourcemap: "linked",
    banner: { js: ESM_BANNER },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
