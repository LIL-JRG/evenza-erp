create table if not exists product_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

alter table product_categories enable row level security;

create policy "Users can view their own product categories"
  on product_categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own product categories"
  on product_categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own product categories"
  on product_categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own product categories"
  on product_categories for delete
  using (auth.uid() = user_id);
