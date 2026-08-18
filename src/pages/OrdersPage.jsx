import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ordersApi from "../api/orders";
import StatusBadge from "../components/StatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>You have no orders yet.</p>;

  return (
    <div className="page">
      <h1>My Orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <Link to={`/orders/${order._id}`} key={order._id} className="order-row">
            <span>#{order._id.slice(-8)}</span>
            <StatusBadge status={order.status} />
            <span>
              {order.totalPrice.currency} {order.totalPrice.amount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
