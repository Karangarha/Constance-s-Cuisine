import { useEffect, useState } from "react";
import { MenuItem, supabase } from "../lib/supabase";
import MenuCard from "../cards/MenuCard";
import EditMenuCard from "../cards/EditMenuCard";

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [special, setSpecial] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null); // <--- holds item being edited

  const fetchMenu = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSpecial(
        data.filter((item) => item.special_item === true) as MenuItem[]
      );
      setMenu(data.filter((item) => item.special_item === false) as MenuItem[]);
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

  return (
    <div>
      <div className="flex w-full justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Menu Management</h2>
        <button
          className="bg-red-500 text-white rounded-md px-6 py-2 hover:bg-red-600"
          onClick={() =>
            setEditingItem({
              id: "", // empty -> indicates adding a new item
              name: "",
              description: "",
              price: 0,
              category: "",
              image_url: "",
              available: true,
              created_at: new Date().toISOString(),
              special_item: false,
            })
          }
        >
          Add New Item
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-500 animate-pulse">Loading menu...</p>
        </div>
      )}

      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {!isLoading && menu.length === 0 && (
        <p className="text-gray-500 text-center">No menu items found.</p>
      )}

      <div className="px-10">
        {special.length > 0 ? (
          <>
            <h3 className="text-xl font-semibold mb-2">Special Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {special.map((item) => (
                <MenuCard
                  key={item.id}
                  Item={item}
                  onEdit={() => setEditingItem(item)}
                />
              ))}
            </div>
          </>
        ) : (
          <h3 className="text-gray-500 mb-6">No special items</h3>
        )}

        <div className="border border-2 border-gray-300 rounded-lg mb-6"></div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menu.map((item) => (
            <MenuCard
              key={item.id}
              Item={item}
              onEdit={() => setEditingItem(item)}
            />
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              {editingItem.id ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
            <EditMenuCard
              item={editingItem}
              onClose={() => {
                setEditingItem(null);
                fetchMenu(); // refresh after saving
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
