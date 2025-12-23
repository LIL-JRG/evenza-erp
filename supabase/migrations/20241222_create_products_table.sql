-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  sku text,
  price numeric default 0,
  stock integer default 0,
  image_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table products enable row level security;

-- Policies for products
create policy "Users can view their own products" on products
  for select using (auth.uid() = user_id);

create policy "Users can insert their own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on products
  for delete using (auth.uid() = user_id);

-- Create storage bucket for product images if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
create policy "Authenticated users can upload" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Users can update own images" on storage.objects for update using ( bucket_id = 'products' and auth.uid() = owner );
create policy "Users can delete own images" on storage.objects for delete using ( bucket_id = 'products' and auth.uid() = owner );
