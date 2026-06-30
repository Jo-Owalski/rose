import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { getAdminOrdersForExport, type OrderStatus } from "@/lib/orders";

const statuses: OrderStatus[] = ["new", "contacted", "confirmed", "cancelled", "completed"];

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function money(cents: number | null) {
  return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
}

function status(value: string | null) {
  return value && statuses.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function fulfillment(value: string | null) {
  return value === "pickup" || value === "delivery" ? value : undefined;
}

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const orders = await getAdminOrdersForExport({
    status: status(url.searchParams.get("status")),
    fulfillmentMethod: fulfillment(url.searchParams.get("method")),
    search: url.searchParams.get("q") ?? undefined,
    dateFrom: url.searchParams.get("from") ?? undefined,
    dateTo: url.searchParams.get("to") ?? undefined
  });

  const headers = [
    "Created at",
    "Customer",
    "Phone",
    "Email",
    "Language",
    "Method",
    "Delivery address",
    "Preferred datetime",
    "Status",
    "Payment status",
    "Sent via",
    "Estimated total",
    "Final total",
    "Customer notes",
    "Admin notes",
    "Fulfillment notes",
    "Confirmed at",
    "Items"
  ];

  const rows = orders.map((order) => [
    order.createdAt,
    order.customerName,
    order.customerPhone,
    order.customerEmail,
    order.preferredLanguage,
    order.fulfillmentMethod,
    order.deliveryAddress,
    order.preferredDatetime,
    order.status,
    order.paymentStatus,
    order.sentVia,
    money(order.subtotalCents),
    money(order.finalTotalCents),
    order.customerNotes,
    order.adminNotes,
    order.fulfillmentNotes,
    order.confirmedAt,
    order.items
      .map((item) => `${item.productName} x${item.quantity}${item.customNotes ? ` (${item.customNotes})` : ""}`)
      .join("; ")
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const filename = `rose-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
