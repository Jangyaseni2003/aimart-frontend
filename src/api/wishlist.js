import client from "./client";

export function getWishlist() {
  return client.get("/api/auth/users/me/wishlist").then((res) => res.data.wishlist);
}

export function addToWishlist(productId) {
  return client
    .post(`/api/auth/users/me/wishlist/${productId}`)
    .then((res) => res.data.wishlist);
}

export function removeFromWishlist(productId) {
  return client
    .delete(`/api/auth/users/me/wishlist/${productId}`)
    .then((res) => res.data.wishlist);
}
