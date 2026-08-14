# ART'hur

Arthur's immersive portfolio, built as a branded reiteration of `portfolio-template`.

The visual direction is **Marked Frequencies**: a living archive with rhythm, built from contact sheets, frame metadata, street-culture marks, restrained motion, and one assertive ART'hur tag per visual region.

## Source of truth

- Brand and experience spec: `docs/BRAND-AND-EXPERIENCE-SPEC.md`
- Workflow rules copied from Blessed Moon: `CLAUDE.md`
- App foundation: Next.js App Router, Payload CMS, Tailwind CSS v4, shadcn-compatible components

## First run

```bash
pnpm install
cp .env.example .env
```

Fill in at least:

```bash
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
PORTFOLIO_LOCALES=pt,en
PORTFOLIO_DEFAULT_LOCALE=pt
```

Then seed starter content and run the app:

```bash
pnpm seed
pnpm dev
```

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Design rules

- Core recedes. Patterns structure. Motion guides. Sula asserts. Atmospheres are the room.
- At most one sula element per bounded region.
- Use the Living Tag sparingly. It is a signature, not a texture.
- Graffiti/custom lettering is for marks and stamps, not body copy or controls.
- Project media, credits, roles, and contact paths must stay clear with reduced motion enabled.

## Component workflow

- Prefer USVA components through the shadcn-compatible registry.
- Use shadcn CLI docs/view/add for shadcn components.
- Use AlignUI only after reading current docs and using its CLI.
- Use React Bits or Aceternity only when the effect has a clear storytelling job and passes the one-sula audit.

## Scripts

```bash
pnpm dev          # start Next.js
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm seed         # ART'hur starter content
pnpm seed:demo    # inherited template demo content
```

## Local references

The large `.mov` recordings in `docs/` are local reference material and are intentionally ignored by Git.
