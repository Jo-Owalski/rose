"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus, updateOrderWorkflow, type OrderStatus, type PaymentStatus } from "@/lib/orders";
import type { Locale } from "@/lib/i18n";
import { requireAdminUser } from "@/lib/supabase/auth";

export async function updateOrderStatusAction(orderId: string, status: OrderStatus, locale: Locale) {
  await requireAdminUser();
  await updateOrderStatus(orderId, status);
  revalidatePath(`/${locale}/admin/orders`);
}

export type OrderWorkflowState = {
  error?: string;
  saved?: boolean;
};

function cents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

export async function updateOrderWorkflowAction(_state: OrderWorkflowState, formData: FormData): Promise<OrderWorkflowState> {
  const locale = String(formData.get("locale") ?? "en") as Locale;

  try {
    await requireAdminUser();
    await updateOrderWorkflow({
      orderId: String(formData.get("orderId") ?? ""),
      finalTotalCents: cents(formData.get("finalTotal")),
      paymentStatus: String(formData.get("paymentStatus") ?? "pending") as PaymentStatus,
      adminNotes: String(formData.get("adminNotes") ?? "").trim(),
      fulfillmentNotes: String(formData.get("fulfillmentNotes") ?? "").trim(),
      confirmedAt: String(formData.get("confirmedAt") ?? "") || null
    });
    revalidatePath(`/${locale}/admin/orders`);
    return { saved: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de sauvegarder le suivi de commande."
            : "Could not save order workflow."
    };
  }
}
