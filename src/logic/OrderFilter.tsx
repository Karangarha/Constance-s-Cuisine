// src/logic/OrderFilter.tsx
import { useState, useEffect } from "react";
import { FullOrder } from "../lib/supabase";

interface OrderFilterProps {
  orders: FullOrder[];
  onFilter: (filteredOrders: FullOrder[]) => void;
}

export default function OrderFilter({ orders, onFilter, counts = {}, allowedStatuses }: OrderFilterProps & { counts?: Record<string, number>, allowedStatuses?: string[] }) {
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const value = searchOrder.toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.id.toString().includes(value) ||
        order.customer_name?.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === 'ready' ? (order.status === 'ready' || order.status === 'on_way') : order.status === statusFilter);

      return matchesSearch && matchesStatus;
    });

    onFilter(filtered);
  }, [searchOrder, statusFilter, orders, onFilter]);

  const allTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const tabs = allowedStatuses
    ? allTabs.filter(tab => allowedStatuses.includes(tab.id))
    : allTabs;

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          placeholder="Search by order ID or customer name..."
          className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${statusFilter === tab.id
                ? 'bg-gray-900 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {tab.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${statusFilter === tab.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {counts[tab.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
