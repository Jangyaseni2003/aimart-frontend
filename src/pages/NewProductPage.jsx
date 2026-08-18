import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as productsApi from "../api/products";

const initialForm = {
  title: "",
  description: "",
  priceAmount: "",
  priceCurrency: "INR",
  category: "",
  stock: "",
};

export default function NewProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      images.forEach((file) => formData.append("images", file));

      await productsApi.createProduct(formData);
      navigate("/seller");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>New Product</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label>
          Title
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            Price
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={form.priceAmount}
              onChange={(e) => update("priceAmount", e.target.value)}
            />
          </label>
          <label>
            Currency
            <select
              value={form.priceCurrency}
              onChange={(e) => update("priceCurrency", e.target.value)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Category
            <input value={form.category} onChange={(e) => update("category", e.target.value)} />
          </label>
          <label>
            Stock
            <input
              type="number"
              required
              min={0}
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </label>
        </div>
        <label>
          Images (up to 5)
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
          />
        </label>
        {previews.length > 0 && (
          <div className="image-preview-row">
            {previews.map((url, idx) => (
              <img key={idx} src={url} alt={`Preview ${idx + 1}`} />
            ))}
          </div>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
