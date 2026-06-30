import { createServiceSupabaseClient } from "./supabase/server";

export type OrderStatus = "new" | "contacted" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "refunded";

export type AdminOrderItem = {
  id: string;
  productName: string;
  productType: string;
  quantity: number;
  unitPriceCents: number | null;
  lineTotalCents: number | null;
  customNotes: string | null;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  preferredLanguage: "en" | "fr";
  fulfillmentMethod: "pickup" | "delivery";
  deliveryAddress: string | null;
  preferredDatetime: string | null;
  customerNotes: string | null;
  subtotalCents: number | null;
  currency: string;
  status: OrderStatus;
  sentVia: "whatsapp" | "email" | null;
  finalTotalCents: number | null;
  paymentStatus: PaymentStatus;
  adminNotes: string | null;
  fulfillmentNotes: string | null;
  confirmedAt: string | null;
  createdAt: string;
  items: AdminOrderItem[];
};

export type AdminOrdersResult = {
  orders: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminOrderFilters = {
  dateFrom?: string;
  dateTo?: string;
  fulfillmentMethod?: "pickup" | "delivery";
  search?: string;
  status?: OrderStatus;
};

const orderSelect =
  "id, customer_name, customer_phone, customer_email, preferred_language, fulfillment_method, delivery_address, preferred_datetime, customer_notes, subtotal_cents, currency, status, sent_via, created_at, order_request_items(id, product_name_snapshot, product_type_snapshot, quantity, unit_price_cents, line_total_cents, custom_notes)";
const orderWorkflowSelect =
  "id, customer_name, customer_phone, customer_email, preferred_language, fulfillment_method, delivery_address, preferred_datetime, customer_notes, subtotal_cents, currency, status, sent_via, final_total_cents, payment_status, admin_notes, fulfillment_notes, confirmed_at, created_at, order_request_items(id, product_name_snapshot, product_type_snapshot, quantity, unit_price_cents, line_total_cents, custom_notes)";

type OrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  preferred_language: "en" | "fr";
  fulfillment_method: "pickup" | "delivery";
  delivery_address: string | null;
  preferred_datetime: string | null;
  customer_notes: string | null;
  subtotal_cents: number | null;
  currency: string | null;
  status: OrderStatus;
  sent_via: "whatsapp" | "email" | null;
  final_total_cents?: number | null;
  payment_status?: PaymentStatus | null;
  admin_notes?: string | null;
  fulfillment_notes?: string | null;
  confirmed_at?: string | null;
  created_at: string;
  order_request_items?: Array<{
    id: string;
    product_name_snapshot: string;
    product_type_snapshot: string;
    quantity: number;
    unit_price_cents: number | null;
    line_total_cents: number | null;
    custom_notes: string | null;
  }>;
};

function mapOrder(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    preferredLanguage: row.preferred_language,
    fulfillmentMethod: row.fulfillment_method,
    deliveryAddress: row.delivery_address,
    preferredDatetime: row.preferred_datetime,
    customerNotes: row.customer_notes,
    subtotalCents: row.subtotal_cents,
    currency: row.currency ?? "CAD",
    status: row.status,
    sentVia: row.sent_via,
    finalTotalCents: row.final_total_cents ?? null,
    paymentStatus: row.payment_status ?? "pending",
    adminNotes: row.admin_notes ?? null,
    fulfillmentNotes: row.fulfillment_notes ?? null,
    confirmedAt: row.confirmed_at ?? null,
    createdAt: row.created_at,
    items: (row.order_request_items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name_snapshot,
      productType: item.product_type_snapshot,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      lineTotalCents: item.line_total_cents,
      customNotes: item.custom_notes
    }))
  };
}

