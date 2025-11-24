import { MinusCircle, PenSquare, PlusCircle, Trash2 } from "lucide-react";
import { FullOrder, supabase, OrderStatus, itemStatus } from "../lib/supabase";
import { useEffect, useMemo, useState } from "react";
import OrderFilter from "../logic/OrderFilter";
import toaster from "../ui/toaster";

interface OrderProps {
  Orders: FullOrder[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
}

interface LocalOrderItem {
  item_id: string;
  quantity: number;
  order_item_status: itemStatus;
}

/**
 * Orders component (refactored)
 *
 * - Uses localEditedItems: a mapping of item_id -> LocalOrderItem for the order currently being edited
 * - Ensures quantity is always >= 1 (DB constraint)
 * - Cancelling an item toggles status to 'cancelled' but keeps quantity >= 1
 * - Batch updates quantity + status for all edited items
 */
export default function Orders({ Orders, loading, refreshOrders }: OrderProps) {
  // UI state
  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(Orders);
  const [isEdit, setIsEdit] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number | null>(null);

  // Mapping item_id => LocalOrderItem for currently edited order
  const [localEditedItems, setLocalEditedItems] = useState<Record<string, LocalOrderItem>>({});

  // Order-level confirm (complete / cancel)
  const [confirmOrder, setConfirmOrder] = useState<number | null>(null);
  const [confirmOrderStatus, setConfirmOrderStatus] = useState<OrderStatus>("pending");

  // Sync filteredOrders when Orders prop changes
  useEffect(() => {
    setFilteredOrders(Orders);
  }, [Orders]);

  // open edit mode and populate localEditedItems for that order
  const startEdit = (orderId: number) => {
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
    setIsEdit(true);
    setEditOrderId(orderId);
  };

  // revert edits
  const cancelEdit = () => {
    setLocalEditedItems({});
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
        ...(prev[item_id] ?? { item_id, order_item_status: "pending" as itemStatus, quantity: q }),
        quantity: q,
      },
    }));
  };

  const toggleItemCancelled = (item_id: string) => {
    setLocalEditedItems((prev) => {
      const existing = prev[item_id];
      if (!existing) return prev;
      const nextStatus: itemStatus = existing.order_item_status === "cancelled" ? "pending" : "cancelled";
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
  const updateItemStatus = async (items: LocalOrderItem[]) => {
    if (items.length === 0) {
      toaster({ type: "info", message: "No changes to save." });
      return;
    }

    try {
      // Map each item to an update promise
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

      toaster({ type: "success", message: "Items updated successfully!" });
      await refreshOrders();
      cancelEdit();
    } catch (err) {
      console.error("Failed to update order items:", err);
      toaster({ type: "error", message: "Failed to update items. Check console." });
    }
  };

  // Save edited items for current order
  const saveEditedItems = async () => {
    const items = Object.values(localEditedItems);
    await updateItemStatus(items);
  };

  // Order status update (complete / cancel)
  const handleOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;

      toaster({
        type: status === "completed" ? "success" : "error",
        message: status === "completed" ? `Order #${orderId} marked as completed!` : `Order #${orderId} has been cancelled.`,
      });

      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
      toaster({ type: "error", message: "Failed to update order status." });
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
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>

      <OrderFilter orders={Orders} onFilter={setFilteredOrders} />

      {filteredOrders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <>
          <div className="pb-5">
            <h3>Number of Orders: {filteredOrders.length}</h3>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const editingThis = isEdit && editOrderId === order.id;
              const localItems = editingThis ? localEditedItems : orderItemLookup[order.id] ?? {};
              return (
                <div
                  key={order.id}
                  className="relative bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  {/* Edit button */}
                  <button
                    onClick={() => (editingThis ? cancelEdit() : startEdit(order.id))}
                    className="absolute right-4 top-4 text-gray-500 hover:text-blue-600"
                    aria-label={editingThis ? "Close edit" : "Edit order"}
                  >
                    <PenSquare size={18} />
                  </button>

                  {/* Order details */}
                  <h3 className="font-semibold text-lg mb-1">
                    Order #{order.id} — <span className="capitalize">{order.status}</span>
                  </h3>
                  <p className="text-sm text-gray-600">{order.customer_name}</p>
                  <p className="font-medium mt-2">Total: ${Number(order.total_amount).toFixed(2)}</p>

                  {/* Items */}
                  <ul className="list-disc ml-6 text-sm mt-2 text-gray-700">
                    {order.order_items.map((item) => {
                      const local = localItems[item.item_id] ?? {
                        item_id: item.item_id,
                        quantity: Math.max(1, item.quantity),
                        order_item_status: item.order_item_status,
                      };

                      return (
                        <li key={item.item_id}>
                          <div className="flex justify-between items-center">
                            <div className={local.order_item_status === "cancelled" ? "line-through text-red-500" : ""}>
                              {item.menu_items.name} × {local.quantity}
                            </div>

                            {/* Edit controls shown only when editing this order */}
                            {editingThis && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setItemQuantity(item.item_id, local.quantity - 1)}
                                  aria-label="decrease quantity"
                                  className="disabled:opacity-50"
                                >
                                  <MinusCircle className="bg-red-500 rounded-full" color="white" size={18} />
                                </button>

                                <input
                                  type="number"
                                  min={1}
                                  value={local.quantity}
                                  onChange={(e) => setItemQuantity(item.item_id, Number(e.target.value))}
                                  className="w-14 text-center border rounded-md"
                                />

                                <button
                                  onClick={() => setItemQuantity(item.item_id, local.quantity + 1)}
                                  aria-label="increase quantity"
                                >
                                  <PlusCircle className="bg-green-500 rounded-full" color="white" size={18} />
                                </button>

                                {/* Cancel / uncancel toggle */}
                                <button
                                  onClick={() => toggleItemCancelled(item.item_id)}
                                  className={`px-2 py-1 rounded-md border ${
                                    local.order_item_status === "cancelled" ? "bg-red-100 border-red-400" : "bg-gray-100"
                                  }`}
                                  title={local.order_item_status === "cancelled" ? "Uncancel item" : "Cancel item"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Footer actions */}
                  <div className="mt-4 flex gap-x-3">
                    {editingThis ? (
                      <>
                        <button onClick={cancelEdit} className="bg-gray-400 hover:bg-gray-500 text-white py-1 rounded-md w-full">
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedItems}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md w-full"
                        >
                          Save changes
                        </button>
                      </>
                    ) : confirmOrder === order.id ? (
                      <>
                        <button onClick={() => { setConfirmOrder(null); setConfirmOrderStatus("pending"); }} className="bg-gray-400 hover:bg-gray-500 text-white py-1 rounded-md w-full">
                          Go Back
                        </button>
                        <button
                          onClick={() => handleOrderStatus(order.id, confirmOrderStatus)}
                          className={`${
                            confirmOrderStatus === "completed" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                          } text-white py-1 rounded-md w-full`}
                        >
                          Confirm
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setConfirmOrder(order.id); setConfirmOrderStatus("completed"); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md w-full"
                        >
                          Complete
                        </button>

                        <button
                          onClick={() => { setConfirmOrder(order.id); setConfirmOrderStatus("cancelled"); }}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 rounded-md w-12 flex justify-center items-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
