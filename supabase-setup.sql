-- ══════════════════════════════════════════
-- Casa Musical Talentos — Supabase Setup
-- Ejecutar en: Supabase → SQL Editor → New query
-- ══════════════════════════════════════════

-- 1. Crear tabla de productos
create table public.products (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  description text not null default '',
  category    text not null,
  price       numeric not null default 0,
  image       text not null default '',
  tag         text
);

-- 2. Habilitar Row Level Security
alter table public.products enable row level security;

-- 3. Política: cualquiera puede LEER (catálogo público)
create policy "public_read"
  on public.products for select
  using (true);

-- 4. Política: solo usuarios autenticados (admin) pueden INSERTAR
create policy "auth_insert"
  on public.products for insert
  with check ((select auth.role()) = 'authenticated');

-- 5. Política: solo admin puede ACTUALIZAR
create policy "auth_update"
  on public.products for update
  using ((select auth.role()) = 'authenticated');

-- 6. Política: solo admin puede ELIMINAR
create policy "auth_delete"
  on public.products for delete
  using ((select auth.role()) = 'authenticated');

-- ══════════════════════════════════════════
-- SIGUIENTE PASO:
-- Ve a Supabase → Authentication → Users → "Add user"
-- Crea el usuario del dueño con su email y contraseña.
-- Ese email+contraseña es el que usará para entrar al admin.
-- ══════════════════════════════════════════
