import { defineConfig } from "vitest/config";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });
export default defineConfig({ resolve:{alias:{"@":path.resolve(__dirname,".")}}, test:{environment:"node"} });
