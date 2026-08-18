import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as ordersApi from "../api/orders";
import * as paymentsApi from "../api/payments";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

const initialAddress = {
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      setStatus("Creating order...");
      const order = await ordersApi.createOrder(address);

      setStatus("Initiating payment...");
      const payment = await paymentsApi.createPayment(order._id);

      if (!RAZORPAY_KEY_ID) {
        setStatus("Order placed. Set VITE_RAZORPAY_KEY_ID to enable payment.");
        await refreshCartCount();
        return;
      }

      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: payment.price.amount,
        currency: payment.price.currency,
        order_id: payment.razorpayOrderId,
        name: "AIMART",
        description: `Order ${order._id}`,
        prefill: { email: user?.email, name: user?.username },
        handler: async (response) => {
          setStatus("Verifying payment...");
          try {
            await paymentsApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            await refreshCartCount();
            setStatus("Payment verified!");
            navigate(`/orders/${order._id}`);
          } catch {
            setError("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setStatus("Payment cancelled"),
        },
      });

      razorpay.open();
      setStatus("Complete payment in the Razorpay window.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <form className="form" onSubmit={handlePlaceOrder}>
        {error && <p className="form-error">{error}</p>}
        <label>
          Street
          <input required value={address.street} onChange={(e) => update("street", e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            City
            <input required value={address.city} onChange={(e) => update("city", e.target.value)} />
          </label>
          <label>
            State
            <input required value={address.state} onChange={(e) => update("state", e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Pincode
            <input
              required
              pattern="\d{4,}"
              title="At least 4 digits"
              value={address.pincode}
              onChange={(e) => update("pincode", e.target.value)}
            />
          </label>
          <label>
            Country
            <input required value={address.country} onChange={(e) => update("country", e.target.value)} />
          </label>
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Processing..." : "Place order & pay"}
        </button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
