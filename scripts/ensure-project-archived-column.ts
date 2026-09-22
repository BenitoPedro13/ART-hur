/**
 * Idempotent schema guard for production builds.
 *
 * `payload migrate` prompts when dev-mode schema push left a batch -1 migration
 * row, which hangs Vercel. This runs the one column the archive feature needs.
 */
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import config from '../payload.config'

const payload = await getPayload({ config })

const db = payload.db.drizzle

await db.execute(sql`
  ALTER TABLE "projects"
    ADD COLUMN IF NOT EXISTS "archived" boolean DEFAULT false;
`)

payload.logger.info('Ensured projects.archived column exists.')
process.exit(0)
