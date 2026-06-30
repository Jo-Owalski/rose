import Link from "next/link";
import { formatMoney, t, type Locale } from "@/lib/i18n";
import { getAdminOrders, type OrderStatus } from "@/lib/orders";
import { OrderStatusForm } from "./order-status-form";
import { OrderWorkflowForm } from "./order-workflow-form";

const statuses: Array<OrderStatus | "all"> = ["all", "new", "contacted", "confirmed", "cancelled", "completed"];
const fulfillmentMethods = ["all", "pickup", "delivery"] as const;
const pageSize = 20;
type FulfillmentFilter = (typeof fulfillmentMethods)[number];

function formatDate(value: string | null, locale: Locale) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

function parseStatus(value: string | string[] | undefined): OrderStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return statuses.includes(raw as OrderStatus) && raw !== "all" ? (raw as OrderStatus) : undefined;
}

function parseFulfillment(value: string | string[] | undefined): Exclude<FulfillmentFilter, "all"> | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "pickup" || raw === "delivery" ? raw : undefined;
}

function parseText(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || "";
}

function ordersHref(
  locale: Locale,
  page: number,
  filters: { status?: OrderStatus; fulfillmentMethod?: "pickup" | "delivery"; search?: string; dateFrom?: string; dateTo?: string }
) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters.status) params.set("status", filters.status);
  if (filters.fulfillmentMethod) params.set("method", filters.fulfillmentMethod);
  if (filters.search) params.set("q", filters.search);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  const query = params.toString();
  return `/${locale}/admin/orders${query ? `?${query}` : ""}`;
}

function exportHref(filters: { status?: OrderStatus; fulfillmentMethod?: "pickup" | "delivery"; search?: string; dateFrom?: string; dateTo?: string }) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.fulfillmentMethod) params.set("method", filters.fulfillmentMethod);
  if (filters.search) params.set("q", filters.search);
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);
  const query = params.toString();
  return `/api/admin/orders/export${query ? `?${query}` : ""}`;
}

function statusLabel(status: OrderStatus | "all", locale: Locale) {
  const copy = t(locale).admin;
  const labels = {
    all: copy.statusAll,
    new: copy.statusNew,
    contacted: copy.statusContacted,
    confirmed: copy.statusConfirmed,
    cancelled: copy.statusCancelled,
    completed: copy.statusCompleted
  };
  return labels[status];
}

