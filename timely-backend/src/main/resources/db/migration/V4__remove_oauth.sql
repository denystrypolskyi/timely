ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_oauth_identity_unique,
    DROP CONSTRAINT IF EXISTS users_oauth_identity_complete,
    DROP COLUMN IF EXISTS oauth_provider,
    DROP COLUMN IF EXISTS oauth_subject;
