import client from "./client";

export function getProductReviews(productId) {
  return client
    .get(`/api/products/${productId}/reviews`)
    .then((res) => res.data.data);
}

export function submitReview(productId, { rating, comment }) {
  return client
    .post(`/api/products/${productId}/reviews`, { rating, comment })
    .then((res) => res.data.review);
}
