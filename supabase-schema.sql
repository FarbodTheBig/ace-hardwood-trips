-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Trip sheets table
create table if not exists trip_sheets (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  driver_name   text,
  company_name  text default 'ACE HARDWOOD INC.',
  trip_numbers  text,
  truck_number  text,
  start_date_time text,
  end_date_time   text,
  start_km      text,
  end_km        text,
  total_km      numeric default 0,
  total_miles   numeric default 0,
  stops         jsonb default '[]',
  driver_signature text,
  signature_date   text,
  created_at    timestamptz default now()
);

-- RLS (Row Level Security) — each driver sees only their own trips
alter table trip_sheets enable row level security;

create policy "Users can view own trips"
  on trip_sheets for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trip_sheets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on trip_sheets for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on trip_sheets for delete
  using (auth.uid() = user_id);
