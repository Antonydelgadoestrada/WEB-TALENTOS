-- ══════════════════════════════════════════
-- MIGRACIÓN: Tabla de Categorías
-- Ejecutar en: Supabase → SQL Editor → New query
-- (Solo si ya ejecutaste supabase-setup.sql antes)
-- ══════════════════════════════════════════

-- 1. Crear tabla de categorías
create table public.categories (
  id   bigint generated always as identity primary key,
  name text not null,
  slug text not null unique
);

-- 2. RLS
alter table public.categories enable row level security;

create policy "public_read_categories"
  on public.categories for select using (true);

create policy "auth_insert_categories"
  on public.categories for insert
  with check ((select auth.role()) = 'authenticated');

create policy "auth_update_categories"
  on public.categories for update
  using ((select auth.role()) = 'authenticated');

create policy "auth_delete_categories"
  on public.categories for delete
  using ((select auth.role()) = 'authenticated');

-- 3. Insertar las categorías base
insert into public.categories (name, slug) values
  ('Guitarras',          'guitarra'),
  ('Baterías',           'bateria'),
  ('Pianos / Teclados',  'teclado'),
  ('Vientos',            'viento'),
  ('Sonido / Consolas',  'sonido'),
  ('Accesorios',         'accesorios');
