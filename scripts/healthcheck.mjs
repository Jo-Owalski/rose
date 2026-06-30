import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readLocalEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");
          return [key, value];
        })
    );
  } catch {
    return {};
  }
}

function report(name, ok, detail = "") {
  const marker = ok ? "OK" : "FAIL";
  console.log(`${marker} ${name}${detail ? ` - ${detail}` : ""}`);
  return ok;
}

const env = { ...readLocalEnv(), ...process.env };
const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
let passed = true;

for (const key of requiredEnv) {
  passed = report(`env ${key}`, Boolean(env[key])) && passed;
}

if (!passed) process.exit(1);

const publicSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const serviceSupabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const tableChecks = [
  ["categories", "id"],
  ["products", "id"],
  ["product_images", "id"],
  ["order_requests", "id"],
  ["order_request_items", "id"],
  ["profiles", "id"],
  ["business_settings", "id"],
  ["social_posts", "id"]
];

for (const [table, column] of tableChecks) {
  const { error, count } = await serviceSupabase.from(table).select(column, { count: "exact", head: true });
  passed = report(`table ${table}`, !error, error?.message ?? `${count ?? 0} rows`) && passed;
}

const { data: settings, error: settingsError } = await publicSupabase
  .from("business_settings")
  .select("id, whatsapp_number, order_email")
  .eq("id", "main")
  .maybeSingle();

passed =
  report(
    "business settings public read",
    !settingsError && Boolean(settings),
    settingsError?.message ?? `email ${settings?.order_email ?? "missing"}`
  ) && passed;

const { data: bucket, error: bucketError } = await serviceSupabase.storage.getBucket("rose-media");
passed = report("storage bucket rose-media", !bucketError && Boolean(bucket), bucketError?.message ?? "ready") && passed;

const { error: workflowError } = await serviceSupabase
  .from("order_requests")
  .select("id, final_total_cents, payment_status, admin_notes, fulfillment_notes, confirmed_at", {
    count: "exact",
    head: true
  });
passed = report("order workflow columns", !workflowError, workflowError?.message ?? "ready") && passed;

const { data: profiles, error: profilesError } = await serviceSupabase
  .from("profiles")
  .select("id, role")
  .eq("role", "admin")
  .limit(1);
passed = report("admin profile exists", !profilesError && Boolean(profiles?.length), profilesError?.message ?? `${profiles?.length ?? 0} found`) && passed;

const { error: orderExportError, count: orderExportCount } = await serviceSupabase
  .from("order_requests")
  .select("id", { count: "exact", head: true });
passed = report("orders export source", !orderExportError, orderExportError?.message ?? `${orderExportCount ?? 0} orders`) && passed;

if (!passed) {
  console.log("Healthcheck failed. Check the failed items above.");
  process.exit(1);
}

console.log("Rose healthcheck passed.");
