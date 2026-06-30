import Link from "next/link";
import { Boxes, ClipboardList, LayoutDashboard, Share2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { isLocale, t } from "@/lib/i18n";
import { getAdminUser } from "@/lib/supabase/auth";
import { signOutAdminAction } from "./actions";

const adminLinks = [
  { href: "", labelKey: "dashboardTitle", icon: LayoutDashboard },
  { href: "products", labelKey: "products", icon: Boxes },
  { href: "categories", labelKey: "categories", icon: LayoutDashboard },
  { href: "orders", labelKey: "orders", icon: ClipboardList },
  { href: "social", labelKey: "social", icon: Share2 },
  { href: "settings", labelKey: "settings", icon: ShieldCheck }
] as const;

export default async function ProtectedAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const routeParams = await params;
  const locale = isLocale(routeParams.locale) ? routeParams.locale : "en";
  const copy = t(locale).admin;
  const user = await getAdminUser();

  if (!user) redirect(`/${locale}/admin-login?error=unauthorized`);

  return (
    <>
      <div className="admin-session-bar">
        <div className="container">
          <nav className="admin-mini-nav" aria-label="Admin navigation">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href || "dashboard"} href={`/${locale}/admin${item.href ? `/${item.href}` : ""}`}>
                  <Icon size={16} />
                  {copy[item.labelKey]}
                </Link>
              );
            })}
          </nav>
          <span>{user.email}</span>
          <form action={signOutAdminAction}>
            <input name="locale" type="hidden" value={locale} />
            <button className="button ghost" type="submit">
              {copy.signOut}
            </button>
          </form>
        </div>
      </div>
      {children}
    </>
  );
}
