-- ══════════════════════════════════════════
-- PASO 1 — Crear el bucket en Supabase Dashboard:
--   Storage → New bucket
--   Name: productos
--   Public bucket: ✓ activado
--
-- PASO 2 — Ejecutar este SQL en SQL Editor
-- ══════════════════════════════════════════

-- Política: solo el admin (usuario autenticado) puede subir imágenes
create policy "upload_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'productos');

-- Política: solo el admin puede eliminar imágenes
create policy "delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'productos');

-- Política: solo el admin puede actualizar/reemplazar imágenes
create policy "update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'productos');

-- Nota: la lectura pública la gestiona Supabase automáticamente
-- cuando el bucket está marcado como "Public".
