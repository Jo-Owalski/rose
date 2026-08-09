import Link from "next/link";
import { ShoppingBag, Store, Search } from "lucide-react";
import { CartProvider } from "@/lib/cart";
import { type Locale, t } from "@/lib/i18n";
import { CartNavLink } from "./CartNavLink";
import { FloatingCartButton } from "./FloatingCartButton";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";

export function AppShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const copy = t(locale);
  const otherLocale = locale === "en" ? "fr" : "en";

  return (
    <CartProvider>
      <ServiceWorkerRegister />
      <div className="site-shell">
        <header className="boulangerie-topbar">
          <nav className="boulangerie-nav" aria-label="Main navigation">
            <Link className="boulangerie-brand" href={`/${locale}`}>
              <span className="boulangerie-brand-mark">
                <Store size={22} />
              </span>
              <div className="boulangerie-brand-text">
                <span className="boulangerie-brand-title">Rose</span>
                <span className="boulangerie-brand-sub">Boulangerie & Pâtisserie</span>
              </div>
            </Link>

            <div className="boulangerie-nav-links">
              <Link href={`/${locale}`}>{locale === "fr" ? "Qui sommes-nous ?" : "About us"}</Link>
              <Link href={`/${locale}/menu`}>{copy.nav.menu}</Link>
              <Link href={`/${locale}/testimonials`}>{copy.nav.testimonials}</Link>
              <Link href={`/${otherLocale}`} aria-label="Switch language">
                {otherLocale.toUpperCase()}
              </Link>
            </div>

            <div className="boulangerie-nav-actions">
              <Link className="boulangerie-yellow-btn" href={`/${locale}/menu`}>
                {locale === "fr" ? "COMMANDER" : "ORDER NOW"}
              </Link>
              <Link className="boulangerie-search-btn" href={`/${locale}/menu`} aria-label="Search">
                <Search size={20} />
              </Link>
              <CartNavLink locale={locale} label={copy.nav.cart} icon={<ShoppingBag size={17} />} />
            </div>
          </nav>
        </header>
        {children}
        <FloatingCartButton locale={locale} label={copy.nav.cart} />
        <footer className="footer">
          <div className="container">
            Rose · Bakery, pastry, cake, and food order requests · Canada
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
