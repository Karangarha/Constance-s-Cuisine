import { FullOrder } from "../lib/supabase";
import { useState } from "react";
import OrderFilter from "../logic/OrderFilter";

interface OrderHistoryProps {
  Orders: FullOrder[];
}

export default function OrderHistory({ Orders }: OrderHistoryProps) {
  const [filteredOrders, setFilteredOrders] = useState<FullOrder[]>(Orders);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders</h2>
      <OrderFilter orders={Orders} onFilter={setFilteredOrders} />
      <div className="pb-5">
            <h3>Orders found: {filteredOrders.length}</h3>
    </div>
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">
              Order #{order.id} — {order.status || "Pending"}
            </h3>
            <p>{order.customer_name}</p>
            <p>Total: ${order.total_amount.toFixed(2)}</p>
            <ul className="list-disc ml-5">
              {order.order_items.map((item) => (
                <li key={item.menu_item_id}>
                  {item.menu_items.name} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
