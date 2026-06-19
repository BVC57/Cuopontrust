const CHUNK_PUBLIC_PATH = "server/app/about-us/page.js";
const runtime = require("../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_e9919f._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__f60e6f._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/about-us/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/about-us/page { COMPONENT_0 => \"[project]/app/layout.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/app/not-found.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/app/about-us/page.js [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
