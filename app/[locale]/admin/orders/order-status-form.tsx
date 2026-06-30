"use client";

import { useTransition } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/orders";
import { updateOrderStatusAction } from "./actions";

const statuses: OrderStatus[] = ["new", "contacted", "confirmed", "cancelled", "completed"];

export function OrderStatusForm({ orderId, status, locale }: { orderId: string; status: OrderStatus; locale: Locale }) {
  const [isPending, startTransition] = useTransition();
  const copy = t(locale).admin;
  const labels = {
    new: copy.statusNew,
    contacted: copy.statusContacted,
    confirmed: copy.statusConfirmed,
    cancelled: copy.statusCancelled,
    completed: copy.statusCompleted
  };

  return (
    <label className="status-select">
      <span>{copy.status}</span>
      <select
        disabled={isPending}
        value={status}
        onChange={(event) => {
          const nextStatus = event.target.value as OrderStatus;
          startTransition(() => updateOrderStatusAction(orderId, nextStatus, locale));
        }}
      >
        {statuses.map((entry) => (
          <option key={entry} value={entry}>
            {labels[entry]}
          </option>
        ))}
      </select>
    </label>
  );
}
