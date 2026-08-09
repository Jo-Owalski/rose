import { Clapperboard, Instagram, Quote, Star } from "lucide-react";
import { type Locale, t } from "@/lib/i18n";
import { getVisibleSocialPosts } from "@/lib/social";

const testimonials = [
  {
    name: "Marie D.",
    occasion: { en: "Birthday cake", fr: "Gâteau d'anniversaire" },
    quote: {
      en: "The cake felt personal, elegant, and fresh. The WhatsApp order made the details easy to confirm.",
      fr: "Le gâteau était personnel, élégant et frais. La commande WhatsApp a facilité la confirmation des détails."
    }
  },
  {
    name: "Amina K.",
    occasion: { en: "Pastry box", fr: "Boîte de pâtisseries" },
    quote: {
      en: "The pastry box looked beautiful on the table and everything was clearly packed for pickup.",
      fr: "La boîte de pâtisseries était superbe sur la table et tout était bien préparé pour le ramassage."
    }
  },
  {
    name: "Julien R.",
    occasion: { en: "Office treats", fr: "Gourmandises bureau" },
    quote: {
      en: "Simple ordering, warm presentation, and the croissants disappeared fast.",
      fr: "Commande simple, présentation chaleureuse, et les croissants sont partis très vite."
    }
  }
];

export default async function TestimonialsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const visibleSocialPosts = await getVisibleSocialPosts();

  return (
    <main>
      <section className="container testimonials-hero testimonials-hero-page">
        <div>
          <p className="eyebrow">{copy.testimonials.eyebrow}</p>
          <h1>{copy.testimonials.title}</h1>
          <p className="lead">{copy.testimonials.lead}</p>
        </div>
        <div className="testimonial-highlight">
          <Quote size={34} />
          <p>
            {locale === "fr"
              ? "Une expérience douce, claire et soignée, du premier message jusqu'à la boîte finale."
              : "A soft, clear, polished experience from the first message to the final box."}
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="testimonial-grid testimonials-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card" key={item.name}>
              <div className="star-row" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p>{item.quote[locale]}</p>
              <div>
                <strong>{item.name}</strong>
                <span>{item.occasion[locale]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section testimonials-gallery-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Instagram / TikTok</p>
            <h2>{copy.testimonials.galleryTitle}</h2>
            <p className="muted">{copy.testimonials.galleryLead}</p>
          </div>
        </div>
        {visibleSocialPosts.length > 0 ? (
          <div className="social-gallery">
            {visibleSocialPosts.map((item) => {
              const isInstagram = item.channel === "instagram";
              const Icon = isInstagram ? Instagram : Clapperboard;
              return (
                <a className="social-tile" href={item.postUrl} key={item.id} rel="noreferrer" target="_blank">
                  <img src={item.imageUrl} alt={item.title[locale]} />
                  <div className="social-overlay">
                    <span className={isInstagram ? "social-badge instagram" : "social-badge tiktok"}>
                      <Icon size={16} />
                      {isInstagram ? copy.testimonials.instagram : copy.testimonials.tiktok}
                    </span>
                    <strong>{item.title[locale]}</strong>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="social-empty social-empty-page">
            <div>
              <Instagram size={24} />
              <Clapperboard size={24} />
            </div>
            <h3>{locale === "fr" ? "Galerie en attente des comptes officiels" : "Gallery waiting for official accounts"}</h3>
            <p>
              {locale === "fr"
                ? "Ajoute les liens des vrais posts Instagram/TikTok ou connecte les APIs sociales. Aucun contenu stock ne sera affiché ici."
                : "Add real Instagram/TikTok post links or connect the social APIs. No stock content will be shown here."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
