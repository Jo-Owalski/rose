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

const email = process.argv[2]?.trim();

if (!email) {
  throw new Error("Usage: npm run promote:admin -- admin@example.com");
}

const env = { ...readLocalEnv(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { data, error } = await supabase.auth.admin.listUsers();

if (error) {
  throw new Error(`Could not list users: ${error.message}`);
}

const user = data.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());

if (!user) {
  throw new Error(`No Supabase Auth user found for ${email}`);
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: user.id,
  role: "admin"
});

if (profileError) {
  throw new Error(`Could not promote user: ${profileError.message}`);
}

console.log(`Admin profile ready for ${email}.`);
