/*
  # Update Status Check Constraint

  1. Changes
    - Drop any existing check constraint on `orders.status` to ensure new statuses are allowed.
    - We are using text type for status, so dropping the constraint (if any) allows all values.
*/

DO $$ 
BEGIN 
  -- Drop the check constraint if it exists (Postgres might name it orders_status_check or similar)
  -- We try to drop common names, but since we didn't explicitly name it in the first migration (it was inline), 
  -- it might be auto-generated. However, the first migration didn't have a CHECK constraint on status.
  -- This is just a safety measure in case one was added later.
  
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
  
END $$;
