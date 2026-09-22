-- Required once for the public archive + Archived checkbox (Projects collection).
-- Safe to run multiple times.

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "archived" boolean DEFAULT false;
