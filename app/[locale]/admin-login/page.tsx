import { redirect } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";
import { getAdminUser } from "@/lib/supabase/auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const copy = t(locale).admin;
  const user = await getAdminUser();

  if (user) redirect(`/${locale}/admin`);

  return (
    <main className="container section admin-login">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.loginTitle}</h1>
      <p className="lead">{copy.loginLead}</p>
      {query.error === "unauthorized" && <p className="form-error">{copy.unauthorized}</p>}
      <AdminLoginForm locale={locale} />
    </main>
  );
}
