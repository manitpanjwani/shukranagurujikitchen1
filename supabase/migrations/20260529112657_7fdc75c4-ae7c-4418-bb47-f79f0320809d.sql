
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
grant insert, update, delete on public.categories to authenticated;
alter table public.categories enable row level security;

create policy "public read categories" on public.categories for select using (true);
create policy "admin write categories" on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Menu items
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  is_veg boolean not null default true,
  is_bestseller boolean not null default false,
  in_stock boolean not null default true,
  rating numeric(2,1) not null default 4.5,
  reviews_count int not null default 0,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.menu_items to anon, authenticated;
grant all on public.menu_items to service_role;
grant insert, update, delete on public.menu_items to authenticated;
alter table public.menu_items enable row level security;

create policy "public read menu_items" on public.menu_items for select using (true);
create policy "admin write menu_items" on public.menu_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Offers
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  code text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
grant insert, update, delete on public.offers to authenticated;
alter table public.offers enable row level security;

create policy "public read offers" on public.offers for select using (true);
create policy "admin write offers" on public.offers
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- FAQs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.faqs to anon, authenticated;
grant all on public.faqs to service_role;
grant insert, update, delete on public.faqs to authenticated;
alter table public.faqs enable row level security;

create policy "public read faqs" on public.faqs for select using (true);
create policy "admin write faqs" on public.faqs
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;

create policy "anyone submits message" on public.contact_messages for insert with check (true);
create policy "admin reads messages" on public.contact_messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin deletes messages" on public.contact_messages
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "admin upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "admin update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

create policy "admin delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
