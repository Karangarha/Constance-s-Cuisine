import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

interface NavbarProps {
  currentPage: "home" | "menu" | "cart";
  onNavigate: (page: "home" | "menu" | "cart") => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMobileNavigate = (page: "home" | "menu" | "cart") => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      // Delay adding the scroll listener to avoid triggering it on the initial layout shift/open
      timeoutId = setTimeout(() => {
        window.addEventListener("scroll", handleScroll);
      }, 100);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-white backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <img src="src\public\logo.png" alt="logo" className="h-24" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate("home")}
              className={`text-lg font-medium transition-all ${
                currentPage === "home"
                  ? "bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent font-bold"
                  : "text-gray-600 hover:bg-gradient-to-t hover:from-brand-dark hover:to-brand-light hover:bg-clip-text hover:text-transparent"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("menu")}
              className={`text-lg font-medium transition-all ${
                currentPage === "menu"
                  ? "bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent font-bold"
                  : "text-gray-600 hover:bg-gradient-to-t hover:from-brand-dark hover:to-brand-light hover:bg-clip-text hover:text-transparent"
              }`}
            >
              Menu
            </button>
            <button onClick={() => onNavigate("cart")} className="relative">
              <ShoppingCart
                className={`h-6 w-6 transition-all ${
                  currentPage === "cart"
                    ? "text-brand-dark"
                    : "text-gray-600 hover:text-brand-dark"
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-t from-brand-dark to-brand-light text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-brand-dark"
            >
              {isMenuOpen ? (
                <X className="h-8 w-8" />
              ) : (
                <Menu className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden w-full bg-white border-t border-gray-100 shadow-inner animate-fade-in-up">
          <div className="flex flex-col space-y-4 px-6 py-6 h-auto">
            <button
              onClick={() => handleMobileNavigate("home")}
              className={`text-xl font-medium text-left py-2 border-b border-gray-50 ${
                currentPage === "home"
                  ? "bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent font-bold"
                  : "text-gray-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleMobileNavigate("menu")}
              className={`text-xl font-medium text-left py-2 border-b border-gray-50 ${
                currentPage === "menu"
                  ? "bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent font-bold"
                  : "text-gray-600"
              }`}
            >
              Menu
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
