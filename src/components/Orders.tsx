import {
  MinusCircle,
  PenSquare,
  PlusCircle,
  Trash2,
  Truck,
  Store,
  MapPin,
  Phone,
  Mail,
  RotateCcw,
  CreditCard,
  Banknote,
  Smartphone,
  Settings,
} from "lucide-react";
import AdminSettings from "./AdminSettings";
import { FullOrder, supabase, OrderStatus, itemStatus } from "../lib/supabase";
import { useEffect, useMemo, useState } from "react";
import OrderFilter from "../logic/OrderFilter";
import toaster from "../ui/toaster";

interface OrderProps {
  Orders: FullOrder[];
  loading: boolean;
  refreshOrders: (showLoading?: boolean) => Promise<void>;
}

interface LocalOrderItem {
  item_id: string;
  quantity: number;
  order_item_status: itemStatus;
}

export default function Orders({ Orders, loading, refreshOrders }: OrderProps) {
  // UI state
  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(Orders);
  const [isEdit, setIsEdit] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  // Mapping item_id => LocalOrderItem for currently edited order
  const [localEditedItems, setLocalEditedItems] = useState<
    Record<string, LocalOrderItem>
  >({});
  const [editedAddress, setEditedAddress] = useState<string>("");

  // Order-level confirm (complete / cancel)
  const [confirmOrder, setConfirmOrder] = useState<string | null>(null);
  const [confirmOrderStatus, setConfirmOrderStatus] =
    useState<OrderStatus>("pending");

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Sync filteredOrders when Orders prop changes
  useEffect(() => {
    setFilteredOrders(Orders);
  }, [Orders]);

  // open edit mode and populate localEditedItems for that order
  const startEdit = (orderId: string) => {
    const order = Orders.find((o) => o.id === orderId);
    if (!order) return;

    const itemsMap: Record<string, LocalOrderItem> = {};
    order.order_items.forEach((it) => {
      itemsMap[it.item_id] = {
        item_id: it.item_id,
        quantity: Math.max(1, it.quantity), // ensure >=1
        order_item_status: it.order_item_status,
      };
    });

    setLocalEditedItems(itemsMap);
    setEditedAddress(order.delivery_address || "");
    setIsEdit(true);
    setEditOrderId(orderId);
  };

  // revert edits
  const cancelEdit = () => {
    setLocalEditedItems({});
    setEditedAddress("");
    setIsEdit(false);
    setEditOrderId(null);
  };

  // Helpers to update localEditedItems
  const setItemQuantity = (item_id: string, quantity: number) => {
    // enforce DB constraint quantity > 0 (so minimum 1)
    const q = Math.max(1, Math.floor(quantity));
    setLocalEditedItems((prev) => ({
      ...prev,
      [item_id]: {
        ...(prev[item_id] ?? {
          item_id,
          order_item_status: "pending" as itemStatus,
          quantity: q,
        }),
        quantity: q,
      },
    }));
  };

  const toggleItemCancelled = (item_id: string) => {
    setLocalEditedItems((prev) => {
      const existing = prev[item_id];
      if (!existing) return prev;
      const nextStatus: itemStatus =
        existing.order_item_status === "cancelled" ? "pending" : "cancelled";
      return {
        ...prev,
        [item_id]: {
          ...existing,
          order_item_status: nextStatus,
        },
      };
    });
  };

  // Batch update edited items to Supabase
  const updateOrderData = async (items: LocalOrderItem[], address: string) => {
    const currentOrder = Orders.find((o) => o.id === editOrderId);
    if (!currentOrder) return;

    // Check if anything changed
    const addressChanged =
      currentOrder.delivery_method === "delivery" &&
      address !== currentOrder.delivery_address;
    const itemsChanged = items.some((item) => {
      const original = currentOrder.order_items.find(
        (i) => i.item_id === item.item_id
      );
      return (
        original &&
        (original.quantity !== item.quantity ||
          original.order_item_status !== item.order_item_status)
      );
    });

    if (!itemsChanged && !addressChanged) {
      toaster({ type: "info", message: "No changes to save." });
      return;
    }

    try {
      // 1. Update items
      if (items.length > 0) {
        await Promise.all(
          items.map(({ item_id, order_item_status, quantity }) =>
            supabase
              .from("order_items")
              .update({
                order_item_status,
                quantity,
              })
              .eq("item_id", item_id)
          )
        );
      }

      // 2. Check if ALL items are now cancelled
      // Merge current items with updates to get the final state
      const allItemsStatus = currentOrder.order_items.map((original) => {
        const updated = items.find((i) => i.item_id === original.item_id);
        return updated ? updated.order_item_status : original.order_item_status;
      });

      const allCancelled = allItemsStatus.every(
        (status) => status === "cancelled"
      );

      // 3. Calculate new total amount
      let newTotal = 0;
      currentOrder.order_items.forEach((originalItem) => {
        const updatedItem = items.find(
          (i) => i.item_id === originalItem.item_id
        );
        const quantity = updatedItem
          ? updatedItem.quantity
          : originalItem.quantity;
        const status = updatedItem
          ? updatedItem.order_item_status
          : originalItem.order_item_status;

        if (status !== "cancelled") {
          newTotal += quantity * originalItem.price_at_time;
        }
      });

      // 4. Update order (address + total_amount + potentially status)
      const updates: any = { total_amount: newTotal };
      if (addressChanged) {
        updates.delivery_address = address;
      }
      if (allCancelled) {
        updates.status = "cancelled";
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", editOrderId);

      if (error) throw error;

      toaster({
        type: "success",
        message: allCancelled
          ? "Order cancelled (all items cancelled)."
          : "Order updated successfully!",
      });
      await refreshOrders(false);
      cancelEdit();
    } catch (err) {
      console.error("Failed to update order:", err);
      toaster({
        type: "error",
        message: "Failed to update order. Check console.",
      });
    }
  };

  // Save edited items for current order
  const saveChanges = async () => {
    const items = Object.values(localEditedItems);
    await updateOrderData(items, editedAddress);
  };
  // ...
  // Order status update (complete / cancel)
  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    console.log(`Attempting to update order ${orderId} to status: ${status}`);
    try {
      // Update order status
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Update successful:", data);

      // If cancelling order, also cancel ALL items
      if (status === "cancelled") {
        const { error: itemsError } = await supabase
          .from("order_items")
          .update({ order_item_status: "cancelled" })
          .eq("order_id", orderId);

        if (itemsError) {
          console.error("Supabase item update error:", itemsError);
          throw itemsError;
        }
      }

      toaster({
        type: "success",
        message: `Order #${orderId} status updated to ${status}`,
      });

      await refreshOrders(false);
    } catch (error: any) {
      console.error("Failed to update order:", error);
      toaster({
        type: "error",
        message: `Failed to update order: ${
          error.message || error.details || "Unknown error"
        }`,
      });
    } finally {
      setConfirmOrder(null);
      setConfirmOrderStatus("pending");
    }
  };

  // prepare an order's items for quick lookup (used for display when not editing)
  const orderItemLookup = useMemo(() => {
    const map: Record<string, Record<string, LocalOrderItem>> = {};
    Orders.forEach((o) => {
      map[o.id] = {};
      o.order_items.forEach((it) => {
        map[o.id][it.item_id] = {
          item_id: it.item_id,
          quantity: Math.max(1, it.quantity),
          order_item_status: it.order_item_status,
        };
      });
    });
    return map;
  }, [Orders]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Orders</h2>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-500 mr-2">Total Orders:</span>
          <span className="font-bold text-gray-800">
            {filteredOrders.length}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="ml-4 p-2 bg-white text-gray-600 hover:text-brand-dark rounded-lg shadow-sm border border-gray-200 transition-colors"
          title="Payment Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings && <AdminSettings onClose={() => setShowSettings(false)} />}

      <OrderFilter
        orders={Orders}
        onFilter={setFilteredOrders}
        allowedStatuses={["all", "pending", "preparing", "ready"]}
        counts={{
          all: Orders.length,
          pending: Orders.filter((o) => o.status === "pending").length,
          preparing: Orders.filter((o) => o.status === "preparing").length,
          ready: Orders.filter(
            (o) => o.status === "ready" || o.status === "on_way"
          ).length,
          completed: Orders.filter((o) => o.status === "completed").length,
          cancelled: Orders.filter((o) => o.status === "cancelled").length,
        }}
      />

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
          <p className="text-gray-500 text-lg">No matching orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {filteredOrders.map((order) => {
            const editingThis = isEdit && editOrderId === order.id;
            const localItems = editingThis
              ? localEditedItems
              : orderItemLookup[order.id] ?? {};

            return (
              <div
                key={order.id}
                className={`relative bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
                  editingThis
                    ? "ring-2 ring-blue-500 border-transparent"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-800">
                          Order #{order.id}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            order.status === "completed" ||
                            order.status === "delivered" ||
                            order.status === "picked_up"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium">
                        {order.customer_name}
                      </p>

                      {/* Contact Info */}
                      <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{order.customer_phone}</span>
                        </div>
                        {order.payment_method && (
                          <div className="flex items-center gap-2 font-medium text-brand-dark">
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
                              <Banknote size={14} className="text-green-600" />
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

                    <button
                      onClick={() =>
                        editingThis ? cancelEdit() : startEdit(order.id)
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        editingThis
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      title={editingThis ? "Cancel editing" : "Edit order"}
                    >
                      <PenSquare size={20} />
                    </button>
                  </div>

                  {/* Delivery Info Badge */}
                  <div className="flex flex-col gap-2 mt-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${
                          order.delivery_method === "delivery"
                            ? "bg-orange-50 text-orange-700 border border-orange-100"
                            : "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}
                      >
                        {order.delivery_method === "delivery" ? (
                          <>
                            <Truck size={14} />
                            <span className="font-semibold">Delivery</span>
                          </>
                        ) : (
                          <>
                            <Store size={14} />
                            <span className="font-semibold">Pickup</span>
                          </>
                        )}
                      </div>
                    </div>

                    {order.delivery_method === "delivery" && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                        <MapPin
                          size={14}
                          className="mt-0.5 flex-shrink-0 text-gray-400"
                        />
                        {editingThis ? (
                          <input
                            type="text"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            className="w-full border-b border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5 bg-transparent"
                            placeholder="Enter delivery address"
                          />
                        ) : (
                          <span>{order.delivery_address}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Order Items
                    </h4>
                    <ul className="space-y-3">
                      {order.order_items.map((item) => {
                        const local = localItems[item.item_id] ?? {
                          item_id: item.item_id,
                          quantity: Math.max(1, item.quantity),
                          order_item_status: item.order_item_status,
                        };

                        const originalItem = order.order_items.find(
                          (i) => i.item_id === item.item_id
                        );
                        const originalQuantity = originalItem
                          ? originalItem.quantity
                          : 0;
                        const hasQuantityChanged =
                          local.quantity !== originalQuantity;

                        return (
                          <li
                            key={item.item_id}
                            className="flex items-start justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 ${
                                  local.order_item_status === "cancelled"
                                    ? "bg-red-400"
                                    : "bg-green-400"
                                }`}
                              />
                              <span
                                className={`text-gray-700 ${
                                  local.order_item_status === "cancelled"
                                    ? "line-through text-gray-400"
                                    : ""
                                }`}
                              >
                                <span className="font-medium">
                                  {local.quantity}x
                                </span>{" "}
                                {item.menu_items.name}
                                {hasQuantityChanged && editingThis && (
                                  <span className="ml-2 text-xs text-orange-500 font-medium">
                                    (Was: {originalQuantity})
                                  </span>
                                )}
                              </span>
                            </div>

                            {editingThis && (
                              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                                <button
                                  onClick={() =>
                                    setItemQuantity(
                                      item.item_id,
                                      local.quantity - 1
                                    )
                                  }
                                  className="p-1 hover:bg-white rounded-md text-gray-500 hover:text-red-500 transition-colors disabled:opacity-30"
                                  disabled={local.quantity <= 1}
                                >
                                  <MinusCircle size={16} />
                                </button>

                                <span className="w-8 text-center font-medium text-sm">
                                  {local.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    setItemQuantity(
                                      item.item_id,
                                      local.quantity + 1
                                    )
                                  }
                                  className="p-1 hover:bg-white rounded-md text-gray-500 hover:text-green-500 transition-colors"
                                >
                                  <PlusCircle size={16} />
                                </button>

                                {hasQuantityChanged && (
                                  <button
                                    onClick={() =>
                                      setItemQuantity(
                                        item.item_id,
                                        originalQuantity
                                      )
                                    }
                                    className="p-1 hover:bg-white rounded-md text-orange-400 hover:text-orange-600 transition-colors"
                                    title="Revert quantity"
                                  >
                                    <RotateCcw size={14} />
                                  </button>
                                )}

                                <div className="w-px h-4 bg-gray-200 mx-1" />

                                <button
                                  onClick={() =>
                                    toggleItemCancelled(item.item_id)
                                  }
                                  className={`p-1 rounded-md transition-colors ${
                                    local.order_item_status === "cancelled"
                                      ? "bg-red-100 text-red-600"
                                      : "text-gray-400 hover:text-red-500 hover:bg-white"
                                  }`}
                                  title={
                                    local.order_item_status === "cancelled"
                                      ? "Restore item"
                                      : "Cancel item"
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="text-xl font-bold text-gray-800">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {editingThis ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveChanges}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    ) : confirmOrder === order.id ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="text-center mb-2">
                          <p className="text-sm text-gray-600">
                            Confirm {confirmOrderStatus.replace("_", " ")}{" "}
                            status?
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              setConfirmOrder(null);
                              setConfirmOrderStatus("pending");
                            }}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={() =>
                              handleOrderStatus(order.id, confirmOrderStatus)
                            }
                            className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${
                              confirmOrderStatus === "cancelled"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {/* Status Progression Buttons */}
                        {order.status === "pending" && (
                          <button
                            onClick={() => {
                              setConfirmOrder(order.id);
                              setConfirmOrderStatus("preparing");
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
                          >
                            Start Preparing
                          </button>
                        )}

                        {order.status === "preparing" && (
                          <button
                            onClick={() => {
                              setConfirmOrder(order.id);
                              setConfirmOrderStatus(
                                order.delivery_method === "delivery"
                                  ? "on_way"
                                  : "ready"
                              );
                            }}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-sm transition-colors"
                          >
                            Mark as{" "}
                            {order.delivery_method === "delivery"
                              ? "On the Way"
                              : "Ready"}
                          </button>
                        )}

                        {(order.status === "ready" ||
                          order.status === "on_way") && (
                          <button
                            onClick={() => {
                              setConfirmOrder(order.id);
                              setConfirmOrderStatus(
                                order.delivery_method === "delivery"
                                  ? "delivered"
                                  : "picked_up"
                              );
                            }}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors"
                          >
                            Mark as{" "}
                            {order.delivery_method === "delivery"
                              ? "Delivered"
                              : "Picked Up"}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setConfirmOrder(order.id);
                            setConfirmOrderStatus("cancelled");
                          }}
                          className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={18} />
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
