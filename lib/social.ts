import type { Locale } from "./i18n";
import { createPublicSupabaseClient, createServiceSupabaseClient } from "./supabase/server";

export type SocialChannel = "instagram" | "tiktok";

export type SocialPost = {
  id: string;
  channel: SocialChannel;
  title: Record<Locale, string>;
  caption?: Record<Locale, string>;
  imageUrl: string;
  postUrl: string;
  sortOrder: number;
  isVisible: boolean;
};

export const socialProfiles: Record<SocialChannel, { handle: string; url: string }> = {
  instagram: {
    handle: "",
    url: ""
  },
  tiktok: {
    handle: "",
    url: ""
  }
};

// Only add posts here when the image comes from the real Instagram/TikTok account.
// Later this can be replaced by Instagram Basic Display / Graph API and TikTok API sync.
export const socialPosts: SocialPost[] = [];

export const visibleSocialPosts = socialPosts
  .filter((post) => post.isVisible)
  .sort((a, b) => a.sortOrder - b.sortOrder);

type SocialPostRow = {
  id: string;
  channel: SocialChannel;
  title_en: string;
  title_fr: string;
  caption_en: string | null;
  caption_fr: string | null;
  image_url: string;
  post_url: string;
  sort_order: number | null;
  is_visible: boolean | null;
};

function mapSocialPost(row: SocialPostRow): SocialPost {
  return {
    id: row.id,
    channel: row.channel,
    title: { en: row.title_en, fr: row.title_fr },
    caption:
      row.caption_en || row.caption_fr
        ? {
            en: row.caption_en ?? "",
            fr: row.caption_fr ?? ""
          }
        : undefined,
    imageUrl: row.image_url,
    postUrl: row.post_url,
    sortOrder: row.sort_order ?? 0,
    isVisible: Boolean(row.is_visible)
  };
}

export async function getVisibleSocialPosts(): Promise<SocialPost[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return visibleSocialPosts;

  const { data, error } = await supabase
    .from("social_posts")
    .select("id, channel, title_en, title_fr, caption_en, caption_fr, image_url, post_url, sort_order, is_visible")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return visibleSocialPosts;
  return (data as SocialPostRow[]).map(mapSocialPost);
}

export async function getAdminSocialPosts({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { posts: [], total: 0, page, pageSize, totalPages: 1 };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from("social_posts")
    .select("id, channel, title_en, title_fr, caption_en, caption_fr, image_url, post_url, sort_order, is_visible", {
      count: "exact"
    })
    .order("sort_order", { ascending: true })
    .range(from, to);

  const total = count ?? 0;
  return {
    posts: error || !data ? [] : (data as SocialPostRow[]).map(mapSocialPost),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize))
  };
}
