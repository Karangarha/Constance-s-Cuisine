import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";

interface CartPageProps {
  onNavigate: (page: "menu") => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryMethod: "pickup" as "pickup" | "delivery",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "zelle" as "zelle" | "paypal" | "cash",
    paymentId: "",
  });
  const [storeSettings, setStoreSettings] = useState<{
    zelle_id: string;
    paypal_id: string;
  } | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setShowCheckout(true);

    // Fetch settings when entering checkout
    try {
      setLoadingSettings(true);
      const { data } = await supabase
        .from("store_settings")
        .select("zelle_id, paypal_id")
        .single();
      if (data) setStoreSettings(data);
    } catch (e) {
      console.error("Failed to load store settings", e);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const totalAmount = getCartTotal();

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          total_amount: totalAmount,
          status: "pending",
          delivery_method: formData.deliveryMethod,
          delivery_address:
            formData.deliveryMethod === "delivery"
              ? `${formData.address}, ${formData.city}, ${formData.zipCode}`
              : undefined,
          payment_method: formData.paymentMethod,
          payment_id:
            formData.paymentMethod === "cash" ? undefined : formData.paymentId,
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
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      clearCart();
      setFormData({
        name: "",
        email: "",
        phone: "",
        deliveryMethod: "pickup",
        address: "",
        city: "",
        zipCode: "",
        paymentMethod: "zelle",
        paymentId: "",
      });
      // Navigate to tracking page immediately
      onNavigate("menu"); // Reset to menu for main nav
      window.location.href = `/track/${orderData.id}`; // Force navigation to tracking page
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
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
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-brand-light transition-all placeholder-gray-400 font-medium"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-brand-light transition-all placeholder-gray-400 font-medium"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-brand-light transition-all placeholder-gray-400 font-medium"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-4">
                  Delivery Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, deliveryMethod: "pickup" })
                    }
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                      formData.deliveryMethod === "pickup"
                        ? "border-brand-light bg-brand-light/10 text-white relative overflow-hidden shadow-md transform scale-105 group"
                        : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {formData.deliveryMethod === "pickup" && (
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/10 to-brand-light/10 z-0" />
                    )}
                    <Store
                      className={`h-8 w-8 mb-2 z-10 ${
                        formData.deliveryMethod === "pickup"
                          ? "text-brand-dark"
                          : ""
                      }`}
                    />
                    <span
                      className={`font-bold z-10 ${
                        formData.deliveryMethod === "pickup"
                          ? "text-primary-600"
                          : ""
                      }`}
                    >
                      Pickup
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, deliveryMethod: "delivery" })
                    }
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                      formData.deliveryMethod === "delivery"
                        ? "border-brand-light bg-brand-light/10 text-white relative overflow-hidden shadow-md transform scale-105"
                        : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {formData.deliveryMethod === "delivery" && (
                      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/10 to-brand-light/10 z-0" />
                    )}
                    <Truck
                      className={`h-8 w-8 mb-2 z-10 ${
                        formData.deliveryMethod === "delivery"
                          ? "text-brand-dark"
                          : ""
                      }`}
                    />
                    <span
                      className={`font-bold z-10 ${
                        formData.deliveryMethod === "delivery"
                          ? "text-primary-600"
                          : ""
                      }`}
                    >
                      Delivery
                    </span>
                  </button>
                </div>
              </div>

              {formData.deliveryMethod === "delivery" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Street Address"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="ZIP Code"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-4">
                    Payment Method
                  </label>

                  {loadingSettings ? (
                    <div className="flex items-center gap-2 text-gray-500 py-4">
                      <Loader2 className="animate-spin" size={20} /> Loading
                      payment options...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: "zelle" })
                        }
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.paymentMethod === "zelle"
                            ? "border-[#6d1ed4] bg-[#6d1ed4]/10 text-brand-dark"
                            : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        <Smartphone
                          className={`h-6 w-6 mb-2 ${
                            formData.paymentMethod === "zelle"
                              ? "text-[#6d1ed4]"
                              : ""
                          }`}
                        />
                        <span
                          className={`font-bold text-sm ${
                            formData.paymentMethod === "zelle"
                              ? "text-[#6d1ed4]"
                              : ""
                          }`}
                        >
                          Zelle
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: "paypal" })
                        }
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.paymentMethod === "paypal"
                            ? "border-[#003087] bg-[#003087]/10 text-brand-dark"
                            : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-6 w-6 mb-2 ${
                            formData.paymentMethod === "paypal"
                              ? "text-[#003087]"
                              : ""
                          }`}
                        />
                        <span
                          className={`font-bold text-sm ${
                            formData.paymentMethod === "paypal"
                              ? "text-[#003087]"
                              : ""
                          }`}
                        >
                          PayPal
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: "cash" })
                        }
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.paymentMethod === "cash"
                            ? "border-green-600 bg-green-600/10 text-brand-dark"
                            : "border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        <Banknote
                          className={`h-6 w-6 mb-2 ${
                            formData.paymentMethod === "cash"
                              ? "text-green-600"
                              : ""
                          }`}
                        />
                        <span
                          className={`font-bold text-sm ${
                            formData.paymentMethod === "cash"
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          Cash
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {(formData.paymentMethod === "zelle" ||
                  formData.paymentMethod === "paypal") && (
                  <div className="animate-fadeIn space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm mb-4">
                      <p className="font-bold mb-1">Payment Instructions:</p>
                      <p>
                        Please send payment to:{" "}
                        <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-blue-900 font-bold select-all">
                          {formData.paymentMethod === "zelle"
                            ? storeSettings?.zelle_id || "Ask Admin"
                            : storeSettings?.paypal_id || "Ask Admin"}
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        {formData.paymentMethod === "zelle"
                          ? "Your Zelle Handle / Name"
                          : "Your PayPal Email"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.paymentId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all placeholder-gray-400 font-medium"
                        placeholder={
                          formData.paymentMethod === "zelle"
                            ? "Entering your name/number..."
                            : "Entering your email..."
                        }
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        We use this to match your payment with this order.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-t from-brand-dark to-brand-light hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Place Order • ${getCartTotal().toFixed(2)}</>
                )}
              </button>
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
            onClick={() => onNavigate("menu")}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
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
              className="flex flex-col md:flex-row md:items-center py-6 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 p-4 rounded-xl transition-colors gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center w-full md:w-auto">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shadow-sm"
                />
                <div className="flex-1 ml-4 md:ml-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full md:flex-1 md:justify-end">
                <div className="flex items-center space-x-3 md:space-x-4 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="bg-white hover:bg-white/80 p-2 rounded-lg shadow-sm transition-all text-gray-600 hover:text-primary-500"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold text-gray-800 w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="bg-white hover:bg-white/80 p-2 rounded-lg shadow-sm transition-all text-gray-600 hover:text-primary-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 md:gap-4 md:ml-8">
                  <div className="text-lg md:text-xl font-bold text-gray-800 min-w-[80px] text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-50 hover:bg-red-100 p-2 md:p-3 rounded-xl transition-colors group"
                  >
                    <Trash2 className="h-5 w-5 text-red-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-gray-800">Total:</span>
            <span className="text-3xl font-bold bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => onNavigate("menu")}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-gradient-to-t from-brand-dark to-brand-light hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
