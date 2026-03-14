-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- PRODUCTS
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  price numeric not null,
  cost numeric,
  category text,
  stock integer default 0,
  images text[],
  created_at timestamp with time zone default now()
);

-- CUSTOMERS
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique,
  customer_id uuid references customers(id) on delete set null,
  total numeric not null,
  status text default 'Pending',
  delivery_method text,
  tracking_number text,
  shipping_name text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

-- ORDER ITEMS
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1
);

-- WALK-IN SALES
create table if not exists walk_in_sales (
  id uuid primary key default uuid_generate_v4(),
  amount numeric not null,
  note text,
  created_at timestamp with time zone default now()
);

-- USER ROLES (RBAC)
create table if not exists user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff','customer')),
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- RLS
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table user_roles enable row level security;
alter table walk_in_sales enable row level security;

-- PRODUCTS POLICIES
drop policy if exists "Public read products" on products;
create policy "Public read products" on products
for select using (true);

drop policy if exists "Admin manage products" on products;
create policy "Admin manage products" on products
for all using (is_admin()) with check (is_admin());

-- CUSTOMERS POLICIES
drop policy if exists "Authenticated insert customers" on customers;
create policy "Authenticated insert customers" on customers
for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage customers" on customers;
create policy "Admin manage customers" on customers
for all using (is_admin()) with check (is_admin());

-- ORDERS POLICIES
drop policy if exists "Authenticated insert orders" on orders;
create policy "Authenticated insert orders" on orders
for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage orders" on orders;
create policy "Admin manage orders" on orders
for all using (is_admin()) with check (is_admin());

-- ORDER ITEMS POLICIES
drop policy if exists "Authenticated insert order items" on order_items;
create policy "Authenticated insert order items" on order_items
for insert with check (auth.role() = 'authenticated');

drop policy if exists "Admin manage order items" on order_items;
create policy "Admin manage order items" on order_items
for all using (is_admin()) with check (is_admin());

-- WALK-IN SALES POLICIES
drop policy if exists "Admin manage walk in sales" on walk_in_sales;
create policy "Admin manage walk in sales" on walk_in_sales
for all using (is_admin()) with check (is_admin());
