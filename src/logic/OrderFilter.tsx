// src/logic/OrderFilter.tsx
import { useState, useEffect } from "react";
import { FullOrder } from "../lib/supabase";

interface OrderFilterProps {
  orders: FullOrder[];
  onFilter: (filteredOrders: FullOrder[]) => void;
}

export default function OrderFilter({ orders, onFilter }: OrderFilterProps) {
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const value = searchOrder.toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(value) ||
        order.customer_name?.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    onFilter(filtered);
  }, [searchOrder, statusFilter, orders, onFilter]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          placeholder="Search by order ID or customer name..."
          className="border border-gray-300 rounded-lg p-2 w-full sm:w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
}
