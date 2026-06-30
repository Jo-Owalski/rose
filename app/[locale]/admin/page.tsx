import { t, type Locale } from "@/lib/i18n";
import { getVisibleSocialPosts } from "@/lib/social";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/storefront";

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale).admin;
  const [categories, products, visibleSocialPosts] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
    getVisibleSocialPosts()
  ]);

  return (
    <main className="container section">
      <section>
        <p className="eyebrow">{copy.dashboardEyebrow}</p>
        <h1>{copy.dashboardTitle}</h1>
        <p className="lead">{copy.dashboardLead}</p>
        <div className="grid">
          <div className="panel">
            <h2>{products.length}</h2>
            <p className="muted">{copy.productsSeeded}</p>
          </div>
          <div className="panel">
            <h2>{categories.length}</h2>
            <p className="muted">{copy.categoriesSeeded}</p>
          </div>
          <div className="panel">
            <h2>0</h2>
            <p className="muted">{copy.savedOrderRequests}</p>
          </div>
          <div className="panel">
            <h2>{visibleSocialPosts.length}</h2>
            <p className="muted">{copy.visibleSocialPosts}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
