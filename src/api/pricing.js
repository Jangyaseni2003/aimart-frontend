import client from "./client";

export function getPriceHistory(productId) {
  return client
    .get(`/api/products/${productId}/price-history`)
    .then((res) => res.data.data);
}

export function setCompetitorPrice(productId, competitorPrice) {
  return client
    .patch(`/api/products/${productId}/competitor-price`, { competitorPrice })
    .then((res) => res.data.product);
}

export function recalculatePrices() {
  return client.post("/api/products/pricing/recalculate").then((res) => res.data);
}
