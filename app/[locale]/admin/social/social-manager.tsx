"use client";

import Link from "next/link";
import { Edit, Plus, Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { SocialChannel, SocialPost } from "@/lib/social";
import { t, type Locale } from "@/lib/i18n";
import { AdminConfirmAction } from "@/components/AdminConfirmAction";
import { deleteSocialPostAction, saveSocialPostAction, type SocialFormState } from "./actions";

const initialState: SocialFormState = {};

const emptyPost: SocialPost = {
  id: "",
  channel: "instagram",
  title: { en: "", fr: "" },
  caption: { en: "", fr: "" },
  imageUrl: "",
  postUrl: "",
  sortOrder: 0,
  isVisible: true
};

export function SocialManager({
  currentPage,
  locale,
  posts,
  total,
  totalPages
}: {
  currentPage: number;
  locale: Locale;
  posts: SocialPost[];
  total: number;
  totalPages: number;
}) {
  const copy = t(locale).admin;
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveSocialPostAction, initialState);
  const selectedPost = useMemo(() => posts.find((post) => post.id === selectedId) ?? emptyPost, [posts, selectedId]);

  return (
    <div className="admin-products-layout">
      <div className="admin-list-actions">
        <div>
          <strong>
            {total} {copy.socialPosts}
          </strong>
          <span>
            {copy.page} {currentPage} {copy.of} {totalPages}
          </span>
        </div>
        <button
          className="button primary"
          onClick={() => {
            setSelectedId("");
            setIsModalOpen(true);
          }}
          type="button"
        >
          <Plus size={16} />
          {copy.newSocialPost}
        </button>
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="social-modal-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{selectedPost.id ? copy.editSocialPost : copy.addSocialPost}</p>
                <h2 id="social-modal-title">{selectedPost.id ? selectedPost.title.en : copy.newSocialPost}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsModalOpen(false)} type="button">
                {copy.close}
              </button>
            </div>

            <form action={formAction} className="form-grid admin-modal-form">
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={selectedPost.id} />
              <label className="field">
                <span>{copy.channel}</span>
                <select key={`${selectedPost.id}-channel`} name="channel" defaultValue={selectedPost.channel}>
                  {(["instagram", "tiktok"] as SocialChannel[]).map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{copy.sortOrder}</span>
                <input key={`${selectedPost.id}-sort`} name="sortOrder" type="number" defaultValue={selectedPost.sortOrder} />
              </label>
              <label className="field">
                <span>{copy.productName} EN</span>
                <input key={`${selectedPost.id}-title-en`} name="titleEn" required defaultValue={selectedPost.title.en} />
              </label>
              <label className="field">
                <span>{copy.productName} FR</span>
                <input key={`${selectedPost.id}-title-fr`} name="titleFr" required defaultValue={selectedPost.title.fr} />
              </label>
              <label className="field full">
                <span>{copy.postUrl}</span>
                <input key={`${selectedPost.id}-post`} name="postUrl" required type="url" defaultValue={selectedPost.postUrl} />
              </label>
              <label className="field full">
                <span>{copy.imageUrl}</span>
                <input key={`${selectedPost.id}-image`} name="imageUrl" type="url" defaultValue={selectedPost.imageUrl} />
              </label>
              <label className="field full">
                <span>{copy.uploadImage}</span>
                <input key={`${selectedPost.id}-image-file`} accept="image/*" name="imageFile" type="file" />
              </label>
              <label className="field full">
                <span>{copy.caption} EN</span>
                <textarea key={`${selectedPost.id}-caption-en`} name="captionEn" defaultValue={selectedPost.caption?.en ?? ""} />
              </label>
              <label className="field full">
                <span>{copy.caption} FR</span>
                <textarea key={`${selectedPost.id}-caption-fr`} name="captionFr" defaultValue={selectedPost.caption?.fr ?? ""} />
              </label>
              <label className="check-field full">
                <input key={`${selectedPost.id}-visible`} name="isVisible" type="checkbox" defaultChecked={selectedPost.isVisible} />
                <span>{copy.visiblePost}</span>
              </label>
              <div className="settings-actions full">
                {state.error && <p className="form-error">{state.error}</p>}
                <button className="button primary" disabled={isPending} type="submit">
                  <Save size={17} />
                  {isPending ? copy.savingSettings : copy.saveSocialPost}
                </button>
                {state.saved && <span className="save-status">{copy.socialPostSaved}</span>}
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="panel product-list-panel">
        <table className="table">
          <thead>
            <tr>
              <th>{copy.productName}</th>
              <th>{copy.channel}</th>
              <th>{copy.sortOrder}</th>
              <th>{copy.productStatus}</th>
              <th>{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title[locale]}</td>
                <td>{post.channel}</td>
                <td>{post.sortOrder}</td>
                <td>{post.isVisible ? copy.active : copy.inactive}</td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => {
                      setSelectedId(post.id);
                      setIsModalOpen(true);
                    }}
                    title={copy.editSocialPost}
                    type="button"
                  >
                    <Edit size={16} />
                  </button>
                  <AdminConfirmAction
                    action={deleteSocialPostAction}
                    confirmLabel={copy.confirmDeleteSocialPost}
                    id={post.id}
                    label="x"
                    locale={locale}
                    title={copy.deleteSocialPost}
                    cancelLabel={copy.close}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <nav className="pagination table-pagination" aria-label={copy.socialGallery}>
            <Link
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "disabled" : undefined}
              href={`/${locale}/admin/social?page=${Math.max(1, currentPage - 1)}`}
            >
              {copy.previous}
            </Link>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Link
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "disabled" : undefined}
              href={`/${locale}/admin/social?page=${Math.min(totalPages, currentPage + 1)}`}
            >
              {copy.next}
            </Link>
          </nav>
        )}
      </section>
    </div>
  );
}
