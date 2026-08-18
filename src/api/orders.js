import client from "./client";

export function createOrder(shippingAddress) {
  return client.post("/api/orders", { shippingAddress }).then((res) => res.data.order);
}

export function getMyOrders(params = {}) {
  return client.get("/api/orders/me", { params }).then((res) => res.data);
}

export function getOrder(id) {
  return client.get(`/api/orders/${id}`).then((res) => res.data.order);
}

export function cancelOrder(id) {
  return client.post(`/api/orders/${id}/cancel`).then((res) => res.data.order);
}

export function updateOrderStatus(id, status) {
  return client
    .patch(`/api/orders/${id}/status`, { status })
    .then((res) => res.data.order);
}
