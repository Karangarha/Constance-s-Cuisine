import { SquarePen } from "lucide-react";
import { MenuItem } from "../lib/supabase";

interface Menuprops {
  Item: MenuItem;
  onEdit: () => void;
}

export default function MenuCard({ Item, onEdit }: Menuprops) {
  return (
    <div className="relative bg-white shadow rounded-lg">
      {Item.special_item ? (
        <h4 className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold absolute right-2 top-2">
          *Special
        </h4>
      ) : (
        ``
      )}

      <div key={Item.id} className="">
        <img
          src={Item.image_url}
          alt={Item.name}
          className="w-full h-44 object-cover rounded-t-md "
        />
        <div className="m-4">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg ">{Item.name}</h3>
            <button className="" onClick={onEdit}>
              <SquarePen className="text-gray-500" size={18} />
            </button>
          </div>
          <p className="text-gray-600">{Item.description}</p>
          <p className="font-semibold mt-2">${Item.price}</p>
          <p className="text-sm text-gray-500 capitalize">
            Category: {Item.category}
          </p>
          <p
            className={`text-sm font-medium mt-1 ${
              Item.available ? "text-green-600" : "text-red-500"
            }`}
          >
            {Item.available ? "Available" : "Unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
}
