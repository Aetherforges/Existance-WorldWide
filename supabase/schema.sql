create extension if not exists "uuid-ossp";

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

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete set null,
  total numeric not null,
  status text default 'Pending',
  delivery_method text,
  shipping_name text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null default 1
);

-- Basic policies for development. Tighten these for production.
-- Enable row level security
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Public read products" on products
  for select using (true);

create policy "Authenticated manage products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Customers manage own record" on customers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Orders manage own" on orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Order items manage own" on order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
