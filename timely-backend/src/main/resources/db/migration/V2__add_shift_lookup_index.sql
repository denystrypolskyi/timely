CREATE INDEX IF NOT EXISTS idx_shifts_user_id_shift_start
    ON shifts (user_id, shift_start);
