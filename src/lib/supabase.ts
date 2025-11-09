import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type OrderStatus = 'pending'|'completed'|'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  available: boolean;
  created_at: string;
  special_item: boolean
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  
}

export interface FullOrder extends Order {
  order_items: (OrderItem & { menu_items: MenuItem[] })[];
}


