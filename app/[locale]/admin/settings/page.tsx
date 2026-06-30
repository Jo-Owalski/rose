import { t, type Locale } from "@/lib/i18n";
import { getBusinessSettings } from "@/lib/business-settings";
import { SettingsClient } from "./settings-client";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale).admin;
  const settings = await getBusinessSettings();

  return (
    <main className="container section">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.settings}</h1>
      <p className="lead">{copy.settingsLead}</p>
      <SettingsClient initialSettings={settings} locale={locale} />
    </main>
  );
}
