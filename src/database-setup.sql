-- Create the solicitudesEquipo table for team applications
CREATE TABLE IF NOT EXISTS public.solicitudesEquipo (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    idUsuario bigint NOT NULL,
    idEquipo bigint NOT NULL,
    estado character varying DEFAULT 'pendiente'::character varying,
    fecha timestamp without time zone DEFAULT now(),
    CONSTRAINT solicitudesEquipo_pkey PRIMARY KEY (id),
    CONSTRAINT solicitudesEquipo_idEquipo_fkey FOREIGN KEY (idEquipo) REFERENCES public.equipos(idEquipos),
    CONSTRAINT solicitudesEquipo_idUsuario_fkey FOREIGN KEY (idUsuario) REFERENCES public.Usuarios(idUsuarios)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_solicitudes_equipo ON public.solicitudesEquipo(idEquipo);
CREATE INDEX IF NOT EXISTS idx_solicitudes_usuario ON public.solicitudesEquipo(idUsuario);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.solicitudesEquipo(estado);
