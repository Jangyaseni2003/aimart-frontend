import client from "./client";

export function getSellerMetrics() {
  return client.get("/api/seller/dashboard/metrics").then((res) => res.data);
}

export function getSellerOrders() {
  return client.get("/api/seller/dashboard/orders").then((res) => res.data);
}

export function getSellerProducts() {
  return client.get("/api/seller/dashboard/products").then((res) => res.data);
}
