import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <AppShell locale={locale as Locale}>{children}</AppShell>;
}
