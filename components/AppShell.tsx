import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
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
        <header className="topbar">
          <nav className="container nav" aria-label="Main navigation">
            <Link className="brand" href={`/${locale}`}>
              <span className="brand-mark">
                <Store size={20} />
              </span>
              <span>Rose</span>
            </Link>
            <div className="nav-links">
              <Link href={`/${locale}/menu`}>{copy.nav.menu}</Link>
              <Link href={`/${locale}/testimonials`}>{copy.nav.testimonials}</Link>
              <Link href={`/${otherLocale}`} aria-label="Switch language">
                {otherLocale.toUpperCase()}
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
