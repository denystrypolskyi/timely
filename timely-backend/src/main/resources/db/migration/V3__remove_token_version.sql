ALTER TABLE public.users
    DROP CONSTRAINT ck_users_token_version,
    DROP COLUMN token_version;
