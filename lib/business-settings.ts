import { createPublicSupabaseClient, createServiceSupabaseClient } from "./supabase/server";

export type BusinessSettings = {
  whatsappNumber: string;
  orderEmail: string;
  pickupInstructions: string;
};

export const defaultBusinessSettings: BusinessSettings = {
  whatsappNumber: "15140000000",
  orderEmail: "orders@example.com",
  pickupInstructions: ""
};

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

type BusinessSettingsRow = {
  whatsapp_number: string | null;
  order_email: string | null;
  pickup_instructions: string | null;
};

function mapBusinessSettings(row: BusinessSettingsRow | null): BusinessSettings {
  if (!row) return defaultBusinessSettings;
  return {
    whatsappNumber: row.whatsapp_number ?? defaultBusinessSettings.whatsappNumber,
    orderEmail: row.order_email ?? defaultBusinessSettings.orderEmail,
    pickupInstructions: row.pickup_instructions ?? defaultBusinessSettings.pickupInstructions
  };
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return defaultBusinessSettings;

  const { data, error } = await supabase
    .from("business_settings")
    .select("whatsapp_number, order_email, pickup_instructions")
    .eq("id", "main")
    .maybeSingle();

  if (error) return defaultBusinessSettings;
  return mapBusinessSettings(data as BusinessSettingsRow | null);
}

export async function updateBusinessSettings(settings: BusinessSettings) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured");

  const { error } = await supabase.from("business_settings").upsert({
    id: "main",
    whatsapp_number: normalizeWhatsAppNumber(settings.whatsappNumber),
    order_email: settings.orderEmail.trim(),
    pickup_instructions: settings.pickupInstructions.trim(),
    updated_at: new Date().toISOString()
  });

  if (error) throw new Error(error.message);
}
