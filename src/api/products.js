import client from "./client";

export function listProducts(params = {}) {
  return client.get("/api/products", { params }).then((res) => res.data.data);
}

export function getCategories() {
  return client.get("/api/products/categories").then((res) => res.data.data);
}

export function getProduct(id) {
  return client.get(`/api/products/${id}`).then((res) => res.data.data);
}

export function createProduct(formData) {
  return client
    .post("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data.product);
}

export function updateProduct(id, formData) {
  return client
    .patch(`/api/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data.product);
}

export function deleteProduct(id) {
  return client.delete(`/api/products/${id}`).then((res) => res.data);
}

export function listMyProducts(params = {}) {
  return client
    .get("/api/products/seller", { params })
    .then((res) => res.data.data);
}
