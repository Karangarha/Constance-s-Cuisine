import { useState } from "react";
import { MenuItem, supabase } from "../lib/supabase";

interface EditMenuCardProps {
  item: MenuItem;
  onClose: () => void;
}

export default function EditMenuCard({ item, onClose }: EditMenuCardProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    image_url: item.image_url,
    available: item.available,
    special_item: item.special_item,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (item.id) {
        // Update existing item
        const { error } = await supabase
          .from("menu_items")
          .update(formData)
          .eq("id", item.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase.from("menu_items").insert([formData]);
        if (error) throw error;
      }

      onClose(); // Close modal and refresh
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item.id) return; // Prevent deleting unsaved item

    const confirmDelete = confirm("Are you sure you want to remove this item?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", item.id);

      console.log("Deleting item id:", item.id);

      if (error) throw error;
      alert("Item removed successfully.");
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow space-y-3"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Image URL
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          <label className="text-gray-700 font-medium">Available</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="special_item"
            checked={formData.special_item}
            onChange={handleChange}
          />
          <label className="text-gray-700 font-medium">Special</label>
        </div>

        <div className="flex justify-between mt-6">
          {item.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? "Removing..." : "Remove Item"}
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 ml-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
