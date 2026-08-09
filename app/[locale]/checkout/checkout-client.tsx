""use client";

import { Mail, MessageCircle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { BusinessSettings } from "@/lib/business-settings";
import { useCart } from "@/lib/cart";
import { formatMoney, type Locale, t } from "@/lib/i18n";

type Fulfillment = "pickup" | "delivery";

export function CheckoutClient({ businessSettings, locale }: { businessSettings: BusinessSettings; locale: Locale }) {
  const { items, subtotalCents } = useCart();
  const copy = t(locale);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    preferred: "",
    notes: ""
  });
  const [error, setError] = useState("");

  const message = useMemo(() => {
    const labels =
      locale === "fr"
        ? {
            hello: "Bonjour, je souhaite passer une commande.",
            name: "Nom",
            contact: "Contact",
            method: "Méthode",
            preferred: "Date/heure souhaitée",
            items: "Articles",
            notes: "Notes",
            total: "Total estimé",
            confirm: "Merci de confirmer la disponibilité, le prix final et les détails de ramassage/livraison."
          }
        : {
            hello: "Hello, I would like to place an order.",
            name: "Name",
            contact: "Contact",
            method: "Method",
            preferred: "Preferred date/time",
            items: "Items",
            notes: "Notes",
            total: "Estimated total",
            confirm: "Please confirm availability, final price, and pickup/delivery details."
          };

    const lines = [
      labels.hello,
      "",
      form.name.trim() ? `${labels.name}: ${form.name.trim()}` : "",
      form.phone.trim() || form.email.trim() ? `${labels.contact}: ${form.phone.trim() || form.email.trim()}` : "",
      `${labels.method}: ${fulfillment === "pickup" ? copy.checkout.pickup : copy.checkout.delivery}`,
      fulfillment === "delivery" && form.address.trim() ? `${copy.checkout.address}: ${form.address.trim()}` : "",
      form.preferred ? `${labels.preferred}: ${form.preferred}` : "",
      businessSettings.pickupInstructions && fulfillment === "pickup"
        ? `${locale === "fr" ? "Instructions de ramassage" : "Pickup instructions"}: ${businessSettings.pickupInstructions}`
        : "",
      "",
      `${labels.items}:`,
      ...items.map((item, index) => {
        const price = formatMoney(item.unitPriceCents ?? item.startingPriceCents, locale);
        const itemLines = [`${index + 1}. ${item.name} x${item.quantity} - ${price}`];
        if (item.customNotes) itemLines.push(`   ${labels.notes}: ${item.customNotes}`);
        return itemLines.join("\n");
      }),
      "",
      `${labels.total}: ${formatMoney(subtotalCents, locale)}`,
      form.notes.trim() ? `${labels.notes}: ${form.notes.trim()}` : "",
      "",
      labels.confirm
    ];

    return lines.filter(Boolean).join("\n");
  }, [businessSettings.pickupInstructions, copy.checkout.address, copy.checkout.delivery, copy.checkout.pickup, form, fulfillment, items, locale, subtotalCents]);

  function updateField(field: keyof typeof form, value: string) {
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateCheckout() {
    if (!form.name.trim()) return locale === "fr" ? "Le nom est requis." : "Customer name is required.";
    if (!form.phone.trim() && !form.email.trim()) return locale === "fr" ? "Ajoute un téléphone ou un courriel." : "Add a phone or email.";
    if (!form.preferred) return locale === "fr" ? "La date/heure souhaitée est requise." : "Preferred date/time is required.";
    if (fulfillment === "delivery" && !form.address.trim()) return locale === "fr" ? "L'adresse de livraison est requise." : "Delivery address is required.";
    if (!businessSettings.whatsappNumber && !businessSettings.orderEmail) {
      return locale === "fr" ? "Configure WhatsApp ou le courriel dans Settings." : "Configure WhatsApp or email in Settings.";
    }
    return "";
  }

  async function saveOrder(sentVia: "whatsapp" | "email") {
    await fetch("/api/order-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        preferredLanguage: locale,
        fulfillmentMethod: fulfillment,
        deliveryAddress: form.address,
        preferredDatetime: form.preferred,
        customerNotes: form.notes,
        subtotalCents,
        sentVia,
        items
      })
    });
  }

  async function openWhatsApp(event: FormEvent) {
    event.preventDefault();
    const validationError = validateCheckout();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!businessSettings.whatsappNumber) {
      setError(locale === "fr" ? "Configure le numéro WhatsApp dans Settings." : "Configure the WhatsApp number in Settings.");
      return;
    }
    await saveOrder("whatsapp");
    window.open(`https://wa.me/${businessSettings.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  async function openEmail(event: FormEvent) {
    event.preventDefault();
    const validationError = validateCheckout();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!businessSettings.orderEmail) {
      setError(locale === "fr" ? "Configure le courriel de commande dans Settings." : "Configure the order email in Settings.");
      return;
    }
    await saveOrder("email");
    const subject = locale === "fr" ? "Nouvelle demande de commande Rose" : "New Rose order request";
    window.location.href = `mailto:${businessSettings.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  return (
    <main className="container section checkout-page">
      <section className="section-heading checkout-heading">
        <div>
          <p className="eyebrow">Rose</p>
          <h1>{copy.checkout.title}</h1>
          <p className="lead">{copy.checkout.lead}</p>
        </div>
      </section>

      <form className="detail checkout-detail">
        <section className="panel form-grid checkout-form-panel">
          <label className="field">
            <span>{copy.checkout.name}</span>
            <input required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Marie Dupont" />
          </label>
          <label className="field">
            <span>{copy.checkout.phone}</span>
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="+1 514 000 0000" />
          </label>
          <label className="field">
            <span>{copy.checkout.email}</span>
            <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="marie@example.com" />
          </label>
          <label className="field">
            <span>{copy.checkout.method}</span>
            <select value={fulfillment} onChange={(event) => setFulfillment(event.target.value as Fulfillment)}>
              <option value="pickup">{copy.checkout.pickup}</option>
              <option value="delivery">{copy.checkout.delivery}</option>
            </select>
          </label>
          {fulfillment === "delivery" && (
            <label className="field full">
              <span>{copy.checkout.address}</span>
              <input required value={form.address} onChange={(event) => updateField("address", event.target.value)} />
            </label>
          )}
          <label className="field full">
            <span>{copy.checkout.preferred}</span>
            <input required type="datetime-local" value={form.preferred} onChange={(event) => updateField("preferred", event.target.value)} />
          </label>
          <label className="field full">
            <span>{copy.checkout.notes}</span>
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </label>
          <div className="row-actions checkout-actions">
            {error && <p className="form-error">{error}</p>}
            <button className="button primary" onClick={openWhatsApp} disabled={items.length === 0} type="submit">
              <MessageCircle size={18} />
              {copy.checkout.whatsapp}
            </button>
            <button className="button" onClick={openEmail} disabled={items.length === 0} type="submit">
              <Mail size={18} />
              {copy.checkout.mail}
            </button>
          </div>
        </section>

        <aside className="panel checkout-summary-panel">
          <h2>{copy.cart.subtotal}</h2>
          <p className="price">{formatMoney(subtotalCents, locale)}</p>
          <pre className="message-preview">{message}</pre>
        </aside>
      </form>
    </main>
  );
}
