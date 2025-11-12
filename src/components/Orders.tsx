import { CheckCircle, MinusCircle, PenSquare, Trash2 } from "lucide-react";
import { FullOrder, supabase, OrderStatus, itemStatus } from "../lib/supabase";
import { useState } from "react";
import OrderFilter from "../logic/OrderFilter";
import toaster from "../ui/toaster";

interface OrderProps {
  Orders: FullOrder[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
}
interface orderItemProp {
  item_id: string;
  order_item_status: itemStatus;
}
interface itemQuantityProp {
  item_id: string;
  quantity: number;
}

export default function Orders({ Orders, loading, refreshOrders }: OrderProps) {
  const [confirmOrder, setConfirmOrder] = useState<number | null>(null);

  const [status, setStatus] = useState<OrderStatus>("pending");

  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(Orders);

  const [orderEdit, setOrderEdit] = useState<number | null>(null);

  const [orderItemId, setOrderItemId] = useState<orderItemProp[]>([]);

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [itemQuantity,setItemQuantity] = useState<itemQuantityProp[]>([])

  // Toggle edit mode for an order
  const handleEdit = (orderId: number, isCurrentlyEditing: boolean) => {
    const nextEditState = !isCurrentlyEditing;
    setIsEdit(nextEditState);
    setOrderEdit(orderId);

    if (nextEditState) {
      const selectedOrder = Orders.find((order) => order.id === orderId);
      if (selectedOrder) {
        const items = selectedOrder.order_items.map((item) => ({
          item_id: item.item_id,
          order_item_status: item.order_item_status,
        }));
        setOrderItemId(items);
      }
    } else {
      setOrderItemId([]);
    }
  };

  // Toggle the status of a single order item (pending ↔ cancelled)
  const handleToggleItem = (item_id: string, order_item_status: itemStatus) => {
    setOrderItemId((prev) => {
      const exists = prev.find((i) => i.item_id === item_id);
      return exists
        ? prev.map((i) =>
            i.item_id === item_id ? { ...i, order_item_status } : i
          )
        : [...prev, { item_id, order_item_status }];
    });
  };

  // Prepare to confirm order completion/cancellation
  const handleConfirmOrder = (orderId: number, status: OrderStatus) => {
    setConfirmOrder(orderId);
    setStatus(status);
  };

  // Cancel the confirmation prompt
  const handleCancelConfirm = () => {
    setConfirmOrder(null);
    setStatus("pending");
  };

  // Exit edit mode for order items
  const handleItem = () => {
    setOrderEdit(null);
    setOrderItemId([]);
    setIsEdit(false);
  };

  // Update overall order status in Supabase
  const handleOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      // show success/error toast message
      toaster({
        type: status === "completed" ? "success" : "error",
        message:
          status === "completed"
            ? `Order #${orderId} marked as completed!`
            : `Order #${orderId} has been cancelled.`,
      });

      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setConfirmOrder(null);
    }
  };

  // Update each individual item’s status (used in edit mode)
  const handleItemStatus = async (items: orderItemProp[]) => {
    try {
      await Promise.all(
        items.map(({ item_id, order_item_status }) =>
          supabase
            .from("order_items")
            .update({ order_item_status })
            .eq("item_id", item_id)
        )
      );

      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order items:", error);
    } finally {
      setConfirmOrder(null);
    }
  };

  const handleItemQuanity = async (items: itemQuantityProp[]) => {
    try {
      await Promise.all(
        items.map(({ item_id, quantity }) =>
          supabase
            .from("order_items")
            .update({ quantity })
            .eq("item_id", item_id)
        )
      );
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order items:", error);
    } finally {
      setConfirmOrder(null);
    }
  };
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>

      {/* Filter Bar Component */}
      <OrderFilter orders={Orders} onFilter={setFilteredOrders} />

      {filteredOrders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <div>
          {/* Display total number of visible orders */}
          <div className="pb-5">
            <h3>Number of Orders: {filteredOrders.length}</h3>
          </div>

          {/*  Render each order card */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="relative bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition"
              >
                {/* Edit button (toggles item edit mode) */}
                <button
                  onClick={() => handleEdit(order.id, isEdit)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-blue-600"
                >
                  <PenSquare size={18} />
                </button>

                {/* Order details */}
                <h3 className="font-semibold text-lg mb-1">
                  Order #{order.id} —{" "}
                  <span className="capitalize">{order.status}</span>
                </h3>
                <p className="text-sm text-gray-600">{order.customer_name}</p>
                <p className="font-medium mt-2">
                  Total: ${order.total_amount.toFixed(2)}
                </p>

                {/* Render order items */}
                <ul className="list-disc ml-6 text-sm mt-2 text-gray-700">
                  {order.order_items.map((item) => (
                    <li key={item.menu_item_id}>
                      <div className="flex justify-between">
                        {/* strike-through cancelled items */}
                        <div
                          className={
                            item.order_item_status === "cancelled"
                              ? `line-through text-red-500`
                              : ``
                          }
                        >
                          {item.menu_items.name} × {item.quantity}{" "}
                        </div>

                        {/* toggle buttons for item status (edit mode only) */}
                        {isEdit &&
                          order.id === orderEdit &&
                          (orderItemId.some(
                            (i) =>
                              i.item_id === item.item_id &&
                              i.order_item_status === "cancelled"
                          ) ? (
                            <button
                              onClick={() =>
                                handleToggleItem(item.item_id, "pending")
                              }
                            >
                              <MinusCircle
                                className="bg-red-500 rounded-full"
                                color="white"
                                size={18}
                              />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleItem(item.item_id, "cancelled")
                              }
                            >
                              <CheckCircle
                                className="bg-green-500 rounded-full"
                                color="white"
                                size={18}
                              />
                            </button>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>

                {isEdit && order.id === orderEdit ? (
                  // edit mode — confirm item status changes
                  <div className="mt-4 flex gap-x-3">
                    <button
                      onClick={handleItem}
                      className="bg-gray-400 hover:bg-gray-500 text-white py-1 rounded-md w-full"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => handleItemStatus(orderItemId)}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 rounded-md w-full"
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  // normal mode — confirm order completion/cancellation
                  <div className="mt-4 flex gap-x-3">
                    {confirmOrder === order.id ? (
                      <>
                        <button
                          onClick={handleCancelConfirm}
                          className="bg-gray-400 hover:bg-gray-500 text-white py-1 rounded-md w-full"
                        >
                          Go Back
                        </button>
                        <button
                          onClick={() => handleOrderStatus(order.id, status)}
                          className={`${
                            status === "completed"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-red-500 hover:bg-red-600"
                          } text-white py-1 rounded-md w-full`}
                        >
                          Confirm
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Mark as complete */}
                        <button
                          onClick={() =>
                            handleConfirmOrder(order.id, "completed")
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md w-full"
                        >
                          Complete
                        </button>

                        {/* Cancel order */}
                        <button
                          onClick={() =>
                            handleConfirmOrder(order.id, "cancelled")
                          }
                          className="bg-red-500 hover:bg-red-600 text-white py-1 rounded-md w-12 flex justify-center items-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
