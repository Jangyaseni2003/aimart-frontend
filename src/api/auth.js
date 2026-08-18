import client from "./client";

export function register(payload) {
  return client.post("/api/auth/register", payload).then((res) => res.data);
}

export function login(payload) {
  return client.post("/api/auth/login", payload).then((res) => res.data);
}

export function getCurrentUser() {
  return client.get("/api/auth/me").then((res) => res.data);
}

export function logout() {
  return client.get("/api/auth/logout").then((res) => res.data);
}