export default async function AdminOrdersPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    page?: string | string[];
    status?: string | string[];
    method?: string | string[];
    q?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
}) {
  const { locale } = await params;
  const copy = t(locale).admin;
  const query = await searchParams;
  const activeStatus = parseStatus(query.status);
  const activeMethod = parseFulfillment(query.method);
  const search = parseText(query.q);
  const dateFrom = parseText(query.from);
  const dateTo = parseText(query.to);
  const activeFilters = { status: activeStatus, fulfillmentMethod: activeMethod, search, dateFrom, dateTo };
  const requestedPage = parsePage(query.page);
  const result = await getAdminOrders({
    dateFrom,
    dateTo,
    fulfillmentMethod: activeMethod,
    page: requestedPage,
    pageSize,
    search,
    status: activeStatus
  });
  const currentPage = Math.min(result.page, result.totalPages);

  return (
    <main className="container section">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.orderRequests}</h1>

      <div className="orders-toolbar">
        <div>
          <strong>
            {result.total} {copy.orderCount}
          </strong>
          <span>
            {copy.page} {currentPage} {copy.of} {result.totalPages}
          </span>
        </div>
        <nav className="status-tabs" aria-label={copy.filterOrders}>
          {statuses.map((status) => {
            const isActive = status === "all" ? !activeStatus : activeStatus === status;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : undefined}
                href={ordersHref(locale, 1, { ...activeFilters, status: status === "all" ? undefined : status })}
                key={status}
              >
                {statusLabel(status, locale)}
              </Link>
            );
          })}
        </nav>
      </div>

      <form className="panel order-filters" action={`/${locale}/admin/orders`}>
        {activeStatus && <input name="status" type="hidden" value={activeStatus} />}
        <label className="field">
          <span>{copy.searchOrders}</span>
          <input name="q" defaultValue={search} placeholder={copy.searchOrdersPlaceholder} />
        </label>
        <label className="field">
          <span>{copy.fulfillment}</span>
          <select name="method" defaultValue={activeMethod ?? "all"}>
            {fulfillmentMethods.map((method) => (
              <option key={method} value={method}>
                {method === "all" ? copy.statusAll : method === "pickup" ? copy.pickup : copy.delivery}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{copy.dateFrom}</span>
          <input name="from" type="date" defaultValue={dateFrom} />
        </label>
        <label className="field">
          <span>{copy.dateTo}</span>
          <input name="to" type="date" defaultValue={dateTo} />
        </label>
        <div className="filter-actions">
          <button className="button primary" type="submit">
            {copy.applyFilters}
          </button>
          <Link className="button ghost" href={`/${locale}/admin/orders`}>
            {copy.resetFilters}
          </Link>
          <a className="button ghost" href={exportHref(activeFilters)}>
            {copy.exportCsv}
          </a>
        </div>
      </form>

      {result.orders.length === 0 ? (
        <div className="panel">
          <p className="lead">{copy.noOrders}</p>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {result.orders.map((order) => (
              <article className={`order-card status-${order.status}`} key={order.id}>
                <header className="order-card-header">
                  <div className="order-title">
                    <span className={`order-status-badge status-${order.status}`}>{statusLabel(order.status, locale)}</span>
                    <h2>{order.customerName}</h2>
                    <p className="muted">
                      {[order.customerPhone, order.customerEmail].filter(Boolean).join(" / ") || copy.noContact}
                    </p>
                  </div>
                  <OrderStatusForm locale={locale} orderId={order.id} status={order.status} />
                </header>

                <div className="order-summary-grid">
                  <div>
                    <span>{copy.orderCreated}</span>
                    <strong>{formatDate(order.createdAt, locale)}</strong>
                  </div>
                  <div>
                    <span>{copy.dueDate}</span>
                    <strong>{formatDate(order.preferredDatetime, locale)}</strong>
                  </div>
                  <div>
                    <span>{copy.total}</span>
                    <strong>{formatMoney(order.finalTotalCents ?? order.subtotalCents ?? undefined, locale)}</strong>
                  </div>
                  <div>
                    <span>{copy.items}</span>
                    <strong>{order.items.length}</strong>
                  </div>
                </div>

                <div className="order-meta">
                  <span>{order.fulfillmentMethod}</span>
                  <span>{order.sentVia ?? copy.notSent}</span>
                  <span>{copy.paymentStatus}: {order.paymentStatus}</span>
                  {order.status === "completed" && <span>{copy.statusCompleted}</span>}
                </div>
                <div className="order-actions">
                  <OrderWorkflowForm locale={locale} order={order} />
                </div>

                {order.status === "completed" && <p className="order-completed-note">{copy.completedHint}</p>}

                <details className="order-details">
                  <summary>{copy.viewDetails}</summary>

                  {order.deliveryAddress && (
                    <p className="order-note">
                      <strong>{copy.delivery}:</strong> {order.deliveryAddress}
                    </p>
                  )}
                  {order.preferredDatetime && (
                    <p className="order-note">
                      <strong>{copy.preferred}:</strong> {formatDate(order.preferredDatetime, locale)}
                    </p>
                  )}
                  {order.customerNotes && (
                    <p className="order-note">
                      <strong>{copy.notes}:</strong> {order.customerNotes}
                    </p>
                  )}
                  {order.adminNotes && (
                    <p className="order-note admin-only">
                      <strong>{copy.adminNotes}:</strong> {order.adminNotes}
                    </p>
                  )}
                  {order.fulfillmentNotes && (
                    <p className="order-note admin-only">
                      <strong>{copy.fulfillmentNotes}:</strong> {order.fulfillmentNotes}
                    </p>
                  )}

                  <div className="order-items">
                    {order.items.map((item) => (
                      <div className="order-item" key={item.id}>
                        <div>
                          <strong>{item.productName}</strong>
                          <span>
                            {item.productType} / x{item.quantity}
                          </span>
                          {item.customNotes && <small>{item.customNotes}</small>}
                        </div>
                        <strong>{formatMoney(item.lineTotalCents ?? undefined, locale)}</strong>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>

          {result.totalPages > 1 && (
            <nav className="pagination" aria-label={copy.orderRequests}>
              <Link
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "disabled" : undefined}
                href={ordersHref(locale, Math.max(1, currentPage - 1), activeFilters)}
              >
                {copy.previous}
              </Link>
              <span>
                {currentPage} / {result.totalPages}
              </span>
              <Link
                aria-disabled={currentPage >= result.totalPages}
                className={currentPage >= result.totalPages ? "disabled" : undefined}
                href={ordersHref(locale, Math.min(result.totalPages, currentPage + 1), activeFilters)}
              >
                {copy.next}
              </Link>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
