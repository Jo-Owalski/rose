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

const env = { ...readLocalEnv(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase URL, anon key, or service role key in .env.local");
}

const publicSupabase = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const columns = "id, whatsapp_number, order_email, pickup_instructions, updated_at";

const { data: publicRow, error: publicError } = await publicSupabase
  .from("business_settings")
  .select(columns)
  .eq("id", "main")
  .maybeSingle();

if (publicError) {
  console.error("Public read failed.");
  console.error(publicError.message);
  process.exit(1);
}

console.log("Public read OK.");
console.log(
  publicRow
    ? {
        id: publicRow.id,
        whatsappConfigured: Boolean(publicRow.whatsapp_number),
        orderEmail: publicRow.order_email,
        hasPickupInstructions: Boolean(publicRow.pickup_instructions)
      }
    : "No main row yet."
);

const fallbackRow = {
  id: "main",
  whatsapp_number: publicRow?.whatsapp_number ?? "15140000000",
  order_email: publicRow?.order_email ?? "orders@example.com",
  pickup_instructions: publicRow?.pickup_instructions ?? "",
  updated_at: new Date().toISOString()
};

const { error: upsertError } = await serviceSupabase.from("business_settings").upsert(fallbackRow);

if (upsertError) {
  console.error("Service upsert failed.");
  console.error(upsertError.message);
  process.exit(1);
}

console.log("Service upsert OK.");

const { data: verifiedRow, error: verifyError } = await publicSupabase
  .from("business_settings")
  .select(columns)
  .eq("id", "main")
  .maybeSingle();

if (verifyError || !verifiedRow) {
  console.error("Verification read failed.");
  console.error(verifyError?.message ?? "No main row found after upsert.");
  process.exit(1);
}

console.log("Verification OK.");
console.log({
  id: verifiedRow.id,
  whatsappConfigured: Boolean(verifiedRow.whatsapp_number),
  orderEmail: verifiedRow.order_email,
  hasPickupInstructions: Boolean(verifiedRow.pickup_instructions)
});
