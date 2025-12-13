import { Edit2, Tag } from "lucide-react";
import { MenuItem } from "../lib/supabase";

interface MenuProps {
  Item: MenuItem;
  onEdit: () => void;
}

export default function MenuCard({ Item, onEdit }: MenuProps) {
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={Item.image_url || "https://placehold.co/600x400?text=No+Image"}
          alt={Item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {Item.special_item && (
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
              <Tag size={12} /> Special
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${Item.available
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white"
              }`}
          >
            {Item.available ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Edit Button (Visible on Hover) */}
        <button
          onClick={onEdit}
          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
          title="Edit Item"
        >
          <Edit2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight line-clamp-1" title={Item.name}>
            {Item.name}
          </h3>
          <span className="font-bold text-lg text-blue-600">
            ${Item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow" title={Item.description}>
          {Item.description || "No description available."}
        </p>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-medium">
          <span>{Item.category || "Uncategorized"}</span>
        </div>
      </div>
    </div>
  );
}
