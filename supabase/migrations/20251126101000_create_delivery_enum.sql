/*
  # Convert Delivery Method to Enum

  1. Changes
    - Create `delivery_type` enum
    - Convert `orders.delivery_method` to use `delivery_type`
*/

DO $$ 
BEGIN 
  -- Create the enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type') THEN
    CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
  END IF;

  -- Alter the column to use the new enum type
  -- We first drop the check constraint if it exists (Postgres names it table_column_check by default)
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_method_check;

  -- Then alter the column type
  ALTER TABLE orders 
    ALTER COLUMN delivery_method TYPE delivery_type 
    USING delivery_method::delivery_type;
    
END $$;
