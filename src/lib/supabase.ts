import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type OrderStatus = 'pending'|'preparing'|'ready'|'on_way'|'delivered'|'picked_up'|'cancelled'|'completed'|'active';
export type itemStatus = 'pending'|'completed'|'cancelled';

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
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  payment_method?: 'zelle' | 'paypal' | 'cash';
  payment_id?: string;
}

export interface StoreSettings {
  id: number;
  zelle_id: string;
  paypal_id: string;
  created_at?: string;
}

export interface OrderItem {
  item_id:string
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  order_item_status: itemStatus;
}

export interface FullOrder extends Order {
  order_items: (OrderItem & { menu_items: MenuItem })[];
}


