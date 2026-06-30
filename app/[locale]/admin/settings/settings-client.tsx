"use client";

import { Edit, Save } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { normalizeWhatsAppNumber, type BusinessSettings } from "@/lib/business-settings";
import { t, type Locale } from "@/lib/i18n";
import { saveSettingsAction, type SettingsState } from "./actions";

const initialState: SettingsState = {};

export function SettingsClient({ initialSettings, locale }: { initialSettings: BusinessSettings; locale: Locale }) {
  const copy = t(locale).admin;
  const [state, formAction, isPending] = useActionState(saveSettingsAction, initialState);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (state.saved) {
      setSettings((current) => ({
        ...current,
        whatsappNumber: normalizeWhatsAppNumber(current.whatsappNumber)
      }));
    }
  }, [state.saved]);

  function updateField(field: keyof BusinessSettings, value: string) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <section className="panel settings-summary">
        <div>
          <span>{copy.whatsappNumber}</span>
          <strong>{settings.whatsappNumber || "-"}</strong>
        </div>
        <div>
          <span>{copy.orderEmail}</span>
          <strong>{settings.orderEmail || "-"}</strong>
        </div>
        <div className="full">
          <span>{copy.pickupInstructions}</span>
          <p>{settings.pickupInstructions || "-"}</p>
        </div>
        <button className="button primary" onClick={() => setIsModalOpen(true)} type="button">
          <Edit size={17} />
          {copy.editSettings}
        </button>
        {state.saved && <span className="save-status">{copy.savedToSupabase}</span>}
      </section>

      {isModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal small" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{copy.eyebrow}</p>
                <h2 id="settings-modal-title">{copy.settings}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsModalOpen(false)} type="button">
                {copy.close}
              </button>
            </div>

            <form action={formAction} className="form-grid admin-modal-form">
              <input name="locale" type="hidden" value={locale} />
              <label className="field">
                <span>{copy.whatsappNumber}</span>
                <input
                  name="whatsappNumber"
                  placeholder="+1 514 000 0000"
                  value={settings.whatsappNumber}
                  onChange={(event) => updateField("whatsappNumber", event.target.value)}
                />
              </label>
              <label className="field">
                <span>{copy.orderEmail}</span>
                <input
                  name="orderEmail"
                  placeholder="orders@example.com"
                  type="email"
                  value={settings.orderEmail}
                  onChange={(event) => updateField("orderEmail", event.target.value)}
                />
              </label>
              <label className="field full">
                <span>{copy.pickupInstructions}</span>
                <textarea
                  name="pickupInstructions"
                  placeholder={copy.pickupPlaceholder}
                  value={settings.pickupInstructions}
                  onChange={(event) => updateField("pickupInstructions", event.target.value)}
                />
              </label>
              <div className="settings-actions">
                {state.error && <p className="form-error">{state.error}</p>}
                <button className="button primary" disabled={isPending} type="submit">
                  <Save size={17} />
                  {isPending ? copy.savingSettings : copy.saveSettings}
                </button>
                {state.saved && <span className="save-status">{copy.savedToSupabase}</span>}
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
