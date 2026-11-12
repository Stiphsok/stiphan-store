# STIPHAN STORE — project status

Updated: 2026-11-09

## What is available

- The storefront source is in this `source/` project.
- The current public Netlify storefront is [frabjous-empanada-b618a0.netlify.app](https://frabjous-empanada-b618a0.netlify.app/).
- A local Vite preview was started at `http://127.0.0.1:5173/` and opened successfully in the browser during this session.
- The project uses Supabase Auth for admin sign-in and Supabase Storage for the Arena upload flow (`src/lib/supabase.ts`).
- Favorites, STC balance, and theme ownership remain browser-local by design.
- Admin-managed games, apps, and themes now read/write through a Supabase catalog service, with the local catalog cache used as an offline fallback.
- APK, ZIP, and admin-uploaded catalog images now use Supabase Storage URLs rather than browser IndexedDB.

## Work completed in this session

1. Reviewed the storefront documentation and Supabase integration.
2. Confirmed the repository has Supabase project URL and public anon-key configuration. No database password or service-role key was used or exposed.
3. Verified public anon-key read access and expected column names for `store_games`, `store_apps`, and `store_themes` with HTTP 200 responses. The follow-up `store_hidden_items` table returned 404, confirming that the visibility/Storage migration below is still required.
4. Added `src/lib/supabase-catalog.ts` with public catalog reads, admin upserts/deletes, and storage metadata handling.
5. Connected storefront and admin catalog behavior to Supabase. Approved admins migrate missing built-in games/apps, theme seeds, and legacy local catalog rows on their first online catalog load. Existing cloud rows are not overwritten by that migration.
6. Changed APK, ZIP, and image uploads to Supabase Storage and store their public URLs and metadata in `store_apps`.
7. Added `supabase/catalog-storage-visibility.sql` for shared hidden-item IDs, public bucket downloads, and admin-only object deletion. The existing base schema was reported as already applied, but this new follow-up migration has not been applied or verified against the live project.
8. Updated `readme.md` and preserved favorites/STC/theme ownership in local storage.
9. TypeScript validation passed with `npx tsc --noEmit`.
10. The full production build (`npm run build`) passed, and all 4 archive validation tests passed.

## What has not been done

- The new `catalog-storage-visibility.sql` migration has **not** been run against the live Supabase project. Until it is applied, cross-device hiding of built-in items may fail and public bucket downloads may not work.
- Public catalog reads and table column names were verified, but admin writes, owner authorization, and Storage uploads/downloads have not yet been smoke-tested against the live project.
- No APK/image upload was verified end-to-end in Supabase Storage or across visitor devices.
- No Netlify deployment was made; the public link above is the existing deployed site, not a deployment performed in this session.

## Remaining work, in order

1. Run `supabase/catalog-storage-visibility.sql` in the existing Supabase project and verify the bucket and policies in the dashboard.
2. Verify that admin UID `3539810e-7c19-4bda-bd74-f14984516c9f` has an entry in `store_admins` and can sign in.
3. Test admin edits, hides/deletes, and an APK/image upload using the live project; public catalog reads and table columns already returned HTTP 200.
4. Deploy the validated build to Netlify and verify the live site. No deployment was requested or performed.

## Access and source-control notes

- Direct live database changes were not performed. The user reports that the base schema is already applied; the follow-up Storage/visibility migration still requires project authorization.
- Do not share a Supabase `service_role` key or database password in chat. Use the Supabase dashboard while signed into the project owner account.
- The workspace started without any Git commits, and `git status` reports the repository files as untracked. No commit was created.
