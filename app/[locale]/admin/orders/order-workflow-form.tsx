"use client";

import { ClipboardPen, Save } from "lucide-react";
import { useActionState, useState } from "react";
import type { AdminOrder, PaymentStatus } from "@/lib/orders";
import { formatMoney, t, type Locale } from "@/lib/i18n";
import { updateOrderWorkflowAction, type OrderWorkflowState } from "./actions";

const initialState: OrderWorkflowState = {};
const paymentStatuses: PaymentStatus[] = ["pending", "paid", "refunded"];

function dollars(cents: number | null) {
  return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
}

function datetimeLocal(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function OrderWorkflowForm({ locale, order }: { locale: Locale; order: AdminOrder }) {
  const copy = t(locale).admin;
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateOrderWorkflowAction, initialState);
  const paymentLabels: Record<PaymentStatus, string> = {
    pending: copy.paymentPending,
    paid: copy.paymentPaid,
    refunded: copy.paymentRefunded
  };

  return (
    <>
      <button className="button ghost" onClick={() => setIsOpen(true)} type="button">
        <ClipboardPen size={16} />
        {copy.manageOrder}
      </button>
      {isOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal small" role="dialog" aria-modal="true" aria-labelledby={`workflow-${order.id}`}>
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{copy.orderWorkflow}</p>
                <h2 id={`workflow-${order.id}`}>{order.customerName}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsOpen(false)} type="button">
                {copy.close}
              </button>
            </div>

            <form action={formAction} className="form-grid admin-modal-form">
              <input name="locale" type="hidden" value={locale} />
              <input name="orderId" type="hidden" value={order.id} />
              <label className="field">
                <span>{copy.estimatedTotal}</span>
                <input disabled value={formatMoney(order.subtotalCents ?? undefined, locale)} />
              </label>
              <label className="field">
                <span>{copy.finalTotal}</span>
                <input name="finalTotal" min="0" step="0.01" type="number" defaultValue={dollars(order.finalTotalCents)} />
              </label>
              <label className="field">
                <span>{copy.paymentStatus}</span>
                <select name="paymentStatus" defaultValue={order.paymentStatus}>
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {paymentLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{copy.confirmedAt}</span>
                <input name="confirmedAt" type="datetime-local" defaultValue={datetimeLocal(order.confirmedAt)} />
              </label>
              <label className="field full">
                <span>{copy.adminNotes}</span>
                <textarea name="adminNotes" defaultValue={order.adminNotes ?? ""} />
              </label>
              <label className="field full">
                <span>{copy.fulfillmentNotes}</span>
                <textarea name="fulfillmentNotes" defaultValue={order.fulfillmentNotes ?? ""} />
              </label>
              <div className="settings-actions full">
                {state.error && <p className="form-error">{state.error}</p>}
                <button className="button primary" disabled={isPending} type="submit">
                  <Save size={17} />
                  {isPending ? copy.savingSettings : copy.saveOrderWorkflow}
                </button>
                {state.saved && <span className="save-status">{copy.orderWorkflowSaved}</span>}
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
