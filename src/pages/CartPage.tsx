import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CartPageProps {
  onNavigate: (page: 'menu') => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const totalAmount = getCartTotal();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          total_amount: totalAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      clearCart();
      setFormData({ name: '', email: '', phone: '' });
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        onNavigate('menu');
      }, 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-lg shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <ShoppingBag className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 text-lg">
            Thank you for your order. We'll contact you shortly.
          </p>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            Checkout
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="border-t pt-6">
                <div className="flex justify-between text-2xl font-bold text-gray-800 mb-6">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Add some delicious items from our menu
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Shopping Cart
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center py-6 border-b last:border-b-0"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1 ml-6">
                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                >
                  <Minus className="h-5 w-5 text-gray-700" />
                </button>
                <span className="text-xl font-bold text-gray-800 w-12 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors ml-4"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
              <div className="ml-6 text-xl font-bold text-gray-800 w-24 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-800">Total:</span>
            <span className="text-3xl font-bold text-orange-600">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => onNavigate('menu')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
