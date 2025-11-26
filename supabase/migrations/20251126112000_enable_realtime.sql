-- Enable realtime for orders and order_items tables
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
