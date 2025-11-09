import { PenSquare, Trash2 } from "lucide-react";
import { FullOrder, supabase, OrderStatus } from "../lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderFilter from "../logic/OrderFilter";
import toaster from "../ui/toaster";

interface OrderProps {
  Orders: FullOrder[];  
  loading: boolean;
  refreshOrders: () => Promise<void>;
}

export default function Orders({ Orders, loading, refreshOrders }: OrderProps) {
  const [confirmOrder, setConfirmOrder] = useState<number | null>(null);
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(Orders);

  const navigate = useNavigate();

  const handleConfirmOrder = (orderId: number, status: OrderStatus) => {
    setConfirmOrder(orderId);
    setStatus(status);
  };

  const handleCancelConfirm = () => {
    setConfirmOrder(null);
    setStatus("pending");
  };

  const handleOrderStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
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

  const handleEditOrder = (order: FullOrder) => {
    navigate(`/edit-order/${order.id}`, { state: { order } });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>

      {/* 🔍 Filter Bar */}
      <OrderFilter orders={Orders} onFilter={setFilteredOrders} />

      {filteredOrders.length === 0 ? (
        <p>No matching orders found.</p>
      ) : (
        <div>
          <div className="pb-5">
            <h3>Number of Orders: {filteredOrders.length}</h3>
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="relative bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <button
                  onClick={() => handleEditOrder(order)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-blue-600"
                >
                  <PenSquare size={18} />
                </button>

                <h3 className="font-semibold text-lg mb-1">
                  Order #{order.id} —{" "}
                  <span className="capitalize">{order.status}</span>
                </h3>
                <p className="text-sm text-gray-600">{order.customer_name}</p>
                <p className="font-medium mt-2">
                  Total: ${order.total_amount.toFixed(2)}
                </p>

                <ul className="list-disc ml-6 text-sm mt-2 text-gray-700">
                  {order.order_items.map((item) => (
                    <li key={item.menu_item_id}>
                      {item.menu_items.name} × {item.quantity}
                    </li>
                  ))}
                </ul>

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
                      <button
                        onClick={() =>
                          handleConfirmOrder(order.id, "completed")
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md w-full"
                      >
                        Complete
                      </button>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
