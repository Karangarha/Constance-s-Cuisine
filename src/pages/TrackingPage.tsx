import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase, FullOrder } from "../lib/supabase";
import {
  CheckCircle2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  ChefHat,
  Store,
} from "lucide-react";

const STEPS = [
  { status: "pending", label: "Order Received", icon: ShoppingBag },
  { status: "preparing", label: "Preparing", icon: ChefHat },
  { status: "ready", label: "Ready", icon: Package }, // Dynamic label based on method
  { status: "on_way", label: "On the Way", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function TrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<FullOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Order update:", payload);
          fetchOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items ( name, image_url )
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data as FullOrder);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Order Not Found
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isDelivery = order.delivery_method === "delivery";

  // Filter steps based on delivery method
  const visibleSteps = STEPS.filter((step) => {
    if (!isDelivery && step.status === "on_way") return false;
    return true;
  }).map((step) => {
    if (!isDelivery && step.status === "ready") {
      return { ...step, label: "Ready for Pickup" };
    }
    if (!isDelivery && step.status === "delivered") {
      return { ...step, label: "Picked Up" };
    }
    return step;
  });

  const activeStepIndex = visibleSteps.findIndex((s) => {
    if (order.status === "picked_up" || order.status === "completed")
      return s.status === "delivered";
    return s.status === order.status;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          <div className="bg-brand-dark p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-brand-light opacity-90" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">Order #{order.id}</h1>
                <p className="text-white/80 font-medium">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-white/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                <span className="font-bold capitalize tracking-wide">
                  {order.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="p-8">
            <div className="relative">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />

              {/* Active Progress Bar */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-dark to-brand-light -translate-y-1/2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (Math.max(0, activeStepIndex) / (visibleSteps.length - 1)) *
                    100
                  }%`,
                }}
              />

              {/* Steps */}
              <div className="relative flex justify-between">
                {visibleSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index <= activeStepIndex;

                  return (
                    <div
                      key={step.status}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                          isActive
                            ? "bg-gradient-to-t from-brand-dark to-brand-light border-brand-light text-white shadow-lg shadow-brand-dark/30 scale-110"
                            : "bg-white border-gray-100 text-gray-300"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <span
                        className={`mt-4 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                          isActive ? "text-gray-800" : "text-gray-300"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-primary-500" />
              Order Items
            </h2>
            <div className="space-y-6">
              {order.order_items.map((item) => (
                <div
                  key={item.item_id}
                  className={`flex items-center gap-4 ${
                    item.order_item_status === "cancelled" ? "opacity-50" : ""
                  }`}
                >
                  <img
                    src={item.menu_items.image_url}
                    alt={item.menu_items.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-bold text-gray-800 ${
                          item.order_item_status === "cancelled"
                            ? "line-through"
                            : ""
                        }`}
                      >
                        {item.menu_items.name}
                      </h3>
                      {item.order_item_status === "cancelled" && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-gray-800 ${
                      item.order_item_status === "cancelled"
                        ? "line-through"
                        : ""
                    }`}
                  >
                    ${(item.price_at_time * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-primary-500">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery/Pickup Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              {isDelivery ? (
                <MapPin className="text-primary-500" />
              ) : (
                <Store className="text-primary-500" />
              )}
              {isDelivery ? "Delivery Details" : "Pickup Details"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Customer
                </label>
                <p className="font-medium text-gray-800">
                  {order.customer_name}
                </p>
                <p className="text-sm text-gray-600">{order.customer_phone}</p>
              </div>

              {isDelivery && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Address
                  </label>
                  <p className="font-medium text-gray-800">
                    {order.delivery_address}
                  </p>
                </div>
              )}

              {!isDelivery && (
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                  <p className="text-sm text-primary-800 font-medium text-center">
                    Please show this screen to the staff when picking up your
                    order.
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/")}
                className="w-full mt-4 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
