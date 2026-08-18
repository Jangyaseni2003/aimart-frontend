import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as productsApi from "../api/products";
import { useWishlist } from "../context/WishlistContext";
import StarRating from "../components/StarRating";

const PAGE_SIZE = 20;

function StockBadge({ stock }) {
  if (stock <= 0) {
    return <span className="product-stock-badge out-of-stock">Out of stock</span>;
  }
  if (stock <= 5) {
    return <span className="product-stock-badge low-stock">Only {stock} left</span>;
  }
  return <span className="product-stock-badge in-stock">In stock</span>;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Top Rated" },
];

export default function ProductListPage() {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts(filters, { append = false } = {}) {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const params = { limit: PAGE_SIZE, skip: append ? products.length : 0 };
      if (filters.query) params.q = filters.query;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minprice = filters.minPrice;
      if (filters.maxPrice) params.maxprice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;
      const data = await productsApi.listProducts(params);
      setProducts((prev) => (append ? [...prev, ...data] : data));
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setError("Could not load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadProducts({ query: "", category: "", minPrice: "", maxPrice: "", sort: "newest" });
    productsApi.getCategories().then(setCategories).catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadProducts({ query, category, minPrice, maxPrice, sort });
  }

  function selectCategory(cat) {
    const next = cat === category ? "" : cat;
    setCategory(next);
    loadProducts({ query, category: next, minPrice, maxPrice, sort });
  }

  function changeSort(e) {
    const next = e.target.value;
    setSort(next);
    loadProducts({ query, category, minPrice, maxPrice, sort: next });
  }

  function loadMore() {
    loadProducts({ query, category, minPrice, maxPrice, sort }, { append: true });
  }

  return (
    <div className="page">
      <div className="hero">
        <h1>Shop smarter with AIMART</h1>
        <p>Browse the catalog, or ask AI-BUDDY to find exactly what you need.</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="filter-bar">
        <div className="filter-pills">
          <button
            className={`pill ${category === "" ? "pill-active" : ""}`}
            onClick={() => selectCategory("")}
            type="button"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill ${category === cat ? "pill-active" : ""}`}
              onClick={() => selectCategory(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>
        <form className="filter-controls" onSubmit={handleSearch}>
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          <button type="submit">Apply</button>
          <select value={sort} onChange={changeSort}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && products.length === 0 && <p>No products found.</p>}

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product._id}>
            <button
              className={`wishlist-heart ${isWishlisted(product._id) ? "wishlist-heart-active" : ""}`}
              onClick={() => toggleWishlist(product._id)}
              type="button"
              aria-label="Toggle wishlist"
            >
              ♥
            </button>
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
              <StarRating value={product.avgRating} count={product.reviewCount} />
              <StockBadge stock={product.stock} />
            </Link>
          </div>
        ))}
      </div>

      {!loading && hasMore && (
        <div className="load-more-row">
          <button onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more products"}
          </button>
        </div>
      )}
    </div>
  );
}
