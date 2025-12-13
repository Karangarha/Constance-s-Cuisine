import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase, MenuItem } from "../lib/supabase";
import { useCart } from "../context/CartContext";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("available", true)
        .order("category", { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["all", "appetizer", "main", "dessert"];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-4">
          Our Menu
        </h1>
        <p className="text-center text-gray-600 text-lg mb-12">
          Discover our carefully curated selection of delicious dishes
        </p>

        <div className="flex justify-center mb-12 flex-wrap gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-gradient-to-t from-brand-dark to-brand-light text-white shadow-lg ring-2 ring-brand-light ring-offset-2"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>
                  {item.special_item && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
                      Chef's Special
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-dark transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-xl font-bold bg-gradient-to-t from-brand-dark to-brand-light bg-clip-text text-transparent">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-500 mb-6 leading-relaxed text-sm line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-gray-50 hover:bg-gradient-to-t hover:from-brand-dark hover:to-brand-light text-gray-800 hover:text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group/btn"
                  >
                    <Plus className="h-5 w-5 group-hover/btn:rotate-90 transition-transform" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-600 text-xl py-12">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
