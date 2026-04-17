-- Run this in your Supabase SQL editor to create the contact form table.

create table if not exists public.contact_messages (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.contact_messages enable row level security;

-- Allow anonymous inserts (contact form submissions)
create policy "Allow public inserts"
  on public.contact_messages
  for insert
  to anon
  with check (true);

-- Only authenticated users (you) can read messages
create policy "Allow authenticated reads"
  on public.contact_messages
  for select
  to authenticated
  using (true);
