"use client";

import { Edit, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { AdminCategory, AdminProduct } from "@/lib/admin-catalog";
import type { Availability, ProductType } from "@/lib/catalog";
import { formatMoney, t, type Locale } from "@/lib/i18n";
import { AdminConfirmAction } from "@/components/AdminConfirmAction";
import { archiveProductAction, saveProductAction, type ProductFormState } from "./actions";

const initialState: ProductFormState = {};

const emptyProduct: AdminProduct = {
  id: "",
  slug: "",
  categoryId: null,
  nameEn: "",
  nameFr: "",
  descriptionEn: "",
  descriptionFr: "",
  productType: "individual",
  priceCents: null,
  startingPriceCents: null,
  availability: "available",
  isFeatured: false,
  isSeasonal: false,
  isHidden: false,
  leadTimeHours: 24,
  sortOrder: 0,
  imageUrl: ""
};

function dollars(cents: number | null) {
  return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
}

function categoryName(categories: AdminCategory[], id: string | null, locale: Locale) {
  const category = categories.find((entry) => entry.id === id);
  if (!category) return "-";
  return locale === "fr" ? category.nameFr : category.nameEn;
}

export function ProductsManager({
  categories,
  locale,
  products,
  currentPage,
  totalPages,
  totalProducts
}: {
  categories: AdminCategory[];
  currentPage: number;
  locale: Locale;
  products: AdminProduct[];
  totalPages: number;
  totalProducts: number;
}) {
  const copy = t(locale).admin;
  const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(saveProductAction, initialState);
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? emptyProduct,
    [products, selectedId]
  );

  return (
    <div className="admin-products-layout">
      <div className="admin-list-actions">
        <div>
          <strong>
            {totalProducts} {copy.products}
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
          {copy.newProduct}
        </button>
      </div>

      {isModalOpen && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">{selectedProduct.id ? copy.editProduct : copy.addProduct}</p>
                <h2 id="product-modal-title">{selectedProduct.id ? selectedProduct.nameEn : copy.newProduct}</h2>
              </div>
              <button className="button ghost" onClick={() => setIsModalOpen(false)} type="button">
                {copy.close}
              </button>
            </div>

            <form action={formAction} className="form-grid admin-modal-form">
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={selectedProduct.id} />

              <label className="field">
                <span>{copy.productName} EN</span>
                <input key={`${selectedProduct.id}-name-en`} name="nameEn" required defaultValue={selectedProduct.nameEn} />
              </label>
              <label className="field">
                <span>{copy.productName} FR</span>
                <input key={`${selectedProduct.id}-name-fr`} name="nameFr" required defaultValue={selectedProduct.nameFr} />
              </label>
              <label className="field">
                <span>Slug</span>
                <input key={`${selectedProduct.id}-slug`} name="slug" defaultValue={selectedProduct.slug} placeholder="mini-fruit-tarts" />
              </label>
              <label className="field">
                <span>{copy.categories}</span>
                <select key={`${selectedProduct.id}-category`} name="categoryId" defaultValue={selectedProduct.categoryId ?? ""}>
                  <option value="">-</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {locale === "fr" ? category.nameFr : category.nameEn}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{copy.productType}</span>
                <select key={`${selectedProduct.id}-type`} name="productType" defaultValue={selectedProduct.productType}>
                  {(["individual", "bundle", "custom"] as ProductType[]).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{copy.productStatus}</span>
                <select key={`${selectedProduct.id}-availability`} name="availability" defaultValue={selectedProduct.availability}>
                  {(["available", "sold-out", "seasonal", "hidden"] as Availability[]).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{copy.productPrice}</span>
                <input key={`${selectedProduct.id}-price`} min="0" name="price" step="0.01" type="number" defaultValue={dollars(selectedProduct.priceCents)} />
              </label>
              <label className="field">
                <span>{copy.startingPrice}</span>
                <input
                  key={`${selectedProduct.id}-starting-price`}
                  min="0"
                  name="startingPrice"
                  step="0.01"
                  type="number"
                  defaultValue={dollars(selectedProduct.startingPriceCents)}
                />
              </label>
              <label className="field">
                <span>{copy.leadTimeHours}</span>
                <input key={`${selectedProduct.id}-lead`} min="0" name="leadTimeHours" type="number" defaultValue={selectedProduct.leadTimeHours} />
              </label>
              <label className="field">
                <span>{copy.sortOrder}</span>
                <input key={`${selectedProduct.id}-sort`} name="sortOrder" type="number" defaultValue={selectedProduct.sortOrder} />
              </label>
              <label className="field full">
                <span>{copy.imageUrl}</span>
                <input key={`${selectedProduct.id}-image`} name="imageUrl" type="url" defaultValue={selectedProduct.imageUrl} />
              </label>
              <label className="field full">
                <span>{copy.uploadImage}</span>
                <input key={`${selectedProduct.id}-image-file`} accept="image/*" name="imageFile" type="file" />
              </label>
              <label className="field full">
                <span>{copy.description} EN</span>
                <textarea key={`${selectedProduct.id}-desc-en`} name="descriptionEn" defaultValue={selectedProduct.descriptionEn} />
              </label>
              <label className="field full">
                <span>{copy.description} FR</span>
                <textarea key={`${selectedProduct.id}-desc-fr`} name="descriptionFr" defaultValue={selectedProduct.descriptionFr} />
              </label>
              <label className="check-field full">
                <input key={`${selectedProduct.id}-featured`} name="isFeatured" type="checkbox" defaultChecked={selectedProduct.isFeatured} />
                <span>{copy.featuredProduct}</span>
              </label>
              <div className="settings-actions full">
                {state.error && <p className="form-error">{state.error}</p>}
                <button className="button primary" disabled={isPending} type="submit">
                  <Save size={17} />
                  {isPending ? copy.savingSettings : copy.saveProduct}
                </button>
                {state.saved && <span className="save-status">{copy.productSaved}</span>}
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
              <th>{copy.categories}</th>
              <th>{copy.productStatus}</th>
              <th>{copy.productPrice}</th>
              <th>{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{locale === "fr" ? product.nameFr : product.nameEn}</td>
                <td>{categoryName(categories, product.categoryId, locale)}</td>
                <td>{product.availability}</td>
                <td>{formatMoney(product.priceCents ?? product.startingPriceCents ?? undefined, locale)}</td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => {
                      setSelectedId(product.id);
                      setIsModalOpen(true);
                    }}
                    type="button"
                    title={copy.editProduct}
                  >
                    <Edit size={16} />
                  </button>
                  <AdminConfirmAction
                    action={archiveProductAction}
                    confirmLabel={copy.confirmArchiveProduct}
                    id={product.id}
                    label="!"
                    locale={locale}
                    title={copy.archiveProduct}
                    variant="warning"
                    cancelLabel={copy.close}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <nav className="pagination table-pagination" aria-label={copy.products}>
            <Link
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? "disabled" : undefined}
              href={`/${locale}/admin/products?page=${Math.max(1, currentPage - 1)}`}
            >
              {copy.previous}
            </Link>
            <span>
              {currentPage} / {totalPages}
            </span>
            <Link
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? "disabled" : undefined}
              href={`/${locale}/admin/products?page=${Math.min(totalPages, currentPage + 1)}`}
            >
              {copy.next}
            </Link>
          </nav>
        )}
      </section>
    </div>
  );
}
