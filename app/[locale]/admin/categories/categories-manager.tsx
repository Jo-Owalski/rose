"use client";

import Link from "next/link";
import { Edit, Plus, Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import type { AdminCategory } from "@/lib/admin-catalog";
import { t, type Locale } from "@/lib/i18n";
import { AdminConfirmAction } from "@/components/AdminConfirmAction";
import { archiveCategoryAction, saveCategoryAction, type CategoryFormState } from "./actions";

const initialState: CategoryFormState = {};

const emptyCategory: AdminCategory = {
  id: "",
  slug: "",
  nameEn: "",
  nameFr: "",
  descriptionEn: "",
  descriptionFr: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true
};

export function CategoriesManager({
  categories,
  currentPage,
  locale,
  total,
  totalPages
}: {
  categories: AdminCategory[];
  currentPage: number;
  locale: Locale;
  total: number;
  totalPages: number;
}) {
  const copy = t(locale).admin;
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveCategoryAction, initialState);
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? emptyCategory,
    [categories, selectedId]
  );

  return (
    <div className="admin-products-layout">
      <div className="admin-list-actions">
        <div>
          <strong>
            {total} {copy.categories}
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
          {copy.newCategory}
        </button>
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal small" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{selectedCategory.id ? copy.editCategory : copy.addCategory}</p>
                <h2 id="category-modal-title">{selectedCategory.id ? selectedCategory.nameEn : copy.newCategory}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsModalOpen(false)} type="button">
                {copy.close}
              </button>
            </div>

            <form action={formAction} className="form-grid admin-modal-form">
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={selectedCategory.id} />
              <label className="field">
                <span>{copy.productName} EN</span>
                <input key={`${selectedCategory.id}-name-en`} name="nameEn" required defaultValue={selectedCategory.nameEn} />
              </label>
              <label className="field">
                <span>{copy.productName} FR</span>
                <input key={`${selectedCategory.id}-name-fr`} name="nameFr" required defaultValue={selectedCategory.nameFr} />
              </label>
              <label className="field">
                <span>Slug</span>
                <input key={`${selectedCategory.id}-slug`} name="slug" defaultValue={selectedCategory.slug} placeholder="pastries" />
              </label>
              <label className="field">
                <span>{copy.sortOrder}</span>
                <input key={`${selectedCategory.id}-sort`} name="sortOrder" type="number" defaultValue={selectedCategory.sortOrder ?? 0} />
              </label>
              <label className="field full">
                <span>{copy.imageUrl}</span>
                <input key={`${selectedCategory.id}-image`} name="imageUrl" type="url" defaultValue={selectedCategory.imageUrl ?? ""} />
              </label>
              <label className="field full">
                <span>{copy.uploadImage}</span>
                <input key={`${selectedCategory.id}-image-file`} accept="image/*" name="imageFile" type="file" />
              </label>
              <label className="field full">
                <span>{copy.description} EN</span>
                <textarea key={`${selectedCategory.id}-desc-en`} name="descriptionEn" defaultValue={selectedCategory.descriptionEn ?? ""} />
              </label>
              <label className="field full">
                <span>{copy.description} FR</span>
                <textarea key={`${selectedCategory.id}-desc-fr`} name="descriptionFr" defaultValue={selectedCategory.descriptionFr ?? ""} />
              </label>
              <label className="check-field full">
                <input key={`${selectedCategory.id}-active`} name="isActive" type="checkbox" defaultChecked={selectedCategory.isActive} />
                <span>{copy.activeCategory}</span>
              </label>
              <div className="settings-actions full">
                {state.error && <p className="form-error">{state.error}</p>}
                <button className="button primary" disabled={isPending} type="submit">
                  <Save size={17} />
                  {isPending ? copy.savingSettings : copy.saveCategory}
                </button>
                {state.saved && <span className="save-status">{copy.categorySaved}</span>}
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
              <th>Slug</th>
              <th>{copy.description}</th>
              <th>{copy.sortOrder}</th>
              <th>{copy.productStatus}</th>
              <th>{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{locale === "fr" ? category.nameFr : category.nameEn}</td>
                <td>{category.slug}</td>
                <td>{locale === "fr" ? category.descriptionFr : category.descriptionEn}</td>
                <td>{category.sortOrder}</td>
                <td>{category.isActive ? copy.active : copy.inactive}</td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => {
                      setSelectedId(category.id);
                      setIsModalOpen(true);
                    }}
                    type="button"
                    title={copy.editCategory}
                  >
                    <Edit size={16} />
                  </button>
                  <AdminConfirmAction
                    action={archiveCategoryAction}
                    confirmLabel={copy.confirmArchiveCategory}
                    id={category.id}
                    label="!"
                    locale={locale}
                    title={copy.archiveCategory}
                    variant="warning"
                    cancelLabel={copy.close}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <nav className="pagination table-pagination" aria-label={copy.categories}>
            <Link
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "disabled" : undefined}
              href={`/${locale}/admin/categories?page=${Math.max(1, currentPage - 1)}`}
            >
              {copy.previous}
            </Link>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Link
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "disabled" : undefined}
              href={`/${locale}/admin/categories?page=${Math.min(totalPages, currentPage + 1)}`}
            >
              {copy.next}
            </Link>
          </nav>
        )}
      </section>
    </div>
  );
}
