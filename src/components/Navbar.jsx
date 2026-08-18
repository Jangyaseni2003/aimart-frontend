import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        AIMART
      </Link>
      <nav className="navbar-links">
        <Link to="/">Shop</Link>
        {isAuthenticated && (
          <Link to="/orders">My Orders</Link>
        )}
        {isSeller && <Link to="/seller">Seller Dashboard</Link>}
        {isAuthenticated ? (
          <>
            <Link to="/wishlist" className="navbar-cart">
              Wishlist{wishlistIds.length > 0 ? ` (${wishlistIds.length})` : ""}
            </Link>
            <Link to="/cart" className="navbar-cart">
              Cart{itemCount > 0 ? ` (${itemCount})` : ""}
            </Link>
            <span className="navbar-user">Hi, {user?.username}</span>
            <button className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
