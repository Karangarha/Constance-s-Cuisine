import { FullOrder, supabase } from "../lib/supabase";
import { useState, useEffect, useMemo } from "react";
import OrderFilter from "../logic/OrderFilter";
import {
  Truck,
  Store,
  MapPin,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";
import toaster from "../ui/toaster";

interface OrderHistoryProps {
  Orders: FullOrder[];
  refreshOrders: (showLoading?: boolean) => Promise<void>;
}

export default function OrderHistory({
  Orders = [],
  refreshOrders,
}: OrderHistoryProps) {
  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(
    Orders || []
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFilteredOrders(Orders || []);
  }, [Orders]);

  const historyOrders = useMemo(() => {
    return (Orders || []).filter((o) =>
      ["completed", "cancelled", "delivered", "picked_up"].includes(o.status)
    );
  }, [Orders]);

  const filterCounts = useMemo(() => {
    return {
      all: historyOrders.length,
      completed: (Orders || []).filter((o) =>
        ["completed", "delivered", "picked_up"].includes(o.status)
      ).length,
      cancelled: (Orders || []).filter((o) => o.status === "cancelled").length,
    };
  }, [Orders, historyOrders.length]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleRevertOrder = async (
    orderId: string,
    currentStatus: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      setUpdatingId(orderId);

      // If cancelled -> Pending
      // If completed/delivered/etc -> Preparing (back to progress)
      const newStatus = currentStatus === "cancelled" ? "pending" : "preparing";

      // Reset all items to 'pending' whenever we revert the order.
      const { error: itemError } = await supabase
        .from("order_items")
        .update({ order_item_status: "pending" })
        .eq("order_id", orderId);

      if (itemError) throw itemError;

      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toaster({
        type: "success",
        message: `Order #${orderId} moved to ${newStatus.replace("_", " ")}.`,
      });

      await refreshOrders(false);
    } catch (error) {
      console.error("Failed to update order:", error);
      toaster({ type: "error", message: "Failed to revert order status." });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Order History</h2>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-500 mr-2">Total Orders:</span>
          <span className="font-bold text-gray-800">
            {filteredOrders.length}
          </span>
        </div>
      </div>

      <OrderFilter
        orders={historyOrders}
        onFilter={setFilteredOrders}
        allowedStatuses={["all", "completed", "cancelled"]}
        counts={filterCounts}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
          <p className="text-gray-500 text-lg">No matching orders found.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);

            return (
              <div
                key={order.id}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Header - Clickable to expand */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-gray-800">
                        #{order.id}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                          ["completed", "delivered", "picked_up"].includes(
                            order.status
                          )
                            ? "bg-green-100 text-green-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{order.customer_name}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="font-bold text-gray-800">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                        order.delivery_method === "delivery"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {order.delivery_method === "delivery" ? (
                        <Truck size={12} />
                      ) : (
                        <Store size={12} />
                      )}
                      <span className="capitalize">
                        {order.delivery_method}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) =>
                        handleRevertOrder(order.id, order.status, e)
                      }
                      disabled={updatingId === order.id}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title={
                        order.status === "cancelled"
                          ? "Revert to Pending"
                          : "Move to Progress"
                      }
                    >
                      <RotateCcw
                        size={20}
                        className={
                          updatingId === order.id ? "animate-spin" : ""
                        }
                      />
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50/30 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Info */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Customer Details
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {order.customer_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <span>{order.customer_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span>{order.customer_phone}</span>
                          </div>
                          {order.payment_method && (
                            <div className="flex items-center gap-2 mt-2 font-medium">
                              {order.payment_method === "zelle" && (
                                <Smartphone
                                  size={14}
                                  className="text-[#6d1ed4]"
                                />
                              )}
                              {order.payment_method === "paypal" && (
                                <CreditCard
                                  size={14}
                                  className="text-[#003087]"
                                />
                              )}
                              {order.payment_method === "cash" && (
                                <Banknote
                                  size={14}
                                  className="text-green-600"
                                />
                              )}
                              <span className="capitalize">
                                {order.payment_method}
                              </span>
                              {order.payment_id && (
                                <span className="text-gray-500 font-normal">
                                  ({order.payment_id})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      {order.delivery_method === "delivery" &&
                        order.delivery_address && (
                          <div className="bg-white p-4 rounded-lg border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                              Delivery Information
                            </h4>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin
                                size={14}
                                className="text-orange-500 mt-0.5"
                              />
                              <span>{order.delivery_address}</span>
                            </div>
                          </div>
                        )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Order Items
                      </h4>
                      <ul className="space-y-2">
                        {order.order_items.map((item) => (
                          <li
                            key={item.item_id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.order_item_status === "cancelled"
                                    ? "bg-red-400"
                                    : "bg-green-400"
                                }`}
                              />
                              <span
                                className={`text-gray-700 ${
                                  item.order_item_status === "cancelled"
                                    ? "line-through text-gray-400"
                                    : ""
                                }`}
                              >
                                <span className="font-medium">
                                  {item.quantity}x
                                </span>{" "}
                                {item.menu_items.name}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
