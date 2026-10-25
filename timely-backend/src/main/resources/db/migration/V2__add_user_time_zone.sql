ALTER TABLE public.users
    ADD COLUMN time_zone VARCHAR(63) NOT NULL DEFAULT 'Europe/Warsaw';
