"use client";

import { useActionState, useState } from "react";
import type { Locale } from "@/lib/i18n";

type ActionState = {
  error?: string;
  archived?: boolean;
  deleted?: boolean;
};

export function AdminConfirmAction({
  action,
  confirmLabel,
  cancelLabel = "Cancel",
  id,
  label,
  locale,
  title,
  variant = "danger"
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  cancelLabel?: string;
  confirmLabel: string;
  id: string;
  label: string;
  locale: Locale;
  title: string;
  variant?: "danger" | "warning";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <>
      <button className={`icon-button ${variant}`} onClick={() => setIsOpen(true)} title={title} type="button">
        {label}
      </button>
      {isOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal confirm" role="dialog" aria-modal="true" aria-labelledby={`confirm-${id}`}>
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{title}</p>
                <h2 id={`confirm-${id}`}>{confirmLabel}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsOpen(false)} type="button">
                {cancelLabel}
              </button>
            </div>
            <form action={formAction} className="settings-actions">
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={id} />
              {state.error && <p className="form-error">{state.error}</p>}
              <button className="button danger" disabled={isPending} type="submit">
                {title}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
