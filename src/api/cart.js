import client from "./client";

export function getCart() {
  return client.get("/api/cart").then((res) => res.data);
}

export function addItemToCart(productId, qty = 1) {
  return client
    .post("/api/cart/items", { productId, qty })
    .then((res) => res.data.cart);
}

export function updateCartItem(productId, qty) {
  return client
    .patch(`/api/cart/updatecart/${productId}`, { qty })
    .then((res) => res.data.cart);
}

export function removeCartItem(productId) {
  return client
    .delete(`/api/cart/deletecartitem/${productId}`)
    .then((res) => res.data.cart);
}
