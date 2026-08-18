import client from "./client";

export function createPayment(orderId) {
  return client
    .post(`/api/payments/create/${orderId}`)
    .then((res) => res.data.payment);
}

export function verifyPayment({ razorpayOrderId, paymentId, signature }) {
  return client
    .post("/api/payments/verify", { razorpayOrderId, paymentId, signature })
    .then((res) => res.data);
}
