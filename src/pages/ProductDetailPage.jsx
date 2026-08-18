import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as productsApi from "../api/products";
import * as cartApi from "../api/cart";
import * as reviewsApi from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import StarRating from "../components/StarRating";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  function loadProduct() {
    productsApi
      .getProduct(id)
      .then((p) => {
        setProduct(p);
        setActiveImage(0);
      })
      .catch(() => setError("Product not found"));
  }

  function loadReviews() {
    reviewsApi.getProductReviews(id).then(setReviews).catch(() => setReviews([]));
  }

  useEffect(() => {
    loadProduct();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setStatus("Adding...");
    try {
      await cartApi.addItemToCart(id, Number(qty));
      await refreshCartCount();
      setStatus("Added to cart!");
    } catch (err) {
      setStatus(err.response?.data?.message || "Could not add to cart");
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!myRating) {
      setReviewStatus("Pick a star rating first");
      return;
    }
    setReviewStatus("Saving...");
    try {
      await reviewsApi.submitReview(id, { rating: myRating, comment: myComment });
      setReviewStatus("Thanks for your review!");
      setMyRating(0);
      setMyComment("");
      loadReviews();
      loadProduct();
    } catch (err) {
      setReviewStatus(err.response?.data?.message || "Could not save review");
    }
  }

  if (error) return <p className="form-error">{error}</p>;
  if (!product) return <p>Loading...</p>;

  const images = product.images || [];

  return (
    <div className="page">
      <div className="product-detail">
        <div>
          <div className="product-detail-image">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.title} />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="thumbnail-row">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  className={`thumbnail ${idx === activeImage ? "thumbnail-active" : ""}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img.thumbnail || img.url} alt={`${product.title} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-detail-info">
          <div className="page-header">
            <h1>{product.title}</h1>
            <button
              className={`wishlist-heart ${isWishlisted(product._id) ? "wishlist-heart-active" : ""}`}
              onClick={() => toggleWishlist(product._id)}
              type="button"
              aria-label="Toggle wishlist"
            >
              ♥
            </button>
          </div>
          <StarRating value={product.avgRating} count={product.reviewCount} />
          <p className="product-price">
            {product.currency} {product.dynamicPrice ?? product.price}
            {product.dynamicPrice != null &&
              product.dynamicPrice !== product.price && (
                <span className="price-was">
                  {product.currency} {product.price}
                </span>
              )}
          </p>
          <p>{product.description}</p>
          <p className="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <div className="add-to-cart-row">
            <input
              type="number"
              min={1}
              max={Math.max(product.stock, 1)}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button onClick={handleAddToCart} disabled={product.stock < 1}>
              Add to cart
            </button>
          </div>
          {status && <p>{status}</p>}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews ({reviews.length})</h2>

        {isAuthenticated && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <StarRating value={myRating} onChange={setMyRating} />
            <textarea
              placeholder="Share your thoughts about this product (optional)"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
            />
            <button type="submit">Submit review</button>
            {reviewStatus && <p>{reviewStatus}</p>}
          </form>
        )}

        {reviews.length === 0 && <p>No reviews yet. Be the first to review this product.</p>}
        <div className="review-list">
          {reviews.map((r) => (
            <div className="review-item" key={r._id}>
              <div className="review-item-header">
                <strong>{r.username}</strong>
                <StarRating value={r.rating} />
              </div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
