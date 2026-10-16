-- =====================================================================
-- OsteoAI assessment persistence schema.
--
-- Safe to run repeatedly: every statement is CREATE ... IF NOT EXISTS
-- or an idempotent ALTER. Nothing here drops a table, deletes a row or
-- resets a sequence.
--
-- Apply with:  python -m app.db.migrate      (from backend/)
-- =====================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    version     TEXT        PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- assessments
--
-- One row per successfully predicted assessment submitted through
-- POST /api/predict. Columns mirror app/schemas.py:
--   - the 22 model inputs are kept whole in `features` (JSONB), with a
--     few high-value fields promoted to real columns for querying;
--   - the prediction response is split into typed columns, with the
--     SHAP list kept as JSONB because it is a variable-length array of
--     objects.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assessments (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at                TIMESTAMPTZ      NOT NULL DEFAULT now(),

    -- Promoted input columns (nullable: every model feature is optional).
    age                       DOUBLE PRECISION,
    gender                    DOUBLE PRECISION,
    bmi                       DOUBLE PRECISION,

    -- Full validated request body, exactly as the model received it.
    features                  JSONB            NOT NULL,

    -- Prediction response.
    prediction                SMALLINT         NOT NULL,
    osteoporosis_probability  DOUBLE PRECISION NOT NULL,
    risk_level                TEXT             NOT NULL,
    model_version             TEXT             NOT NULL,
    threshold_used            DOUBLE PRECISION NOT NULL,
    shap_explanations         JSONB            NOT NULL DEFAULT '[]'::jsonb,

    CONSTRAINT assessments_prediction_values
        CHECK (prediction IN (0, 1)),
    CONSTRAINT assessments_probability_range
        CHECK (osteoporosis_probability >= 0 AND osteoporosis_probability <= 1),
    CONSTRAINT assessments_risk_level_not_blank
        CHECK (length(btrim(risk_level)) > 0)
);

CREATE INDEX IF NOT EXISTS assessments_created_at_idx
    ON assessments (created_at DESC);

CREATE INDEX IF NOT EXISTS assessments_risk_level_idx
    ON assessments (risk_level);

CREATE INDEX IF NOT EXISTS assessments_features_gin_idx
    ON assessments USING GIN (features);

INSERT INTO schema_migrations (version)
VALUES ('0001_assessments')
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------
-- users
--
-- Accounts for Sign In / Sign Up. Emails are stored trimmed and
-- lowercased (enforced by the CHECK), so the UNIQUE constraint is
-- effectively case-insensitive. Only an Argon2 hash is stored, never
-- the password.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name           TEXT        NOT NULL,
    email          TEXT        NOT NULL UNIQUE,
    password_hash  TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT users_email_lowercase
        CHECK (email = lower(btrim(email))),
    CONSTRAINT users_name_not_blank
        CHECK (length(btrim(name)) > 0)
);

INSERT INTO schema_migrations (version)
VALUES ('0002_users')
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------
-- lookup_cache
--
-- Short-lived cache for results fetched from the free OpenStreetMap
-- services (Nominatim geocoding, Overpass hospital searches). Those
-- services ask clients to cache and to keep request rates low. Rows
-- are disposable: expired ones are ignored on read and purged on write.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lookup_cache (
    cache_key   TEXT        PRIMARY KEY,
    payload     JSONB       NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lookup_cache_expires_at_idx
    ON lookup_cache (expires_at);

INSERT INTO schema_migrations (version)
VALUES ('0003_lookup_cache')
ON CONFLICT (version) DO NOTHING;

-- ---------------------------------------------------------------------
-- Per-user assessment history
--
-- Every assessment a signed-in user completes is kept here under their
-- account, so a new account starts empty and a returning user sees their
-- own history on any browser or device. `record` is the history entry
-- exactly as the app displays it ({id, savedAt, assessmentData,
-- predictionResult}); `record_id` is the app's id for it. Deleting a
-- user deletes their history.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_assessments (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    record_id   TEXT        NOT NULL,
    saved_at    TIMESTAMPTZ NOT NULL,
    record      JSONB       NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT user_assessments_unique_record UNIQUE (user_id, record_id)
);

CREATE INDEX IF NOT EXISTS user_assessments_user_saved_idx
    ON user_assessments (user_id, saved_at DESC);

-- Which account a stored prediction belongs to. Nullable: rows created
-- before accounts existed, or by a request without a token, have no owner.
ALTER TABLE assessments
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS assessments_user_id_idx
    ON assessments (user_id);

INSERT INTO schema_migrations (version)
VALUES ('0004_user_history')
ON CONFLICT (version) DO NOTHING;
