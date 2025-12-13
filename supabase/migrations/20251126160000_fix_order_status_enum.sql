-- Add missing values to order_status enum
-- This migration adds the new statuses required for the tracking system

-- Note: ALTER TYPE ... ADD VALUE cannot be run inside a transaction block in older Postgres versions,
-- but is generally supported in migrations if they are not explicitly wrapped in BEGIN/COMMIT blocks that conflict.
-- However, Supabase migrations are transactional.
-- Postgres 12+ allows ADD VALUE in transaction.

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparing';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'on_way';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'picked_up';
