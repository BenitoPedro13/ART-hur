# TASK: Media client uploads on Vercel

## Current scenario

Production `/admin` media uploads go through the Next.js serverless route. Vercel caps
that request body at ~4.5 MB, so large portfolio stills fail even though Blob storage
can accept much larger objects.

`vercelBlobStorage` is enabled when `BLOB_READ_WRITE_TOKEN` is set, but uploads still
used the server path.

## Planned changes

- Set `clientUploads: true` on `vercelBlobStorage` in `payload.config.ts` so the admin
  browser uploads directly to Vercel Blob via signed URLs; Payload only persists metadata
  and runs Sharp derivatives server-side after the blob is stored.

## Why

Arthur's project galleries use full-resolution photography. The 4.5 MB cap blocks normal
CMS workflow on the deployed admin.

## Affected files

- `payload.config.ts`

## Assumptions

- `BLOB_READ_WRITE_TOKEN` remains set on Vercel (Blob store linked to the project).
- Admin import map already registers `VercelBlobClientUploadHandler` (no schema change).
- Vercel Blob platform limits still apply; this removes the serverless body cap only.

## Upload compression (same task)

- `formatOptions` on the main file and each `imageSizes` entry: WebP at tiered quality.
- `resizeOptions` on the main file: cap width at 4096px, never upscale (`withoutEnlargement: true`).
- EXIF stays stripped (`withMetadata` default).

Existing media keeps its stored files until re-uploaded.

## Verification

- `pnpm typecheck`
- After deploy: upload a file > 4.5 MB in `/admin` → Media.
- Compare byte size of original vs hero derivative on a new upload.

## Regression: missing originals (2026-09-22)

Main-file `formatOptions`/`resizeOptions` do not work with `clientUploads`: the browser
uploads `IMG_x.jpg` to Blob, Payload renames the record to `IMG_x.webp`, and the
converted main file is never uploaded. 24 records (ids 117–140) point at originals that
404. Galleries mostly read `hero`, so only images narrower than 1920px (no `hero`
derivative: ids 120, 137) showed as broken.

- Removed `formatOptions` and `resizeOptions` from the main upload; derivatives keep WebP.
- Existing records need their `.webp` original written to Blob (converted from the
  stored `.jpg`) or a re-upload.