export async function getAdminOrders({
  dateFrom,
  dateTo,
  fulfillmentMethod,
  page = 1,
  pageSize = 20,
  search,
  status
}: {
  dateFrom?: string;
  dateTo?: string;
  fulfillmentMethod?: "pickup" | "delivery";
  page?: number;
  pageSize?: number;
  search?: string;
  status?: OrderStatus;
} = {}): Promise<AdminOrdersResult> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { orders: [], total: 0, page, pageSize, totalPages: 1 };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const buildQuery = (select: string) => supabase.from("order_requests").select(select, { count: "exact" });
  let query = buildQuery(orderWorkflowSelect);

  if (status) {
    query = query.eq("status", status);
  }

  if (fulfillmentMethod) {
    query = query.eq("fulfillment_method", fulfillmentMethod);
  }

  if (dateFrom) {
    query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`);
  }

  if (dateTo) {
    query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
  }

  const safeSearch = search?.trim();
  if (safeSearch) {
    const escaped = safeSearch.replace(/[%_]/g, "\\$&");
    query = query.or(
      `customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%,customer_email.ilike.%${escaped}%`
    );
  }

  let { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error?.message.includes("final_total_cents") || error?.message.includes("payment_status")) {
    let fallbackQuery = buildQuery(orderSelect);

    if (status) fallbackQuery = fallbackQuery.eq("status", status);
    if (fulfillmentMethod) fallbackQuery = fallbackQuery.eq("fulfillment_method", fulfillmentMethod);
    if (dateFrom) fallbackQuery = fallbackQuery.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) fallbackQuery = fallbackQuery.lte("created_at", `${dateTo}T23:59:59.999Z`);
    const safeSearch = search?.trim();
    if (safeSearch) {
      const escaped = safeSearch.replace(/[%_]/g, "\\$&");
      fallbackQuery = fallbackQuery.or(
        `customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%,customer_email.ilike.%${escaped}%`
      );
    }

    const fallback = await fallbackQuery.order("created_at", { ascending: false }).range(from, to);
    data = fallback.data;
    error = fallback.error;
    count = fallback.count;
  }

  if (error || !data) return { orders: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 1 };

  const total = count ?? 0;
  return {
    orders: (data as unknown as OrderRow[]).map(mapOrder),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize))
  };
}

export async function getAdminOrdersForExport({
  dateFrom,
  dateTo,
  fulfillmentMethod,
  search,
  status
}: AdminOrderFilters = {}): Promise<AdminOrder[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return [];

  const applyFilters = (query: any) => {
    let nextQuery = query;
    if (status) nextQuery = nextQuery.eq("status", status);
    if (fulfillmentMethod) nextQuery = nextQuery.eq("fulfillment_method", fulfillmentMethod);
    if (dateFrom) nextQuery = nextQuery.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    if (dateTo) nextQuery = nextQuery.lte("created_at", `${dateTo}T23:59:59.999Z`);

    const safeSearch = search?.trim();
    if (safeSearch) {
      const escaped = safeSearch.replace(/[%_]/g, "\\$&");
      nextQuery = nextQuery.or(
        `customer_name.ilike.%${escaped}%,customer_phone.ilike.%${escaped}%,customer_email.ilike.%${escaped}%`
      );
    }
    return nextQuery;
  };

  let query = applyFilters(supabase.from("order_requests").select(orderWorkflowSelect));
  let { data, error } = await query.order("created_at", { ascending: false }).limit(5000);

  if (error?.message.includes("final_total_cents") || error?.message.includes("payment_status")) {
    const fallbackQuery = applyFilters(supabase.from("order_requests").select(orderSelect));
    const fallback = await fallbackQuery.order("created_at", { ascending: false }).limit(5000);
    data = fallback.data;
    error = fallback.error;
  }

  if (error || !data) return [];
  return (data as unknown as OrderRow[]).map(mapOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured");

  const { error } = await supabase.from("order_requests").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function updateOrderWorkflow({
  orderId,
  finalTotalCents,
  paymentStatus,
  adminNotes,
  fulfillmentNotes,
  confirmedAt
}: {
  orderId: string;
  finalTotalCents: number | null;
  paymentStatus: PaymentStatus;
  adminNotes: string;
  fulfillmentNotes: string;
  confirmedAt: string | null;
}) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured");

  const { error } = await supabase
    .from("order_requests")
    .update({
      final_total_cents: finalTotalCents,
      payment_status: paymentStatus,
      admin_notes: adminNotes || null,
      fulfillment_notes: fulfillmentNotes || null,
      confirmed_at: confirmedAt || null
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
