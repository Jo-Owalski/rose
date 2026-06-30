import { NextResponse } from "next/server";
import { createPublicSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";

type IncomingItem = {
  productId: string;
  name: string;
  productType: string;
  quantity: number;
  unitPriceCents?: number;
  startingPriceCents?: number;
  customNotes?: string;
};

type IncomingOrder = {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  preferredLanguage: "en" | "fr";
  fulfillmentMethod: "pickup" | "delivery";
  deliveryAddress?: string;
  preferredDatetime?: string;
  customerNotes?: string;
  subtotalCents: number;
  sentVia: "whatsapp" | "email";
  items: IncomingItem[];
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function itemUnitPrice(item: IncomingItem) {
  return item.unitPriceCents ?? item.startingPriceCents ?? 0;
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient() ?? createPublicSupabaseClient();
  const payload = (await request.json()) as IncomingOrder;

  if (!payload.customerName || !payload.items?.length) {
    return NextResponse.json({ error: "Missing customer name or cart items" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ saved: false, reason: "Supabase is not configured" }, { status: 200 });
  }

  const { data: order, error: orderError } = await supabase
    .from("order_requests")
    .insert({
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone || null,
      customer_email: payload.customerEmail || null,
      preferred_language: payload.preferredLanguage,
      fulfillment_method: payload.fulfillmentMethod,
      delivery_address: payload.fulfillmentMethod === "delivery" ? payload.deliveryAddress || null : null,
      preferred_datetime: payload.preferredDatetime || null,
      customer_notes: payload.customerNotes || null,
      subtotal_cents: payload.subtotalCents,
      currency: "CAD",
      sent_via: payload.sentVia
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Order request could not be saved" }, { status: 500 });
  }

  const orderItems = payload.items.map((item) => {
    const unitPrice = itemUnitPrice(item);
    return {
      order_request_id: order.id,
      product_id: uuidPattern.test(item.productId) ? item.productId : null,
      product_name_snapshot: item.name,
      product_type_snapshot: item.productType,
      quantity: item.quantity,
      unit_price_cents: unitPrice,
      line_total_cents: unitPrice * item.quantity,
      custom_notes: item.customNotes || null
    };
  });

  const { error: itemsError } = await supabase.from("order_request_items").insert(orderItems);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ saved: true, orderId: order.id });
}
