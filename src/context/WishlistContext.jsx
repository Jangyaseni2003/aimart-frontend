import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as wishlistApi from "../api/wishlist";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    try {
      const ids = await wishlistApi.getWishlist();
      setWishlistIds(ids);
    } catch {
      setWishlistIds([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  async function toggleWishlist(productId) {
    if (isWishlisted(productId)) {
      const ids = await wishlistApi.removeFromWishlist(productId);
      setWishlistIds(ids);
    } else {
      const ids = await wishlistApi.addToWishlist(productId);
      setWishlistIds(ids);
    }
  }

  const value = {
    wishlistIds,
    refreshWishlist,
    isWishlisted,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
