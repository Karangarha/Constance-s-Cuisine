/*
  # Add Delivery Fields to Orders

  1. Changes
    - Add `delivery_method` column to `orders` table
    - Add `delivery_address` column to `orders` table
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_method') THEN
    ALTER TABLE orders ADD COLUMN delivery_method text CHECK (delivery_method IN ('pickup', 'delivery'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE orders ADD COLUMN delivery_address text;
  END IF;
END $$;
