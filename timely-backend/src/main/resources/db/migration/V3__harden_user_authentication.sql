ALTER TABLE users
    ADD COLUMN oauth_provider VARCHAR(32),
    ADD COLUMN oauth_subject VARCHAR(255),
    ADD COLUMN token_version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE users
    ADD CONSTRAINT users_oauth_identity_unique UNIQUE (oauth_provider, oauth_subject),
    ADD CONSTRAINT users_oauth_identity_complete CHECK (
        (oauth_provider IS NULL AND oauth_subject IS NULL)
        OR (oauth_provider IS NOT NULL AND oauth_subject IS NOT NULL)
    );
