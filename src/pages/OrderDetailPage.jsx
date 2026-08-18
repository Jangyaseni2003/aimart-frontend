import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as ordersApi from "../api/orders";
import StatusBadge from "../components/StatusBadge";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  function load() {
    ordersApi
      .getOrder(id)
      .then(setOrder)
      .catch(() => setError("Order not found"));
  }

  useEffect(load, [id]);

  async function handleCancel() {
    await ordersApi.cancelOrder(id);
    load();
  }

  if (error) return <p className="form-error">{error}</p>;
  if (!order) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Order #{order._id.slice(-8)}</h1>
      <StatusBadge status={order.status} />
      <p style={{ marginTop: 12 }}>
        Total: {order.totalPrice.currency} {order.totalPrice.amount}
      </p>
      <h3>Shipping address</h3>
      <p>
        {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
        {order.shippingAddress.state} {order.shippingAddress.zip},{" "}
        {order.shippingAddress.country}
      </p>
      <h3>Items</h3>
      <ul>
        {order.items.map((item, idx) => (
          <li key={idx}>
            Product {item.product} x{item.quantity} — {item.price.currency}{" "}
            {item.price.amount}
          </li>
        ))}
      </ul>
      {order.status === "PENDING" && (
        <button className="link-button" onClick={handleCancel}>
          Cancel order
        </button>
      )}
    </div>
  );
}
