# TODO - Agregar Localidad y Provincia en InfoTorneo.jsx

## Tareas Completadas
- [x] Actualizar la consulta Supabase en `fetchTorneo` para incluir `Localidad` y `Provinicia` de la tabla `Cancha`.
- [x] Agregar dos nuevos elementos `<p>` en la sección `info-torneo-details` para mostrar Localidad y Provincia.
- [x] Verificar que los cambios se apliquen correctamente en el archivo `InfoTorneo.jsx`.
- [x] Agregar navbar de filtro por provincia en Torneos.jsx similar a VerPartido.jsx.

## Próximos Pasos
- [ ] Probar el componente en el navegador para confirmar que los nuevos campos se renderizan con datos de la base de datos.
- [ ] Si los datos no aparecen, verificar que las canchas en la DB tengan los campos `Localidad` y `Provinicia` poblados.
- [ ] Ajustar estilos en `InfoTorneo.css` si es necesario para la presentación de los nuevos campos.
- [ ] Probar el filtro de provincia en Torneos.jsx para asegurar que funciona correctamente.
