import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentPage: 'home' | 'menu' | 'cart' ;
  onNavigate: (page: 'home' | 'menu' | 'cart') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-800">Constance's Cuisine</span>
          </div>

          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-lg font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className={`text-lg font-medium transition-colors ${
                currentPage === 'menu'
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className="relative"
            >
              <ShoppingCart
                className={`h-6 w-6 transition-colors ${
                  currentPage === 'cart'
                    ? 'text-orange-600'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
