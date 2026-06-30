import { getBusinessSettings } from "@/lib/business-settings";
import type { Locale } from "@/lib/i18n";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const businessSettings = await getBusinessSettings();
  return <CheckoutClient businessSettings={businessSettings} locale={locale} />;
}
