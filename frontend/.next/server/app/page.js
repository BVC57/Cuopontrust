const CHUNK_PUBLIC_PATH = "server/app/page.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_next_dist_cdc130._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__65accb._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/page/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-page.js?page=/page { COMPONENT_0 => \"[project]/app/layout.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_1 => \"[project]/app/not-found.js [app-rsc] (ecmascript, Next.js server component)\", COMPONENT_2 => \"[project]/app/page.js [app-rsc] (ecmascript, Next.js server component)\" } [app-rsc] (ecmascript) <facade>", CHUNK_PUBLIC_PATH).exports;
