import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Payload loads sharp at module scope, so it must stay a real Node module
   * rather than being bundled by Turbopack.
   *
   * Do NOT add `outputFileTracingIncludes` for sharp's `@img/*` packages: the
   * platform variants total ~116 MB, and including them under a `'/**'` key
   * copies that into every route until the deployment upload fails with a bare
   * "unexpected error" after an otherwise green build. Keeping sharp on the
   * same version Next depends on lets Vercel's builder supply the native
   * binary instead.
   */
  serverExternalPackages: ['sharp'],

  images: {
    /**
     * Uploads live on the local filesystem until BLOB_READ_WRITE_TOKEN is set,
     * at which point Payload rewrites every media URL to a Blob host. Without
     * this pattern next/image answers 400 for all of them.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

export default withPayload(nextConfig)
