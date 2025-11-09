-- Create enum type for order status
create type order_status as enum ('pending', 'complete', 'cancelled');

alter table orders
  alter column status drop default,
  alter column status type order_status
  using status::order_status;

-- Step 3: re-add the default separately
alter table orders
  alter column status set default 'pending';
