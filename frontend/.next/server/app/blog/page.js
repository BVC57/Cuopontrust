const CHUNK_PUBLIC_PATH = "server/app/blog/page.js";
const runtime = require("../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_next_dist_afc2d6._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__6fe7c5._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/blog/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/blog/page { COMPONENT_0 => \"[project]/app/layout.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/app/not-found.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/app/blog/page.js [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
