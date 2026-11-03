-- Correct the Sprint 10B phone constraint.
-- Accept an optional leading + followed by 7–15 digits.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_phone_format,
  ADD CONSTRAINT profiles_phone_format
    CHECK (
      phone IS NULL
      OR phone ~ '^[+]?[0-9]{7,15}$'
    );