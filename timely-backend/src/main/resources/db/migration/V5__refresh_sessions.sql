CREATE TABLE public.refresh_sessions (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    expires_at TIMESTAMP(6) WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_refresh_sessions_user_id ON public.refresh_sessions(user_id);
