import { useEffect, useState, useMemo } from "react";
import { MenuItem, supabase } from "../lib/supabase";
import MenuCard from "../cards/MenuCard";
import EditMenuCard from "../cards/EditMenuCard";
import { Search, Plus, Filter, UtensilsCrossed } from "lucide-react";

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Filter states
  const [activeTab, setActiveTab] = useState<"all" | "special">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMenu(data as MenuItem[]);
    } catch (error) {
      console.error("Error fetching menu:", error);
      setErrorMsg("Failed to fetch menu items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Derived state for filtering
  const filteredItems = useMemo(() => {
    return menu.filter((item) => {
      // Tab filter
      if (activeTab === "special" && !item.special_item) return false;

      // Search filter
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [menu, activeTab, searchQuery, selectedCategory]);

  // Extract unique categories for the filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(menu.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [menu]);

  const handleAddNew = () => {
    setEditingItem({
      id: "",
      name: "",
      description: "",
      price: 0,
      category: "",
      image_url: "",
      available: true,
      created_at: new Date().toISOString(),
      special_item: activeTab === "special", // Auto-check special if on special tab
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your restaurant's menu items, prices, and availability.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "all"
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab("special")}
            className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "special"
              ? "bg-white text-amber-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Special Items
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative min-w-[160px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm h-80 animate-pulse border border-gray-100"
            >
              <div className="h-48 bg-gray-200 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              Item={item}
              onEdit={() => setEditingItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <UtensilsCrossed size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-gray-500">No items found</p>
          <p className="text-sm">
            Try adjusting your search or filters, or add a new item.
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10"
            >
              ✕
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                {editingItem.id ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <EditMenuCard
                item={editingItem}
                onClose={() => {
                  setEditingItem(null);
                  fetchMenu();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
