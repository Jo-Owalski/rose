import type { Locale } from "@/lib/i18n";
import { CartClient } from "./cart-client";

export default async function CartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <CartClient locale={locale} />;
}
