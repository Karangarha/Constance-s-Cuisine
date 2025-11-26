import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isWithinInterval, eachHourOfInterval, startOfDay, eachDayOfInterval, eachMonthOfInterval, setHours } from "date-fns";
import SalesChart from "../charts/SalesChart";

type AnalyticTab = "Overview" | "All Items";
type FilterType = "Day" | "Week" | "Month" | "All Time";

interface OrderItem {
  quantity: number;
  menu_items: {
    name: string;
  };
}

interface Order {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

export default function Analytics() {
  const [currentTab, setCurrentTab] = useState<AnalyticTab>("Overview");
  const [filterType, setFilterType] = useState<FilterType>("Day");
  // Initialize with local date string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0 });
  const [chartData, setChartData] = useState<{ x: string; y: number }[]>([]);
  const [itemSales, setItemSales] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [orders, filterType, selectedDate]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, 
        created_at, 
        total_amount, 
        status,
        order_items (
          quantity,
          menu_items (
            name
          )
        )
      `);

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      // @ts-ignore - Supabase types might not perfectly match nested structure without full generation
      setOrders(data || []);
    }
    setLoading(false);
  };

  const calculateAnalytics = () => {
    if (!orders.length) {
      setStats({ totalOrders: 0, totalSales: 0 });
      setChartData([]);
      setItemSales([]);
      return;
    }

    // Filter for completed orders first (case-insensitive)
    // Filter for completed orders ONLY.
    // This ensures cancelled or pending orders are not included in stats or item counts.
    let filteredOrders = orders.filter(order => order.status && order.status.toLowerCase() === 'completed');

    // Force local time parsing by appending time
    const date = new Date(selectedDate + 'T00:00:00');

    // Apply Time Filters
    switch (filterType) {
      case "Day":
        filteredOrders = filteredOrders.filter(order => isSameDay(new Date(order.created_at), date));
        break;
      case "Week":
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        filteredOrders = filteredOrders.filter(order =>
          isWithinInterval(new Date(order.created_at), { start: weekStart, end: weekEnd })
        );
        break;
      case "Month":
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        filteredOrders = filteredOrders.filter(order =>
          isWithinInterval(new Date(order.created_at), { start: monthStart, end: monthEnd })
        );
        break;
      case "All Time":
        // No additional filtering needed
        break;
    }

    // Calculate Stats
    const totalOrders = filteredOrders.length;
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    setStats({ totalOrders, totalSales });

    // Calculate Chart Data
    calculateChartData(filteredOrders, date);

    // Calculate Item Sales
    calculateItemSales(filteredOrders);
  };

  const calculateChartData = (filteredOrders: Order[], date: Date) => {
    let chartDataPoints: { x: string; y: number }[] = [];

    switch (filterType) {
      case "Day":
        // Generate hourly data points (07:00 - 23:00)
        const startHour = setHours(startOfDay(date), 7);
        const endHour = setHours(startOfDay(date), 23);
        const hours = eachHourOfInterval({ start: startHour, end: endHour });

        chartDataPoints = hours.map(hour => {
          const hourOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate.getHours() === hour.getHours();
          });
          return {
            x: format(hour, "HH:00"),
            y: hourOrders.reduce((sum, order) => sum + order.total_amount, 0)
          };
        });
        break;

      case "Week":
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        chartDataPoints = daysOfWeek.map(day => {
          const dayOrders = filteredOrders.filter(order => isSameDay(new Date(order.created_at), day));
          return {
            x: format(day, "EEE"), // Mon, Tue, etc.
            y: dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
          };
        });
        break;

      case "Month":
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const daysOfMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

        chartDataPoints = daysOfMonth.map(day => {
          const dayOrders = filteredOrders.filter(order => isSameDay(new Date(order.created_at), day));
          return {
            x: format(day, "d"), // 1, 2, 3...
            y: dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
          };
        });
        break;

      case "All Time":
        if (filteredOrders.length > 0) {
          const sortedOrders = [...filteredOrders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const firstOrderDate = new Date(sortedOrders[0].created_at);
          const lastOrderDate = new Date(); // Up to now

          const months = eachMonthOfInterval({ start: firstOrderDate, end: lastOrderDate });
          chartDataPoints = months.map(month => {
            const monthOrders = filteredOrders.filter(order => {
              const orderDate = new Date(order.created_at);
              return orderDate.getMonth() === month.getMonth() && orderDate.getFullYear() === month.getFullYear();
            });
            return {
              x: format(month, "MMM yyyy"),
              y: monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
            };
          });
        }
        break;
    }
    setChartData(chartDataPoints);
  };

  const calculateItemSales = (filteredOrders: Order[]) => {
    const itemMap = new Map<string, number>();

    filteredOrders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          const itemName = item.menu_items?.name || "Unknown Item";
          const currentQty = itemMap.get(itemName) || 0;
          itemMap.set(itemName, currentQty + item.quantity);
        });
      }
    });

    const sortedItems = Array.from(itemMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    setItemSales(sortedItems);
  };

  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-white p-4 rounded-lg shadow-sm">
      <div className="flex gap-2">
        {(["Day", "Week", "Month", "All Time"] as FilterType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filterType === type
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filterType !== "All Time" && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {filterType === "Week" && <span className="text-xs text-gray-500">(Select any day in the week)</span>}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Orders</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "..." : stats.totalOrders}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Sales</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {loading ? "..." : `$${stats.totalSales.toFixed(2)}`}
        </p>
      </div>
    </div>
  );

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {renderFilters()}
        {renderStats()}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <SalesChart data={chartData} range={filterType} />
        </div>
      </div>
    );
  };

  const renderAllItems = () => {
    return (
      <div className="space-y-6">
        {renderFilters()}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemSales.length > 0 ? (
            itemSales.map((item, index) => (
              <div key={item.name} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold mb-4">
                  #{index + 1}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-500 text-sm uppercase tracking-wider">Quantity Sold</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{item.quantity}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg">No items sold in this period.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case "All Items":
        return renderAllItems();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
      </div>

      <div className="flex w-full mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setCurrentTab("Overview")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${currentTab === "Overview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentTab("All Items")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${currentTab === "All Items"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            All Items
          </button>
        </nav>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}
