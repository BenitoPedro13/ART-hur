import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Site → About tab, plus the two contact fields the /contact page reads.
 *
 * Written idempotently and trimmed by hand for the same reason as the two
 * migrations before it: this project spent its early life on Payload's dev
 * "push" mode, so `migrate:create` diffs against a snapshot that lags the real
 * database. The generated version also re-issued `background_video_playback`,
 * which 20260813_202700 already owns — that is dropped here rather than run
 * twice.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_about_disciplines" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "site_about_disciplines_locales" (
      "label" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "about_portrait_id" integer;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "about_heading" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "about_standfirst" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "about_bio" jsonb;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "about_based_in" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "about_availability" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "contact_intro" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "contact_availability" varchar;

    DO $$ BEGIN
      ALTER TABLE "site_about_disciplines"
        ADD CONSTRAINT "site_about_disciplines_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "site_about_disciplines_locales"
        ADD CONSTRAINT "site_about_disciplines_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_about_disciplines"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "site"
        ADD CONSTRAINT "site_about_portrait_id_media_id_fk"
        FOREIGN KEY ("about_portrait_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_about_disciplines_order_idx"
      ON "site_about_disciplines" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_about_disciplines_parent_id_idx"
      ON "site_about_disciplines" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "site_about_disciplines_locales_locale_parent_id_unique"
      ON "site_about_disciplines_locales" USING btree ("_locale","_parent_id");
    CREATE INDEX IF NOT EXISTS "site_about_about_portrait_idx"
      ON "site" USING btree ("about_portrait_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_about_disciplines_locales" CASCADE;
    DROP TABLE IF EXISTS "site_about_disciplines" CASCADE;

    ALTER TABLE "site" DROP CONSTRAINT IF EXISTS "site_about_portrait_id_media_id_fk";
    DROP INDEX IF EXISTS "site_about_about_portrait_idx";

    ALTER TABLE "site" DROP COLUMN IF EXISTS "about_portrait_id";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "about_heading";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "about_standfirst";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "about_bio";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "about_based_in";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "about_availability";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "contact_intro";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "contact_availability";
  `)
}
