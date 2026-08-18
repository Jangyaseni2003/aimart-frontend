import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cartApi from "../api/cart";
import * as productsApi from "../api/products";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await cartApi.getCart();
      const withProducts = await Promise.all(
        data.cart.items.map(async (item) => {
          try {
            const product = await productsApi.getProduct(item.productId);
            return { ...item, product };
          } catch {
            return { ...item, product: null };
          }
        })
      );
      setItems(withProducts);
    } catch {
      setError("Could not load cart");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(productId, qty) {
    if (qty < 1) return;
    await cartApi.updateCartItem(productId, qty);
    await Promise.all([load(), refreshCartCount()]);
  }

  async function removeItem(productId) {
    await cartApi.removeCartItem(productId);
    await Promise.all([load(), refreshCartCount()]);
  }

  const total = items.reduce(
    (sum, item) =>
      sum +
      (item.product?.dynamicPrice ?? item.product?.price ?? 0) * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="page">
      <h1>Your Cart</h1>
      {items.length === 0 && (
        <p>
          Your cart is empty. <Link to="/">Browse products</Link>
        </p>
      )}
      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-row" key={item.productId}>
            <span className="cart-item-title">
              {item.product?.title || "Unknown product"}
            </span>
            <span>
              {item.product?.currency}{" "}
              {item.product?.dynamicPrice ?? item.product?.price}
            </span>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateQty(item.productId, Number(e.target.value))}
            />
            <button className="link-button" onClick={() => removeItem(item.productId)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="cart-summary">
          <p>Total: {total.toFixed(2)}</p>
          <button onClick={() => navigate("/checkout")}>Checkout</button>
        </div>
      )}
    </div>
  );
}
