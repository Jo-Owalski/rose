import { Clapperboard, Instagram } from "lucide-react";
import { getAdminSocialPosts } from "@/lib/social";
import { t, type Locale } from "@/lib/i18n";
import { SocialManager } from "./social-manager";

const pageSize = 20;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function AdminSocialPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const copy = t(locale).admin;
  const result = await getAdminSocialPosts({ page: parsePage(query.page), pageSize });

  return (
    <main className="container section">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.socialGallery}</h1>
      <p className="lead">{copy.socialLead}</p>

      <section className="panel social-admin-panel">
        <div>
          <h2>{copy.manualPostFormat}</h2>
          <p className="muted">{copy.manualPostLead}</p>
        </div>
        <div className="social-admin-format">
          <span>channel: instagram | tiktok</span>
          <span>postUrl: official post link</span>
          <span>imageUrl: official media/cover URL</span>
          <span>title_en / title_fr</span>
          <span>sortOrder + isVisible</span>
        </div>
      </section>

      {result.posts.length > 0 ? (
        <SocialManager
          currentPage={result.page}
          locale={locale}
          posts={result.posts}
          total={result.total}
          totalPages={result.totalPages}
        />
      ) : (
        <>
          <SocialManager currentPage={result.page} locale={locale} posts={[]} total={result.total} totalPages={result.totalPages} />
          <div className="social-empty">
            <div>
              <Instagram size={24} />
              <Clapperboard size={24} />
            </div>
            <h3>{copy.noSocialTitle}</h3>
            <p>{copy.noSocialLead}</p>
          </div>
        </>
      )}
    </main>
  );
}
