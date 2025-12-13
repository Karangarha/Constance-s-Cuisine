import { useEffect, useState } from "react";
import { FullOrder, supabase } from "../lib/supabase";
import OrderHistory from "../components/OrderHistory";
import Orders from "../components/Orders";
import MenuManagement from "../components/MenuManagement";
import Analytics from "../components/Analytics";

type AdminTab = "orders" | "order history" | "menu" | "analytics";

export default function AdminPage() {
  const [currentTab, setCurrentTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(); // initial load

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Order change received:", payload);
          fetchOrders(false); // silent refresh
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        (payload) => {
          console.log("Order Item change received:", payload);
          fetchOrders(false); // silent refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items ( name )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data as FullOrder[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const renderMenu = () => (
    <div>
      <MenuManagement />
    </div>
  );



  const renderContent = () => {
    switch (currentTab) {
      case "order history":
        return <OrderHistory
          Orders={orders.filter(o => ['completed', 'delivered', 'picked_up', 'cancelled'].includes(o.status))}
          refreshOrders={fetchOrders}
        />;
      case "menu":
        return renderMenu();
      case "analytics":
        return <Analytics />;
      default:
        return (
          <Orders
            Orders={orders.filter((order) =>
              ['pending', 'preparing', 'ready', 'on_way'].includes(order.status)
            )}
            loading={loading}
            refreshOrders={fetchOrders}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 ">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 ">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="space-y-3">
          <button
            onClick={() => setCurrentTab("orders")}
            className={`block w-full text-left px-3 py-2 rounded ${currentTab === "orders"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
              }`}
          >
            Orders
          </button>
          <button
            onClick={() => setCurrentTab("order history")}
            className={`block w-full text-left px-3 py-2 rounded ${currentTab === "order history"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
              }`}
          >
            Order History
          </button>
          <button
            onClick={() => setCurrentTab("menu")}
            className={`block w-full text-left px-3 py-2 rounded ${currentTab === "menu"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
              }`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setCurrentTab("analytics")}
            className={`block w-full text-left px-3 py-2 rounded ${currentTab === "analytics"
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
              }`}
          >
            Analytics
          </button>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={() => supabase.auth.signOut()}
              className="block w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
}
