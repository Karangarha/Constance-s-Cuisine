import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

interface FloatingCartProps {
  onNavigate: (page: "cart") => void;
}

export default function FloatingCart({ onNavigate }: FloatingCartProps) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <button
      onClick={() => onNavigate("cart")}
      className="fixed bottom-6 right-6 md:hidden bg-gradient-to-t from-brand-dark to-brand-light text-white p-4 rounded-full shadow-lg z-50 hover:scale-105 transition-transform animate-fade-in-up flex items-center justify-center"
      aria-label="View Cart"
    >
      <ShoppingCart className="w-6 h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border border-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}
