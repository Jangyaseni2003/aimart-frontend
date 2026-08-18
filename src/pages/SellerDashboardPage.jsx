import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as sellerApi from "../api/seller";
import * as ordersApi from "../api/orders";
import * as productsApi from "../api/products";
import * as pricingApi from "../api/pricing";
import StatusBadge from "../components/StatusBadge";

const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function SellerDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [competitorInputs, setCompetitorInputs] = useState({});

  function load() {
    return Promise.all([
      sellerApi.getSellerMetrics(),
      sellerApi.getSellerOrders(),
      productsApi.listMyProducts(),
    ]).then(([m, o, p]) => {
      setMetrics(m);
      setOrders(o);
      setProducts(p);
    });
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function advanceStatus(order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdatingId(order._id);
    try {
      await ordersApi.updateOrderStatus(order._id, next);
      await load();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      const result = await pricingApi.recalculatePrices();
      setRecalculateMessage(result.message);
      await load();
    } finally {
      setRecalculating(false);
    }
  }

  async function handleSetCompetitorPrice(productId) {
    const value = competitorInputs[productId];
    if (!value) return;
    await pricingApi.setCompetitorPrice(productId, Number(value));
    await load();
  }

  async function toggleHistory(productId) {
    if (expandedHistory === productId) {
      setExpandedHistory(null);
      return;
    }
    const history = await pricingApi.getPriceHistory(productId);
    setPriceHistory(history);
    setExpandedHistory(productId);
  }

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Seller Dashboard</h1>
        <div>
          <button onClick={handleRecalculate} disabled={recalculating}>
            {recalculating ? "Recalculating..." : "Recalculate pricing now"}
          </button>{" "}
          <Link to="/seller/products/new">
            <button>+ New Product</button>
          </Link>
        </div>
      </div>
      {recalculateMessage && <p className="text-muted">{recalculateMessage}</p>}

      <div className="metrics-row">
        <div className="metric-card">
          <span className="metric-value">{metrics.sales}</span>
          <span className="metric-label">Items sold</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{metrics.revenue}</span>
          <span className="metric-label">Revenue</span>
        </div>
      </div>

      <h3>Top products</h3>
      {metrics.topProducts.length === 0 && <p>No sales yet.</p>}
      <ul>
        {metrics.topProducts.map((p) => (
          <li key={p.id}>
            {p.title} — {p.sold} sold
          </li>
        ))}
      </ul>

      <h3>My products ({products.length})</h3>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <h4>{product.title}</h4>
            <p className="product-price">
              {product.currency} {product.dynamicPrice ?? product.price}
              {product.dynamicPrice != null &&
                product.dynamicPrice !== product.price && (
                  <span className="text-muted">
                    {" "}
                    (base {product.currency} {product.price})
                  </span>
                )}
            </p>
            <p>Stock: {product.stock}</p>
            <p className="text-muted">
              Demand since last cycle — views: {product.demand?.views ?? 0},
              cart adds: {product.demand?.cartAdds ?? 0}, purchases:{" "}
              {product.demand?.purchases ?? 0}
            </p>
            <div>
              <input
                type="number"
                placeholder="Competitor price"
                value={competitorInputs[product._id] ?? ""}
                onChange={(e) =>
                  setCompetitorInputs({
                    ...competitorInputs,
                    [product._id]: e.target.value,
                  })
                }
              />{" "}
              <button onClick={() => handleSetCompetitorPrice(product._id)}>
                Save
              </button>
            </div>
            {product.competitorPrice != null && (
              <p className="text-muted">
                Competitor price: {product.currency} {product.competitorPrice}
              </p>
            )}
            <button
              className="link-button"
              onClick={() => toggleHistory(product._id)}
            >
              {expandedHistory === product._id
                ? "Hide price history"
                : "Show price history"}
            </button>
            {expandedHistory === product._id && (
              <ul>
                {priceHistory.length === 0 && <li>No price changes yet.</li>}
                {priceHistory.map((h) => (
                  <li key={h._id}>
                    {new Date(h.createdAt).toLocaleString()} — {product.currency}{" "}
                    {h.price} ({h.reason})
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h3>Orders containing my products ({orders.length})</h3>
      <div className="order-list">
        {orders.map((order) => (
          <div className="order-row order-row-seller" key={order._id}>
            <span>#{order._id.slice(-8)}</span>
            <StatusBadge status={order.status} />
            <span>{order.items.length} item(s)</span>
            <span>
              {NEXT_STATUS[order.status] ? (
                <button
                  className="link-button"
                  disabled={updatingId === order._id}
                  onClick={() => advanceStatus(order)}
                >
                  {updatingId === order._id
                    ? "Updating..."
                    : `Mark as ${NEXT_STATUS[order.status]}`}
                </button>
              ) : (
                <span className="text-muted">—</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
