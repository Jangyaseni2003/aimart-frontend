import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as productsApi from "../api/products";
import * as cartApi from "../api/cart";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { refreshCartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(
      wishlistIds.map((id) => productsApi.getProduct(id).catch(() => null))
    )
      .then((results) => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  async function handleAddToCart(productId) {
    await cartApi.addItemToCart(productId, 1);
    await refreshCartCount();
  }

  if (loading) return <p>Loading wishlist...</p>;

  return (
    <div className="page">
      <h1>My Wishlist</h1>
      {products.length === 0 && (
        <p>
          Nothing saved yet. <Link to="/">Browse products</Link>
        </p>
      )}
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <Link to={`/products/${product._id}`}>
              <div className="product-image">
                {product.images?.[0]?.thumbnail ? (
                  <img src={product.images[0].thumbnail} alt={product.title} />
                ) : (
                  <div className="product-image-placeholder">No image</div>
                )}
              </div>
              <h3>{product.title}</h3>
              <p className="product-price">
                {product.currency} {product.dynamicPrice ?? product.price}
                {product.dynamicPrice != null &&
                  product.dynamicPrice !== product.price && (
                    <span className="price-was">
                      {product.currency} {product.price}
                    </span>
                  )}
              </p>
            </Link>
            <StarRating value={product.avgRating} count={product.reviewCount} />
            <div className="wishlist-card-actions">
              <button onClick={() => handleAddToCart(product._id)}>Add to cart</button>
              <button
                className="link-button"
                onClick={() => toggleWishlist(product._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
